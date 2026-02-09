// src/utils/codes.js
// ✅ 5 xonali / 6 xonali kod generatsiya qilish
function generateNumericCode(length = 5) {
  // Masalan: length=5 => 10000..99999
  const min = Math.pow(10, length - 1);
  const max = Math.pow(10, length) - 1;
  return String(Math.floor(Math.random() * (max - min + 1)) + min);
}

module.exports = { generateNumericCode };
