const router = require("express").Router();
const { upload } = require("./upload");

const authController = require("../controllers/auth.controller");

// ✅ Student signup (multipart/form-data)
// Fields: email, password, firstName, lastName, age, image(file)
router.post(
  "/student/signup",
  upload.single("image"),
  authController.studentSignup,
);

// ✅ Signin (json)
router.post("/signin", authController.signin);

// ✅ Logout (cookie clear)
router.post("/logout", authController.logout);

// ✅ Forgot password (json: {email})
router.post("/forgot-password", authController.forgotPassword);

// ✅ Reset password (json: {email, code, newPassword})
router.post("/reset-password", authController.resetPassword);

// ✅ Refresh (cookie’dagi refresh token orqali yangi access token olish)
router.post("/refresh", authController.refresh);

module.exports = router;
