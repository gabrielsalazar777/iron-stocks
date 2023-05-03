const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      trim: true,
      required: [true, "Email field is required."],
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please use a valid email address."],
    },
    username: {
      type: String,
      required: [true, "Username field is required."],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password field is required"],
    },
    portfolios: [{ type: Schema.Types.ObjectId, ref: "Portfolio" }],
  },
  {
    timestamps: true,
  }
);

module.exports = model("User", userSchema);
