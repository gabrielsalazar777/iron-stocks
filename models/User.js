const { Schema, model } = require("mongoose");

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: [true, "Email field is required."],
      unique: true,
    },
    username: {
      type: String,
      required: [true, "Username field is required."],
      unique: true,
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
