const jwt = require("jsonwebtoken");

const verifyAuth = async (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (token == null) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    console.log(err);
    console.log(user);

    if (err) return res.sendStatus(401);

    req.user = user;

    next();
  });
};

module.exports = verifyAuth;
