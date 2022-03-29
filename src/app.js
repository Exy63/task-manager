const express = require("express");
require("./db/mongoose");

// User
const userRouter = require("./routers/user");
// Task
const taskRouter = require("./routers/task");

const app = express();

app.use(express.json());

// Routers
app.use(userRouter);
app.use(taskRouter);


module.exports = app
