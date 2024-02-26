const router = require("express").Router();

const { registerUser, loginUser, forgotPassword, resetPassword } = require("../controllers/auth.controller");
const { validateFields } = require("../middlewares/validateFields");

router.post(
  "/register",
  validateFields(["email", "password", "firstname", "lastname", "username"]),
  registerUser
);
router.post(
  "/login",
  validateFields([ "password",  "username"]),
  loginUser
);
router.post(
    "/forgot-password",
    validateFields(["email"]),
    forgotPassword
    );
router.post(
    "/reset-password",
    validateFields(["email", "code", "password"]),
    resetPassword
    );


module.exports = router;
