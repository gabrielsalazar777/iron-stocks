const { Schema, model } = require("mongoose");

const stockSchema = new Schema(
  {
    ticker: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = model("Stock", stockSchema);
