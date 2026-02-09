// src/utils/file.js
const fs = require("fs");
const path = require("path");

// ✅ Eski rasmni diskdan o‘chirish (xatoni yutamiz)
function safeUnlink(filePath) {
  if (!filePath) return;

  // imagePath: "uploads/filename.jpg"
  const abs = path.join(process.cwd(), filePath);

  fs.unlink(abs, (err) => {
    // ✅ Fayl bo‘lmasa ham tizim yiqilmasin
    if (err) return;
  });
}

module.exports = { safeUnlink };
