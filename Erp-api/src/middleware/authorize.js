const SUPER_ADMIN = "super_admin";

function authorizeRoles(...allowed) {
  return (req, res, next) => {
    const roles = (req.user && req.user.roles) || [];

    if (roles.includes(SUPER_ADMIN)) {
      return next();
    }

    if (allowed.length === 0) {
      return next();
    }

    const ok = allowed.some((role) => roles.includes(role));
    if (!ok) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}

function authorizePermissions(...required) {
  return (req, res, next) => {
    const roles = (req.user && req.user.roles) || [];

    if (roles.includes(SUPER_ADMIN)) {
      return next();
    }

    if (required.length === 0) {
      return next();
    }

    const permissions = (req.user && req.user.permissions) || [];
    const ok = required.some((perm) => permissions.includes(perm));

    if (!ok) {
      return res.status(403).json({ message: "Forbidden" });
    }

    return next();
  };
}

module.exports = { authorizeRoles, authorizePermissions, SUPER_ADMIN };
