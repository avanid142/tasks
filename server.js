require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const path = require("path");

const app = express();
const PORT = process.nextTick.port || 3000;

// --------------------
// Middleware
// --------------------
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public"));

// --------------------
// Fake Database
// --------------------
const users = [
  { username: "admin", password: "1234" }
];

// tasks structure:
// {
//   username: [
//     { text: "Task name", done: false, due: "YYYY-MM-DD" | null }
//   ]
// }
const tasks = {};

// --------------------
// Auth Middleware
// --------------------
function auth(req, res, next) {
  const token = req.cookies.token;
  if (!token) return res.redirect("/");

  try {
    const decoded = jwt.verify(token, "secret123");
    req.user = decoded.username;

    // ensure user task list exists
    if (!tasks[req.user]) {
      tasks[req.user] = [];
    }

    next();
  } catch {
    res.redirect("/");
  }
}

// --------------------
// Routes
// --------------------

// Home → Login page
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/login.html"));
});

// Login
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  const user = users.find(
    u => u.username === username && u.password === password
  );

  if (!user) {
    return res.json({ success: false });
  }

  const token = jwt.sign(
    { username },
    "secret123",
    { expiresIn: "1h" }
  );

  res.cookie("token", token, { httpOnly: true });

  if (!tasks[username]) {
    tasks[username] = [];
  }

  res.json({ success: true });
});

// Dashboard (Protected)
app.get("/dashboard", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "public/dashboard.html"));
});

// --------------------
// Tasks API
// --------------------

// Get Tasks
app.get("/tasks", auth, (req, res) => {
  res.json(tasks[req.user]);
});

// Add Task (FIXED)
// Add Task (FIXED FOR DUE DATE)
app.post("/tasks", auth, (req, res) => {
  const { text, done, due } = req.body.task;

  if (!tasks[req.user]) tasks[req.user] = [];

  tasks[req.user].push({
    text: text || "",
    done: done || false,
    due: due || null
  });

  res.sendStatus(200);
});


// Toggle Task Complete
app.put("/tasks/:id", auth, (req, res) => {
  const task = tasks[req.user][req.params.id];
  if (task) {
    task.done = !task.done;
  }
  res.sendStatus(200);
});

// Delete Task
app.delete("/tasks/:id", auth, (req, res) => {
  tasks[req.user].splice(req.params.id, 1);
  res.sendStatus(200);
});

// Logout
app.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.sendStatus(200);
});

// --------------------
// Server Start (UNCHANGED)
// --------------------
app.listen(PORT, () => {
  console.log(`Server running on port${PORT}`);
});

