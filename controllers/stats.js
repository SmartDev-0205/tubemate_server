const User = require("../models/User");
const Transaction = require("../models/Transaction");

const getStats = async (req, res) => {
  try {
    const users = await User.countDocuments({ isAdmin: false }).exec();
    const transactions = await Transaction.find({}).exec();

    let withdraw = 0;
    transactions.forEach((el) => {
      withdraw += el.amount;
    });

    res.status(200).json({
      users,
      transactions: transactions.length,
      withdraw: withdraw,
      watch: 0,
    });
  } catch (error) {
    console.log(">> Err: ", error);
    res.status(400).json({
      message: "withdraw failed",
    });
  }
};

module.exports = {
  getStats,
};
