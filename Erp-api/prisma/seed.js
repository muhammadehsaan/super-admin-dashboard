const { PrismaClient } = require("../generated/prisma");
const { PERMISSION_LIST } = require("../src/permissions");

const prisma = new PrismaClient();

const ROLES = [
  "super_admin",
  "admin",
  "manager",
  "accountant",
  "employee",
];

async function main() {
  const permissionRecords = [];
  for (const name of PERMISSION_LIST) {
    const permission = await prisma.permission.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    permissionRecords.push(permission);
  }

  const roleRecords = [];
  for (const name of ROLES) {
    const role = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name },
    });
    roleRecords.push(role);
  }

  const superAdmin = roleRecords.find((role) => role.name === "super_admin");
  if (superAdmin) {
    await prisma.rolePermission.createMany({
      data: permissionRecords.map((permission) => ({
        roleId: superAdmin.id,
        permissionId: permission.id,
      })),
      skipDuplicates: true,
    });
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
    await prisma.$disconnect();
  });
