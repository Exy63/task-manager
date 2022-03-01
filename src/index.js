const express = require("express");
require("./db/mongoose");

// User
const userRouter = require("./routers/user");
// Task
const taskRouter = require("./routers/task");

const app = express();
const port = process.env.PORT || 3000;

const multer = require("multer");
const upload = multer({
  dest: "images",
});
app.post("/upload", upload.single('upload'), (req, res) => {
  res.send();
});

app.use(express.json());
// Routers
app.use(userRouter);
app.use(taskRouter);

app.listen(port, () => {
  console.log("Server is up and running on port", port);
});
