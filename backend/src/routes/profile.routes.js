const router = require("express").Router();
const { auth } = require("../middlewares/auth");
const { upload } = require("./upload");

const profileController = require("../controllers/profile.controller");

// ✅ Profile
router.get("/", auth, profileController.getProfile);

// ✅ Update profile (multipart/form-data)
// optional fields: firstName, lastName, age, image(file)
router.put("/", auth, upload.single("image"), profileController.updateProfile);

// ✅ Delete account: 1) request code (json: {email})
router.post("/delete/request", auth, profileController.requestDeleteAccount);

// ✅ Delete account: 2) confirm code (json: {email, code})
router.post("/delete/confirm", auth, profileController.confirmDeleteAccount);

module.exports = router;
