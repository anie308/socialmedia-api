const jwt = require("jsonwebtoken");

// const User = require("../models/user.model");

const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.split(" ")[1];
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err)
        res.status(403).json({
          statusCode: 403,
          status: false,
          message: "Forbidden: Invalid token",
        });
      req.user = user;
      next();
    });
  } else {
    return res.status(401).json({
      statusCode: 401,
      status: false,
      message: "Unauthorized: Bearer token not provided",
    });
  }
};



module.exports = { verifyToken };
