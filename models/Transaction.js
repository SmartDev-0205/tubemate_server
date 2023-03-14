const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const transactionSchema = new Schema(
  {
    amount: { type: Number },
    user: { type: Schema.Types.ObjectId, ref: "User" },
    btcWallet: { type: String },
    status: { type: String, default: "pending" }, // pending, paid, cancel
  },
  {
    timestamps: true,
  }
);

const Transaction = mongoose.model("Transaction", transactionSchema);

module.exports = Transaction;
