const request = require("supertest");
const app = require("../src/app");
const Task = require("../src/models/task");
const {
  userOne,
  userTwo,
  taskOne,
  taskTwo,
  taskThree,
  setupDatabase,
} = require("./fixtures/db");

beforeEach(setupDatabase);

test("Should create task for user", async () => {
  const res = await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ description: "From my test" })
    .expect(201);

  const task = await Task.findById(res.body._id);
  expect(task).not.toBeNull();
  expect(task.completed).toBe(false);
});

test("Should fetch user tasks", async () => {
  const res = await request(app)
    .get("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(res.body.length).toBe(2);
});

test("Should not delete other users tasks", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);

  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});

test("Should not create task with invalid description/completed", async () => {
  await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ description: [null] })
    .expect(400);

  await request(app)
    .post("/tasks")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ comleted: 23 })
    .expect(400);
});

test("Should not update task with invalid description/completed", async () => {
  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ description: [-0] })
    .expect(400);

  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ completed: 100 })
    .expect(400);

  const task = await Task.findById(taskOne._id);
  expect(task.description).toBe(taskOne.description);
  expect(task.completed).toBe(taskOne.completed);
});

test("Should delete user task", async () => {
  await request(app)
    .delete(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const task = await Task.findById(taskOne._id);
  expect(task).toBeNull();
});

test("Should not delete task if unauthenticated", async () => {
  await request(app).delete(`/tasks/${taskOne._id}`).send().expect(401);

  const task = await Task.findById(taskOne._id);
  expect(task).not.toBeNull();
});

test("Should not update other users task", async () => {
  await request(app)
    .patch(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send({ description: "It should not work" })
    .expect(404);

  const task = await Task.findById(taskOne._id);
  expect(task.description).toBe(taskOne.description);
});

test("Should fetch user task by id", async () => {
  const res = await request(app)
    .get(`/tasks/${taskThree._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(200);

  const task = await Task.findById(taskThree._id);
  expect(res.body.description).toBe(task.description);
});

test("Should not fetch user task by id if unauthenticated", async () => {
  await request(app).get(`/tasks/${taskOne._id}`).send().expect(401);
});

test("Should not fetch other users task by id", async () => {
  await request(app)
    .get(`/tasks/${taskOne._id}`)
    .set("Authorization", `Bearer ${userTwo.tokens[0].token}`)
    .send()
    .expect(404);
});

test("Should fetch only completed tasks", async () => {
  const res = await request(app)
    .get("/tasks?completed=true")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(res.body[0].description).toBe(taskTwo.description);
  expect(res.body.length).toBe(1);
});

test("Should fetch only incompleted tasks", async () => {
  const res = await request(app)
    .get("/tasks?completed=false")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(res.body[0].description).toBe(taskOne.description);
  expect(res.body.length).toBe(1);
});

test("Should sort tasks by description/completed/createdAt/updatedAt", async () => {
  // Created At sorting
  const createdAtRes = await request(app)
    .get("/tasks?sortBy=createdAt:desc")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(createdAtRes.body[0].description).toBe(taskTwo.description);
  expect(createdAtRes.body[1].description).toBe(taskOne.description);
  expect(createdAtRes.body.length).toBe(2);

  // Updated At sorting
  const updatedAtRes = await request(app)
    .get("/tasks?sortBy=updatedAt:asc")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(updatedAtRes.body[0].description).toBe(taskOne.description);
  expect(updatedAtRes.body[1].description).toBe(taskTwo.description);
  expect(updatedAtRes.body.length).toBe(2);

  // Completed sorting
  const completedRes = await request(app)
    .get("/tasks?sortBy=completed:desc")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(completedRes.body[0].completed).toBe(taskTwo.completed);
  expect(completedRes.body[1].completed).toBe(taskOne.completed);
  expect(completedRes.body.length).toBe(2);

  // Description sorting
  const descriptionRes = await request(app)
    .get("/tasks?sortBy=description:desc")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(descriptionRes.body[0].description).toBe(taskTwo.description);
  expect(descriptionRes.body[1].description).toBe(taskOne.description);
  expect(descriptionRes.body.length).toBe(2);
});

test("Should fetch page of tasks", async () => {
  const res = await request(app)
    .get("/tasks?limit=1&skip=1")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  expect(res.body[0].description).toBe(taskTwo.description);
  expect(res.body[1]).toBe(undefined);
});
