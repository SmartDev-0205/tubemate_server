var express = require("express");
var router = express.Router();
const userCtl = require("../controllers/user");
const verifyAuth = require("../middleware/auth");

/* GET users listing. */
router.get("/", verifyAuth, userCtl.getUsers);
router.delete("/:id", verifyAuth, userCtl.deleteUserWithId);
router.get("/updatereferral",verifyAuth,userCtl.updateReferralBonus);


//updateReferralBonus

module.exports = router;
