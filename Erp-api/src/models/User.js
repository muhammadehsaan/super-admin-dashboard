const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    name: { type: String, trim: true },
    passwordHash: { type: String, required: true },
    isActive: { type: Boolean, default: true },
    roles: [{ type: mongoose.Schema.Types.ObjectId, ref: "Role" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);
