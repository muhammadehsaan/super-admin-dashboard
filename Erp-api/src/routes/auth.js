const express = require("express");
require("../models");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");
const auth = require("../middleware/auth");
const { PERMISSION_LIST } = require("../permissions");
const { SUPER_ADMIN } = require("../middleware/authorize");

const router = express.Router();

function collectPermissions(user) {
  const permissions = new Set();
  for (const role of user.roles || []) {
    const rolePermissions = role.permissions || [];
    for (const permission of rolePermissions) {
      if (permission && permission.name) {
        permissions.add(permission.name);
      }
    }
  }
  return Array.from(permissions);
}

router.post("/super-admin", async (req, res) => {
  try {
    const { email, password, name } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const role = await Role.findOneAndUpdate(
      { name: SUPER_ADMIN },
      { $setOnInsert: { name: SUPER_ADMIN } },
      { upsert: true, new: true }
    );

    const existingSuper = await User.findOne({ roles: role._id });
    if (existingSuper) {
      return res.status(409).json({ message: "Super admin already exists" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already in use" });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await User.create({
      email: normalizedEmail,
      name,
      passwordHash,
      roles: [role._id],
    });

    return res.status(201).json({
      id: user.id,
      email: user.email,
      name: user.name,
      roles: [SUPER_ADMIN],
      permissions: PERMISSION_LIST,
    });
  } catch (err) {
    return res.status(500).json({ message: "Failed to create super admin" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail })
      .populate({ path: "roles", populate: { path: "permissions" } })
      .exec();

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET not configured" });
    }

    const token = jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
      expiresIn: "8h",
    });

    const roles = user.roles.map((role) => role.name);
    let permissions = collectPermissions(user);

    if (roles.includes(SUPER_ADMIN)) {
      permissions = PERMISSION_LIST.slice();
    }

    return res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles,
        permissions,
      },
    });
  } catch (err) {
    console.error("Login failed:", err);
    const payload = { message: "Login failed" };
    if (process.env.NODE_ENV !== "production") {
      payload.error = err.message;
    }
    return res.status(500).json(payload);
  }
});

router.get("/me", auth, async (req, res) => {
  return res.json({ user: req.user });
});

module.exports = router;
