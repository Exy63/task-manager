const express = require("express");
const Task = require("../models/task");

const router = new express.Router();

/**
 * CREATE TASK
 * */
router.post("/tasks", async (req, res) => {
  const task = new Task(req.body);
  try {
    await task.save();
    res.status(201).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

/**
 * GET TASKS
 */
router.get("/tasks", async (req, res) => {
  try {
    const tasks = await Task.find({});
    res.send(tasks);
  } catch (e) {
    res.status(500).send(e);
  }
});

/**
 * GET TASK BY ID
 */
router.get("/tasks/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const task = await Task.findById(id);
    if (!task) {
      res.status(404).send();
    }
    res.send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

/**
 * UPDATE TASK
 */
router.patch("/tasks/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["completed", "description"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const task = await Task.findById(req.params.id);

    updates.forEach(update => task[update] = req.body[update]);
    await task.save();

    if (!task) {
      res.status(404).send();
    }

    res.status(200).send(task);
  } catch (e) {
    res.status(400).send(e);
  }
});

/**
 * DELETE TASK
 */
router.delete("/tasks/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const task = await Task.findByIdAndDelete(id);

    if (!task) {
      res.status(404).send({ error: "Task not found" });
    }

    res.status(200).send(task);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
