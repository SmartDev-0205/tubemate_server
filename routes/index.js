var express = require('express');
var router = express.Router();

const authRouter = require('./auth');
const transactionRouter = require('./transaction');
const statsRouter = require('./stats');
const userRouter = require('./users');
const stripeRouter = require('./stripe');

router.use('/auth', authRouter);
router.use('/stats', statsRouter);
router.use('/transactions', transactionRouter);
router.use('/users', userRouter);
router.use('/subscription', stripeRouter);

module.exports = router;
