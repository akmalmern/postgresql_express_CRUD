const multer = require("multer");
const path = require("path");
const AppError = require("../utils/AppError");

// ✅ Fayl nomi unik bo‘lsin
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads"),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, name);
  },
});

// ✅ Faqat rasm formatlari
function fileFilter(req, file, cb) {
  const ok = ["image/jpeg", "image/png", "image/webp"].includes(file.mimetype);
  if (!ok) {
    // ⚠️ Multer cb(err) qilsa errorHandler ushlab qoladi
    return cb(
      new AppError("Faqat JPG/PNG/WEBP rasm yuklash mumkin", 400, {
        code: "INVALID_FILE_TYPE",
      }),
      false,
    );
  }
  cb(null, true);
}

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // ✅ 2MB
});

module.exports = { upload };
