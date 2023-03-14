const router = require("express").Router();
const transactionCtl = require("../controllers/transaction");
const verifyAuth = require("../middleware/auth");

router.get("/me", verifyAuth, transactionCtl.getMyTransactions);
router.get("/:id", verifyAuth, transactionCtl.getTransactionWithId);
router.put("/:id", verifyAuth, transactionCtl.updateTransactionStatus);
router.delete("/:id", verifyAuth, transactionCtl.deleteTransaction);
router.post("/withdraw", verifyAuth, transactionCtl.createWithdraw);
router.get("/", verifyAuth, transactionCtl.getAllTransactions);

module.exports = router;
