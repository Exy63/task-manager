const express = require("express");
require("./db/mongoose");

// User
const userRouter = require("./routers/user");
// Task
const taskRouter = require("./routers/task");
// // Auth
// const auth = require("./middleware/auth");

const app = express();
const port = process.env.PORT || 3000;

// // Middleware
// app.use(auth);

app.use(express.json());
// Routers
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("Server is up and running on port", port);
});
