const router = require("express").Router();
const statsCtl = require("../controllers/stats");

router.get("/", statsCtl.getStats);

module.exports = router;
