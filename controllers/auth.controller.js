const cryptoJs = require("crypto-js");
const jwt = require("jsonwebtoken");
const brevo = require("@getbrevo/brevo");

const User = require("../models/user.model");
const Code = require("../models/resetCode.model");

const tranEmailApi = new brevo.TransactionalEmailsApi();
tranEmailApi.setApiKey(brevo.AccountApiApiKeys.apiKey, process.env.SIB_KEY);

const sender = {
  email: process.env.EMAIL,
};

const registerUser = async (req, res) => {
  const { username, firstname, lastname, email, password } = req.body;
  try {
    const alreadyExists = await User.findOne({ email });
    const usernameInUse = await User.findOne({ username });

    if (alreadyExists) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: "User already Exists",
      });
    } else if (usernameInUse) {
      return res.status(400).json({
        statusCode: 400,
        status: false,
        message: "Username already in use",
      });
    } else {
      const newUser = new User({
        username,
        email,
        firstname,
        lastname,
        password: cryptoJs.AES.encrypt(
          password,
          process.env.PASS_SEC
        ).toString(),
      });

      await newUser.save();

      res.status(201).json({
        statusCode: 201,
        status: true,
        message: "Registration successful, Login to continue",
      });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      status: false,
      message: "Internal Server Error",
    });
  }
};

const loginUser = async (req, res) => {
  const { username, password } = req.body;

  try {
    const isExistingUser = await User.findOne({ username });

    if (!isExistingUser) {
      return res.status(401).json({
        statusCode: 400,
        status: false,
        message: "Wrong Credentials!",
      });
    }

    const hashedGuy = cryptoJs.AES.decrypt(
      isExistingUser.password,
      process.env.PASS_SEC
    );
    const decryptedPassword = hashedGuy.toString(cryptoJs.enc.Utf8);

    if (decryptedPassword !== password) {
      return res.status(401).json({
        statusCode: 400,
        status: false,
        message: "Wrong Credentials!",
      });
    }

    const accessToken = jwt.sign(
      {
        id: isExistingUser._id,
        role: isExistingUser.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "3d" }
    );


    res.status(200).json({
      statusCode: 200,
      message: "User Login Suceessful",
      token: accessToken,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
};

const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        statusCode: 404,
        status: false,
        message: "User not found",
      });
    }

    const receiver = [
      {
        email: email,
      },
    ];
    const code = Math.floor(100000 + Math.random() * 900000);

    const newCode = new Code({
      code,
    });

    // const username = user.username;
    await newCode.save();
    res.status(200).json({
      statusCode: 200,
      message: "Otp has been sent to your email",
      code,
    });

  } catch (err) {
    console.log(err);
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
    });
  }
};

const resetPassword = async (req, res) => {
  const { email, code, password } = req.body;

  // Find the code in the database
  const usercode = await Code.findOne({ code });

  // If the code is not found, return an error
  if (!usercode) return res.status(404).json({ message: "Invalid code" });

  // Find the user by email
  const user = await User.findOne({ email });

  // If the user is not found, return an error
  if (!user) return res.status(404).json({ message: "User not found" });

  // Update the user's password
  user.password = cryptoJs.AES.encrypt(password, process.env.PASS_SEC);
  await user.save();

  // Remove the code from the database
  await Code.findOneAndDelete({ code });

  res.status(200).json({
    statusCode: 200,
    message: "Password reset successful",
  });
};

module.exports = {
  registerUser,
  loginUser,
  forgotPassword,
  resetPassword
};
