const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const { upload } = require("./upload");

const profileController = require("../controllers/profile.controller");
const { deleteRequestLimiter } = require("../middlewares/rateLimit");
// ✅ Profile
router.get("/", auth, profileController.getProfile);

// ✅ Update profile (multipart/form-data)
// optional fields: firstName, lastName, age, image(file)
router.put("/", auth, profileController.updateProfile);
// ✅ multipart avatar update
router.put(
  "/avatar",
  auth,
  upload.single("image"),
  profileController.updateAvatar,
);
router.delete("/avatar", auth, profileController.deleteAvatar);

// ✅ Delete account: 1) request code (json: {email})
router.post(
  "/delete/request",
  auth,
  deleteRequestLimiter,
  profileController.requestDeleteAccount,
);

// ✅ Delete account: 2) confirm code (json: {email, code})
router.post("/delete/confirm", auth, profileController.confirmDeleteAccount);

module.exports = router;
