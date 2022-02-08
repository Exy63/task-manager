const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const router = new express.Router();

/**
 * REGISTER
 */
router.post("/users", async (req, res) => {
  const user = new User(req.body);

  try {
    await user.save();

    const token = await user.generateAuthToken();

    res.status(201).send({ user, token });
  } catch (err) {
    res.status(400).send(err);
  }
});

/**
 * LOGIN
 */
router.post("/users/login", async (req, res) => {
  try {
    const user = await User.findByCredentials(
      req.body.email,
      req.body.password
    );
    const token = await user.generateAuthToken();

    res.send({ user, token });
  } catch (e) {
    res.status(400).send();
  }
});

/**
 * LOG OUT
 */
router.post("/users/logout", auth, async (req, res) => {
  try {
    req.user.tokens = req.user.tokens.filter(token => token.token !== req.token);

    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});

/**
 * LOG OUT ALL
 */
 router.post("/users/logoutAll", auth, async (req, res) => {
  try {
    req.user.tokens = []

    await req.user.save();

    res.send();
  } catch (e) {
    res.status(500).send(e);
  }
});


/**
 * READ PROFILE
 */
router.get("/users/me", auth, async (req, res) => {
  res.send(req.user);
});

/**
 * GET USER BY ID
 */
router.get("/users/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const user = await User.findById(id);
    if (!user) {
      res.status(404).send();
    }
    res.send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

/**
 * UPDATE USER
 */
router.patch("/users/:id", async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const user = await User.findById(req.params.id);

    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

    if (!user) {
      res.status(404).send();
    }
    res.status(200).send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

/**
 * DELETE USER
 */
router.delete("/users/:id", async (req, res) => {
  const id = req.params.id;
  try {
    const user = await User.findByIdAndDelete(id);

    if (!user) {
      res.status(404).send({ error: "User not found" });
    }

    res.status(200).send(user);
  } catch (e) {
    res.status(500).send(e);
  }
});

module.exports = router;
