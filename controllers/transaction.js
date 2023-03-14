const User = require("../models/User");
const Transaction = require("../models/Transaction");

const createWithdraw = async (req, res) => {
  try {
    const { use } = req.user;
    const { amount, btcWallet } = req.body;

    const transaction = new Transaction({
      amount,
      btcWallet,
      user: use._id,
      status: "pending",
    });

    await transaction.save();

    // update balance
    const user = await User.findById(use._id).select("-password").exec();
    user.balance = user.balance - amount;
    await user.save();
    res.status(201).json(transaction);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "withdraw failed",
    });
  }
};

const getMyTransactions = async (req, res) => {
  try {
    const { use } = req.user;
    const transactions = await Transaction.find({ user: use._id })
      .populate("user", "-password")
      .sort("-createdAt")
      .exec();

    res.status(200).json(transactions);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "withdraw failed",
    });
  }
};

const getAllTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find()
      .populate("user", "-password")
      .sort("-createdAt")
      .exec();

    res.status(200).json(transactions);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "withdraw failed",
    });
  }
};

const getTransactionWithId = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findById(id)
      .populate("user", "-password")
      .exec();

    res.status(200).json(transaction);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "withdraw failed",
    });
  }
};

const updateTransactionStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const transaction = await Transaction.findById(id)
      .populate("user", "-password")
      .exec();

    transaction.status = status;
    if (status === "cancel") {
      const user = await User.findById(transaction.user._id)
        .select("-password")
        .exec();
      user.balance = user.balance + transaction.amount;
      await user.save();
    }
    await transaction.save();

    res.status(200).json(transaction);
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "withdraw failed",
    });
  }
};

const deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const transaction = await Transaction.findOneAndDelete({ _id: id });
    console.log("transaction: ", transaction);
    res.status(200).json({
      message: "Deleted",
    });
  } catch (error) {}
};

module.exports = {
  createWithdraw,
  getAllTransactions,
  getTransactionWithId,
  getMyTransactions,
  updateTransactionStatus,
  deleteTransaction,
};
