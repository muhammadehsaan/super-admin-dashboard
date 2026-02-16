export const mockUser = {
  name: "Super Admin",
  email: "super@erp.com",
  roles: ["super_admin"],
  permissions: [
    "users:create",
    "users:edit",
    "users:delete",
    "users:view",
    "roles:create",
    "roles:edit",
    "roles:delete",
    "inventory:manage",
    "sales:manage",
    "accounts:manage",
    "reports:view",
    "settings:access",
    "dashboard:access",
    "profile:view",
    "profile:edit",
  ],
};

export const mockStats = {
  users: 128,
  activeUsers: 120,
  roles: 5,
  permissions: 15,
};
