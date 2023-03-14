require("dotenv").config();
const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const mongoose = require("mongoose");
const cors = require("cors");
var nodemailer = require('nodemailer');
const mg = require('nodemailer-mailgun-transport');
const PORT = process.env.PORT;

const indexRouter = require('./routes/index');

const app = express();
app.use(cors());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use("/api", indexRouter);

/* GET home page. */
app.get("/", function (req, res, next) {
  res.render("index", { title: "Express" });
});

app.listen(PORT,'0.0.0.0',() => {
  console.log(`app is listening to PORT ${PORT}`);
});

// connect mongoose
mongoose.set("strictQuery", true);
mongoose.connect(
  `${process.env.MONGO_DATABASE_URL}${process.env.MONGO_DATABASE_NAME}`,
  {
    useNewUrlParser: "true",
  }
);
mongoose.connection.on("error", (err) => {
  console.log("err", err);
});
mongoose.connection.on("connected", (err, res) => {
  console.log("mongoose is connected");
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
