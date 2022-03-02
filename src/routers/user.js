const express = require("express");
const User = require("../models/user");
const auth = require("../middleware/auth");
const router = new express.Router();
const multer = require("multer");

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
    req.user.tokens = req.user.tokens.filter(
      (token) => token.token !== req.token
    );

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
    req.user.tokens = [];

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
 * UPDATE USER
 */
router.patch("/users/me", auth, async (req, res) => {
  const updates = Object.keys(req.body);
  const allowedUpdates = ["name", "email", "password", "age"];
  const isValidOperation = updates.every((update) =>
    allowedUpdates.includes(update)
  );

  if (!isValidOperation) {
    return res.status(400).send({ error: "Invalid updates!" });
  }

  try {
    const user = req.user;

    updates.forEach((update) => (user[update] = req.body[update]));
    await user.save();

    res.send(user);
  } catch (e) {
    res.status(400).send(e);
  }
});

/**
 * DELETE USER
 */
router.delete("/users/me", auth, async (req, res) => {
  try {
    await req.user.remove();

    res.send(req.user);
  } catch (e) {
    res.status(500).send(e);
  }
});

const upload = multer({
  limits: {
    fileSize: 1000000, // 1MB
  },
  fileFilter(req, file, cb) {
    if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
      return cb(new Error("Please upload an image"));
    }

    cb(undefined, true);
  },
});

/**
 * UPLOAD AVATAR
 */
router.post(
  "/users/me/avatar",
  auth,
  upload.single("avatar"),
  async (req, res) => {
    req.user.avatar = req.file.buffer;
    await req.user.save();
    res.send();
  },
  (error, req, res, next) => {
    res.status(404).send({ error: error.message });
  }
);

/**
 * DELETE AVATAR
 */
router.delete("/users/me/avatar", auth, async (req, res) => {
  req.user.avatar = undefined;
  await req.user.save();
  res.send();
});

/**
 * SERVE USER`S AVATAR
 */
router.get("/users/:id/avatar", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user || !user.avatar) {
      throw new Error();
    }

    res.set("Content-Type", "image/jpg");
    res.send(user.avatar);
  } catch (e) {
    res.status(404).send(e);
  }
});

module.exports = router;
