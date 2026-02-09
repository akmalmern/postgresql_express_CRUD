const router = require("express").Router();
const { upload } = require("./upload");

const authController = require("../controllers/auth.controller");
const {
  signinLimiter,
  forgotLimiter,
  refreshLimiter,
} = require("../middlewares/rateLimit");

router.post("/google", authController.googleAuth);

router.post(
  "/student/signup",

  authController.studentSignup,
);

// ✅ Signin (json)
router.post("/signin", signinLimiter, authController.signin);

// ✅ Logout (cookie clear)
router.post("/logout", authController.logout);

// ✅ Forgot password (json: {email})
router.post("/forgot-password", forgotLimiter, authController.forgotPassword);

// ✅ Reset password (json: {email, code, newPassword})
router.post("/reset-password", authController.resetPassword);

// ✅ Refresh (cookie’dagi refresh token orqali yangi access token olish)
router.post("/refresh", refreshLimiter, authController.refresh);

module.exports = router;
