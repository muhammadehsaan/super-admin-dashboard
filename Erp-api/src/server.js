require("dotenv").config();

const express = require("express");
const path = require("path");
const { connectDb } = require("./db");
require("./models");
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const rolesRoutes = require("./routes/roles");
const usersRoutes = require("./routes/users");

const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/health", (req, res) => {
  return res.json({ status: "ok" });
});

app.use("/auth", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/roles", rolesRoutes);
app.use("/users", usersRoutes);

app.use((err, req, res, next) => {
  console.error(err);
  return res.status(500).json({ message: "Internal Server Error" });
});

const PORT = process.env.PORT || 3000;

async function start() {
  await connectDb();
  app.listen(PORT, () => {
    console.log(`ERP API listening on ${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err.message || err);
  process.exit(1);
});
