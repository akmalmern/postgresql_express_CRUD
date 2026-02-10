const prisma = require("../prisma");
const crypto = require("crypto");

const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { mapZodIssues } = require("../middlewares/errorHandler");
const { ok } = require("../utils/respond");

const { safeUnlink } = require("../utils/file");
const { sendMail } = require("../utils/sendMail");
const { generateNumericCode } = require("../utils/codes");
const pickDefined = require("../utils/pickDefined");
const { getCookieOptions } = require("../utils/cookies");

const {
  updateProfileSchema,
  requestDeleteSchema,
  confirmDeleteSchema,
} = require("../validators/profile.schema");

const cookieOptions = getCookieOptions();

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

  if (!user) throw new AppError("NOT_FOUND", 404, { code: "NOT_FOUND" });

  return ok(req, res, { user });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const userId = req.user.sub;

  const parsed = updateProfileSchema.safeParse(req.body);
  if (!parsed.success) throw mapZodIssues(parsed.error.issues);

  const data = pickDefined(parsed.data);

  if (Object.keys(data).length === 0) {
    throw new AppError("NO_FIELDS_TO_UPDATE", 400, {
      code: "NO_FIELDS_TO_UPDATE",
    });
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

  return ok(req, res, { user }, "PROFILE_UPDATED");
});

exports.updateAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.sub;

  if (!req.file) {
    throw new AppError("IMAGE_REQUIRED", 400, { code: "IMAGE_REQUIRED" });
  }

  const newPath = `uploads/${req.file.filename}`;

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, imagePath: true },
  });

  if (!existing) {
    safeUnlink(newPath);
    throw new AppError("NOT_FOUND", 404, { code: "NOT_FOUND" });
  }

  try {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: { imagePath: newPath },
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

    if (existing.imagePath) safeUnlink(existing.imagePath);

    return ok(req, res, { user: updated }, "AVATAR_UPDATED");
  } catch (err) {
    safeUnlink(newPath);
    throw err;
  }
});

exports.deleteAvatar = asyncHandler(async (req, res) => {
  const userId = req.user.sub;

  const existing = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, imagePath: true },
  });

  if (!existing) throw new AppError("NOT_FOUND", 404, { code: "NOT_FOUND" });

  if (!existing.imagePath) {
    return ok(
      req,
      res,
      { user: { id: existing.id, imagePath: null } },
      "AVATAR_ALREADY_DELETED",
    );
  }

  const updated = await prisma.user.update({
    where: { id: userId },
    data: { imagePath: null },
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

  safeUnlink(existing.imagePath);

  return ok(req, res, { user: updated }, "AVATAR_DELETED");
});

exports.requestDeleteAccount = asyncHandler(async (req, res) => {
  const parsed = requestDeleteSchema.safeParse(req.body);
  if (!parsed.success) throw mapZodIssues(parsed.error.issues);

  const email = parsed.data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.id !== req.user.sub) {
    throw new AppError("INVALID_EMAIL", 400, { code: "INVALID_EMAIL" });
  }

  const code = generateNumericCode(5);
  const hash = crypto.createHash("sha256").update(code).digest("hex");
  const exp = new Date(Date.now() + 10 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { deleteCodeHash: hash, deleteCodeExp: exp },
  });

  // ⚠️ email template’ni 3 tilda qilgan bo‘lsangiz shu yerda chaqirasiz
  // const { getEmailTemplate } = require("../utils/emailTemplates");
  // const tpl = getEmailTemplate(req.lang, "deleteAccount", { code, minutes: 10 });

  await sendMail({
    to: email,
    subject: "Delete account code",
    html: `
      <h3>Delete account</h3>
      <p>Your 5-digit code: <b style="font-size:22px">${code}</b></p>
      <p>Expires in 10 minutes.</p>
    `,
  });

  return ok(req, res, {}, "DELETE_CODE_SENT");
});

exports.confirmDeleteAccount = asyncHandler(async (req, res) => {
  const parsed = confirmDeleteSchema.safeParse(req.body);
  if (!parsed.success) throw mapZodIssues(parsed.error.issues);

  const email = parsed.data.email.trim().toLowerCase();
  const { code } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.id !== req.user.sub) {
    throw new AppError("DELETE_REQUEST_INVALID", 400, {
      code: "INVALID_DELETE_REQUEST",
    });
  }

  if (!user.deleteCodeHash || !user.deleteCodeExp) {
    throw new AppError("DELETE_CODE_REQUIRED", 400, {
      code: "DELETE_CODE_REQUIRED",
    });
  }

  if (user.deleteCodeExp.getTime() < Date.now()) {
    throw new AppError("DELETE_CODE_EXPIRED", 400, { code: "CODE_EXPIRED" });
  }

  const hash = crypto.createHash("sha256").update(code).digest("hex");
  if (hash !== user.deleteCodeHash) {
    throw new AppError("DELETE_CODE_INVALID", 400, { code: "INVALID_CODE" });
  }

  safeUnlink(user.imagePath);
  await prisma.user.delete({ where: { id: user.id } });

  res.clearCookie("refreshToken", cookieOptions);
  return ok(req, res, {}, "ACCOUNT_DELETED");
});
