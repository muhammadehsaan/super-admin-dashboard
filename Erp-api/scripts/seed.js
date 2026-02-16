require("dotenv").config();

const mongoose = require("mongoose");
const { connectDb } = require("../src/db");
const Permission = require("../src/models/Permission");
const Role = require("../src/models/Role");
const { PERMISSION_LIST, ROLE_PERMISSIONS } = require("../src/permissions");

const ROLES = Object.keys(ROLE_PERMISSIONS);

async function upsertPermissions() {
  const permissions = [];
  for (const name of PERMISSION_LIST) {
    const permission = await Permission.findOneAndUpdate(
      { name },
      { $setOnInsert: { name } },
      { upsert: true, new: true }
    );
    permissions.push(permission);
  }
  return permissions;
}

async function upsertRoles() {
  const roles = [];
  for (const name of ROLES) {
    const role = await Role.findOneAndUpdate(
      { name },
      { $setOnInsert: { name } },
      { upsert: true, new: true }
    );
    roles.push(role);
  }
  return roles;
}

async function main() {
  await connectDb();

  const permissions = await upsertPermissions();
  const roles = await upsertRoles();
  const permissionMap = new Map(permissions.map((perm) => [perm.name, perm._id]));

  for (const role of roles) {
    const permissionNames = ROLE_PERMISSIONS[role.name] || [];
    role.permissions = permissionNames
      .map((name) => permissionMap.get(name))
      .filter(Boolean);
    await role.save();
  }

  console.log("Seeded roles:", ROLES.join(", "));
  console.log("Seeded permissions:", PERMISSION_LIST.join(", "));
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
