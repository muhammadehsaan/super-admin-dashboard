const express = require("express");
const auth = require("../middleware/auth");
const Role = require("../models/Role");
const { authorizePermissions } = require("../middleware/authorize");
const { PERMISSIONS } = require("../permissions");

const router = express.Router();

router.post("/", auth, authorizePermissions(PERMISSIONS.ROLES_CREATE), async (req, res) => {
  try {
    const { name } = req.body || {};

    if (!name) {
      return res.status(400).json({ message: "Role name is required" });
    }

    const role = await Role.findOneAndUpdate(
      { name },
      { $setOnInsert: { name } },
      { upsert: true, new: true }
    );

    return res.status(201).json(role);
  } catch (err) {
    return res.status(500).json({ message: "Failed to create role" });
  }
});

router.get(
  "/",
  auth,
  authorizePermissions(PERMISSIONS.ROLES_CREATE, PERMISSIONS.ROLES_EDIT, PERMISSIONS.ROLES_DELETE),
  async (req, res) => {
  try {
    const roles = await Role.find().sort({ name: 1 });
    return res.json({ roles });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load roles" });
  }
});

module.exports = router;
