const express = require("express");
const auth = require("../middleware/auth");
const { authorizePermissions } = require("../middleware/authorize");
const { PERMISSIONS } = require("../permissions");
const User = require("../models/User");
const Role = require("../models/Role");
const Permission = require("../models/Permission");

const router = express.Router();

router.get("/summary", auth, authorizePermissions(PERMISSIONS.DASHBOARD_ACCESS), async (req, res) => {
  try {
    const [usersCount, activeUsersCount, rolesCount, permissionsCount] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ isActive: true }),
      Role.countDocuments(),
      Permission.countDocuments(),
    ]);

    return res.json({
      stats: {
        users: usersCount,
        activeUsers: activeUsersCount,
        roles: rolesCount,
        permissions: permissionsCount,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch (err) {
    console.error("Dashboard summary failed:", err);
    return res.status(500).json({ message: "Failed to load dashboard summary" });
  }
});

module.exports = router;
