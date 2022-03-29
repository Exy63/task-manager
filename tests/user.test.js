const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../src/app");

test("Should signup a new user", async () => {
  await request(app).post("/users").send({
    name: "Sofya",
    email: "sofya@mail.com",
    password: "MyPass777!",
  }).expect(201)
});


