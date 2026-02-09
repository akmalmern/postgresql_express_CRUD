const prisma = require("../prisma");
const crypto = require("crypto");

const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { mapZodIssues } = require("../middlewares/errorHandler");

const { safeUnlink } = require("../utils/file");
const { sendMail } = require("../utils/sendMail");
const { generateNumericCode } = require("../utils/codes");

const {
  updateProfileSchema,
  requestDeleteSchema,
  confirmDeleteSchema,
} = require("../validators/profile.schema");

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false,
  path: "/",
};

exports.getProfile = asyncHandler(async (req, res) => {
  const userId = req.user.sub;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      age: true,
      imagePath: true,
      role: true,
      createdAt: true,
    },
  });

  if (!user) throw new AppError("User topilmadi", 404, { code: "NOT_FOUND" });

  res.json({ success: true, user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.sub;

  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) throw mapZodIssues(parsed.error.issues);

  const existing = await prisma.user.findUnique({ where: { id: userId } });
  if (!existing)
    throw new AppError("User topilmadi", 404, { code: "NOT_FOUND" });

  const data = { ...parsed.data };

  // ✅ rasm kelsa eski rasm diskdan o‘chadi
  if (req.file) {
    safeUnlink(existing.imagePath);
    data.imagePath = `uploads/${req.file.filename}`;
  }

  const user = await prisma.user.update({
    where: { id: userId },
    data,
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      age: true,
      imagePath: true,
      role: true,
    },
  });

  res.json({ success: true, message: "Profil yangilandi", user });
});

// ✅ 1) Delete code yuborish (5 xonali)
exports.requestDeleteAccount = asyncHandler(async (req, res) => {
  const parsed = requestDeleteSchema.safeParse(req.body);
  if (!parsed.success) throw mapZodIssues(parsed.error.issues);

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.id !== req.user.sub) {
    throw new AppError("Email noto‘g‘ri", 400, { code: "INVALID_EMAIL" });
  }

  const code = generateNumericCode(5);
  const hash = crypto.createHash("sha256").update(code).digest("hex");
  const exp = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { deleteCodeHash: hash, deleteCodeExp: exp },
  });

  await sendMail({
    to: email,
    subject: "Account o‘chirish kodi",
    html: `
      <h3>Account o‘chirish</h3>
      <p>5 xonali kodingiz: <b style="font-size:22px">${code}</b></p>
      <p>Kod 10 daqiqa amal qiladi.</p>
    `,
  });

  res.json({ success: true, message: "Kod emailingizga yuborildi" });
});

// ✅ 2) Delete confirm
exports.confirmDeleteAccount = asyncHandler(async (req, res) => {
  const parsed = confirmDeleteSchema.safeParse(req.body);
  if (!parsed.success) throw mapZodIssues(parsed.error.issues);

  const { email, code } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.id !== req.user.sub) {
    throw new AppError("Email yoki kod noto‘g‘ri", 400, {
      code: "INVALID_DELETE_REQUEST",
    });
  }

  if (!user.deleteCodeHash || !user.deleteCodeExp) {
    throw new AppError("Avval delete kod so‘rang", 400, {
      code: "DELETE_CODE_REQUIRED",
    });
  }

  if (user.deleteCodeExp.getTime() < Date.now()) {
    throw new AppError("Kod eskirgan", 400, { code: "CODE_EXPIRED" });
  }

  const hash = crypto.createHash("sha256").update(code).digest("hex");
  if (hash !== user.deleteCodeHash) {
    throw new AppError("Kod noto‘g‘ri", 400, { code: "INVALID_CODE" });
  }

  safeUnlink(user.imagePath);

  await prisma.user.delete({ where: { id: user.id } });

  res.clearCookie("refreshToken", cookieOptions);
  res.json({ success: true, message: "Account o‘chirildi" });
});
