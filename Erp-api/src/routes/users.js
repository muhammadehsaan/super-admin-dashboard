const express = require("express");
const bcrypt = require("bcryptjs");
const auth = require("../middleware/auth");
const User = require("../models/User");
const Role = require("../models/Role");
const { authorizePermissions, SUPER_ADMIN } = require("../middleware/authorize");
const { PERMISSIONS } = require("../permissions");

const router = express.Router();

router.post("/", auth, authorizePermissions(PERMISSIONS.USERS_CREATE), async (req, res) => {
  try {
    const { email, password, name, roles } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const roleNames = Array.isArray(roles)
      ? roles
          .map((role) => String(role).trim())
          .filter((role) => role.length > 0)
      : [];

    const roleIds = [];
    for (const roleName of roleNames) {
      const role = await Role.findOneAndUpdate(
        { name: roleName },
        { $setOnInsert: { name: roleName } },
        { upsert: true, new: true }
      );
      roleIds.push(role._id);
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: normalizedEmail,
      name,
      passwordHash,
      roles: roleIds,
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: roleNames,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create user" });
  }
});

router.get("/", auth, authorizePermissions(PERMISSIONS.USERS_VIEW), async (req, res) => {
  try {
    const users = await User.find().populate("roles").sort({ createdAt: -1 });

    const result = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      roles: (user.roles || []).map((role) => role.name),
    }));

    return res.json({ users: result });
  } catch (err) {
    return res.status(500).json({ message: "Failed to load users" });
  }
});

router.patch("/me", auth, authorizePermissions(PERMISSIONS.PROFILE_EDIT), async (req, res) => {
  try {
    const { name, password } = req.body || {};
    const updates = {};

    if (typeof name === "string" && name.trim().length > 0) {
      updates.name = name.trim();
    }

    if (typeof password === "string" && password.length > 0) {
      updates.passwordHash = await bcrypt.hash(password, 10);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No updates provided" });
    }

    const user = await User.findByIdAndUpdate(req.user.id, updates, { new: true });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ id: user.id, email: user.email, name: user.name });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update profile" });
  }
});

router.patch("/:id", auth, authorizePermissions(PERMISSIONS.USERS_EDIT), async (req, res) => {
  try {
    const { name, password, isActive, roles } = req.body || {};
    const updates = {};

    if (typeof name === "string" && name.trim().length > 0) {
      updates.name = name.trim();
    }

    if (typeof password === "string" && password.length > 0) {
      updates.passwordHash = await bcrypt.hash(password, 10);
    }

    if (typeof isActive === "boolean") {
      updates.isActive = isActive;
    }

    if (Array.isArray(roles) && roles.length > 0) {
      if (!req.user.roles.includes(SUPER_ADMIN)) {
        return res.status(403).json({ message: "Only super admin can change roles" });
      }

      const roleNames = roles
        .map((role) => String(role).trim())
        .filter((role) => role.length > 0);

      const roleDocs = await Role.find({ name: { $in: roleNames } });
      updates.roles = roleDocs.map((role) => role._id);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ message: "No updates provided" });
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, { new: true }).populate("roles");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      isActive: user.isActive,
      roles: (user.roles || []).map((role) => role.name),
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to update user" });
  }
});

router.delete("/:id", auth, authorizePermissions(PERMISSIONS.USERS_DELETE), async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({ message: "User deleted" });
  } catch (err) {
    return res.status(500).json({ message: "Failed to delete user" });
  }
});

module.exports = router;
