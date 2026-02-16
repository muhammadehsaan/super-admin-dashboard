require("../models");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { PERMISSION_LIST } = require("../permissions");
const { SUPER_ADMIN } = require("./authorize");

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

async function auth(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing token" });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({ message: "JWT_SECRET not configured" });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(payload.sub)
      .populate({ path: "roles", populate: { path: "permissions" } })
      .exec();

    if (!user || !user.isActive) {
      return res.status(401).json({ message: "Invalid token" });
    }

    const roles = user.roles.map((role) => role.name);
    let permissions = collectPermissions(user);

    if (roles.includes(SUPER_ADMIN)) {
      permissions = PERMISSION_LIST.slice();
    }

    req.user = {
      id: user.id,
      email: user.email,
      roles,
      permissions,
    };

    return next();
  } catch (err) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

module.exports = auth;
