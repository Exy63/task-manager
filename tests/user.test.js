const request = require("supertest");
const app = require("../src/app");
const User = require("../src/models/user");
const { userOneId, userOne, setupDatabase } = require("./fixtures/db");

beforeEach(setupDatabase);

test("Should signup a new user", async () => {
  const res = await request(app)
    .post("/users")
    .send({
      name: "Sofya",
      email: "sofya@mail.com",
      password: "MyPass777!",
    })
    .expect(201);

  // Assert that the database was changed correctly
  const user = await User.findById(res.body.user._id);
  expect(user).not.toBeNull();

  // Assert about the response
  expect(res.body).toMatchObject({
    user: {
      name: "Sofya",
      email: "sofya@mail.com",
    },
    token: user.tokens[0].token,
  });

  // Assert that password has been encrypted
  expect(user.password).not.toBe("MyPass777!");
});

test("Should login existing user", async () => {
  const res = await request(app)
    .post("/users/login")
    .send({ email: userOne.email, password: userOne.password })
    .expect(200);

  const user = await User.findById(userOneId);

  // Assert that token in response matches users second token
  expect(res.body.token).toBe(user.tokens[1].token);
});

test("Should not login nonexistent user", async () => {
  await request(app)
    .post("/users/login")
    .send({ email: userOne.email, password: "wrongPassword!22" })
    .expect(400);
});

test("Should get profile for user", async () => {
  await request(app)
    .get("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);
});

test("Should not get profile for unauthenticated user", async () => {
  await request(app).get("/users/me").send().expect(401);
});

test("Should delete account for user", async () => {
  await request(app)
    .delete("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send()
    .expect(200);

  const user = await User.findById(userOneId);

  // Assert null response
  expect(user).toBeNull();
});

test("Should not delete account for unauthenticated user", async () => {
  await request(app).delete("/users/me").send().expect(401);
});

test("Should upload avatar image", async () => {
  await request(app)
    .post("/users/me/avatar")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .attach("avatar", "tests/fixtures/profile-pic.jpg")
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.avatar).toEqual(expect.any(Buffer));
});

test("Should update valid user fields", async () => {
  const testName = "Jordan";

  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ name: testName })
    .expect(200);

  const user = await User.findById(userOneId);
  expect(user.name).toBe(testName);
});

test("Should not update invalid user fields", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ location: "Calgary" })
    .expect(400);
});

test("Should not signup user with invalid name/email/password", async () => {
  await request(app)
    .post("/users")
    .send({
      name: ["Wrong", "Name"],
      email: "niceemail@mail.com",
      password: "goodPass22890",
    })
    .expect(400);

  await request(app)
    .post("/users")
    .send({
      name: "Anthony",
      email: "wrong-email!",
      password: "nicePass3310",
    })
    .expect(400);

  await request(app)
    .post("/users")
    .send({
      name: "David",
      email: "betteremail@mail.com",
      password: "bad-password",
    })
    .expect(400);
});

test("Should not update user if unauthenticated", async () => {
  await request(app).patch("/users/me").send({ name: "Linn" }).expect(401);
});

test("Should not update user with invalid name/email/password", async () => {
  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ name: { wrong: "name" } })
    .expect(400);

  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ email: 404 })
    .expect(400);

  await request(app)
    .patch("/users/me")
    .set("Authorization", `Bearer ${userOne.tokens[0].token}`)
    .send({ password: "password" })
    .expect(400);
});

test(" Should not delete user if unauthenticated", async () => {
  await request(app).delete("/users/me").send().expect(401);
});
