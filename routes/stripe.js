let express = require('express');
let router = express.Router();
const stripeCtl = require('../controllers/stripe');
const verifyAuth = require('../middleware/auth');

router.post('/', verifyAuth, stripeCtl.createStripeCustomerAndSubscription);

module.exports = router;
