const { Schema, model } = require("mongoose");

const portfolioSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    stocks: [{ type: Schema.Types.ObjectId, ref: "Stock" }],
  },
  {
    timestamps: true,
  }
);

module.exports = model("Portfolio", portfolioSchema);
