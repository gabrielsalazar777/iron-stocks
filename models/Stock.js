const { Schema, model } = require("mongoose");

const stockSchema = new Schema(
  {
    ticker: {
      type: String,
      required: true,
    },
    quote: Array,
  },
  {
    timestamps: true,
  }
);

module.exports = model("Stock", stockSchema);
