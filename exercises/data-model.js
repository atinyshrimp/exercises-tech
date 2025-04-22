// Backend Data Modeling Exercise
//
// This code contains several data modeling issues to address.
// Look for problems related to:
// - Nested vs. flat data structures
// - Route organization
// - Data duplication
// - API consistency
//
// Your task is to refactor this code following proper data modeling principles
// from the Selego Style Guide. Consider the tradeoffs between different approaches.

// models/task.js
const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  text: String,
  createdAt: { type: Date, default: Date.now },
  user_id: String,
  user_name: String,
  user_avatar: String,
});

const taskSchema = new mongoose.Schema(
  {
    title: String,
    description: String,
    status: {
      type: String,
      enum: ["todo", "in_progress", "review", "done"],
      default: "todo",
    },
    createdBy: {
      user_id: String,
      name: String,
      email: String,
      avatar: String,
    },
    assignedTo: {
      user_id: String,
      name: String,
      email: String,
      avatar: String,
    },
    comments: { type: [commentSchema], default: [] },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    dueDate: Date,
  },
  { timestamps: true }
);

const Task = mongoose.model("Task", taskSchema);
module.exports = Task;

// controllers/taskController.js
const express = require("express");
const router = express.Router();
const Task = require("../models/task");
const User = require("../models/user");

// Read a task by ID
router.get("/:id", async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    res.status(200).json({ ok: true, data: task });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Failed to get task" });
  }
});

// Create a new task
router.post("/", async (req, res) => {
  try {
    const { title, description, status, user_id, priority, dueDate } = req.body;

    const user = await User.findById(user_id);
    if (!user)
      return res.status(404).json({ ok: false, error: "User not found" });

    const task = new Task({
      title,
      description,
      status,
      priority,
      dueDate,
      createdBy: {
        user_id: user._id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
      },
    });

    await task.save();
    res.status(201).json({ ok: true, data: task });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Failed to create task" });
  }
});

router.post("/search", async (req, res) => {
  try {
    const query = req.body;
    const tasks = await Task.find(query);
    res.status(200).json({ ok: true, data: tasks });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Failed to search tasks" });
  }
});

// Update a task
router.put("/:id", async (req, res) => {
  try {
    const { title, description, status, priority, dueDate } = req.body;

    const task = await Task.findByIdAndUpdate(
      req.params.id,
      { title, description, status, priority, dueDate },
      { new: true }
    );
    if (!task)
      return res.status(404).json({ ok: false, error: "Task not found" });

    res.status(200).json({ ok: true, data: task });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Failed to update task" });
  }
});

// Delete a task
router.delete("/:id", async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task)
      return res.status(404).json({ ok: false, error: "Task not found" });

    res.status(200).json({ ok: true, data: task });
  } catch (error) {
    res.status(500).json({ ok: false, error: "Failed to delete task" });
  }
});

module.exports = router;
