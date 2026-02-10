const prisma = require("../prisma");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { mapZodIssues } = require("../middlewares/errorHandler");
const { created, ok } = require("../utils/respond");

const {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
} = require("../utils/tokens");

const { sendMail } = require("../utils/sendMail");
const { generateNumericCode } = require("../utils/codes");
const { verifyGoogleIdToken } = require("../utils/google");
const { getCookieOptions } = require("../utils/cookies");

const {
  studentSignupSchema,
  signinSchema,
  forgotSchema,
  resetSchema,
} = require("../validators/auth.schema");

const cookieOptions = getCookieOptions();

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

exports.googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new AppError("ID_TOKEN_REQUIRED", 400, { code: "ID_TOKEN_REQUIRED" });
  }

  const payload = await verifyGoogleIdToken(idToken);

  const email = payload.email.trim().toLowerCase();
  const googleSub = payload.sub;

  const fullName = (payload.name || "").trim();
  const [firstNameRaw, ...rest] = fullName.split(" ");
  const firstName = firstNameRaw || "User";
  const lastName = rest.join(" ") || "Google";

  let user = await prisma.user.findUnique({ where: { googleSub } });

  if (!user) {
    const byEmail = await prisma.user.findUnique({ where: { email } });

    if (byEmail) {
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: { googleSub },
      });
    } else {
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: null, // google user
          firstName,
          lastName,
          age: null,
          imagePath: null,
          role: "STUDENT",
          googleSub,
        },
      });
    }
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash },
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return ok(
    req,
    res,
    {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        imagePath: user.imagePath,
      },
    },
    "AUTH_GOOGLE_SUCCESS",
  );
});

exports.studentSignup = asyncHandler(async (req, res) => {
  const parsed = studentSignupSchema.safeParse(req.body);
  if (!parsed.success) throw mapZodIssues(parsed.error.issues);

  const { email, password, firstName, lastName, age } = parsed.data;
  const normalizedEmail = email.trim().toLowerCase();

  const exists = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (exists) throw new AppError("EMAIL_EXISTS", 409, { code: "EMAIL_EXISTS" });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      passwordHash,
      firstName,
      lastName,
      age,
      imagePath: null,
      role: "STUDENT",
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      imagePath: true,
    },
  });

  return created(req, res, { user }, "USER_CREATED");
});

exports.signin = asyncHandler(async (req, res) => {
  const parsed = signinSchema.safeParse(req.body);
  if (!parsed.success) throw mapZodIssues(parsed.error.issues);

  const email = parsed.data.email.trim().toLowerCase();
  const { password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // ✅ enumeration
  if (!user) {
    throw new AppError("AUTH_INVALID_CREDENTIALS", 401, {
      code: "INVALID_CREDENTIALS",
    });
  }

  // ✅ lock
  if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
    throw new AppError("AUTH_ACCOUNT_LOCKED", 403, { code: "ACCOUNT_LOCKED" });
  }

  // ✅ google-only account
  if (!user.passwordHash) {
    throw new AppError("AUTH_GOOGLE_ONLY", 401, {
      code: "GOOGLE_ONLY_ACCOUNT",
    });
  }

  const okPass = await bcrypt.compare(password, user.passwordHash);

  if (!okPass) {
    const nextFailed = (user.failedLoginCount || 0) + 1;
    const shouldLock = nextFailed >= MAX_FAILED;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: shouldLock ? 0 : nextFailed,
        lockUntil: shouldLock
          ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
          : null,
      },
    });

    throw new AppError("AUTH_INVALID_CREDENTIALS", 401, {
      code: "INVALID_CREDENTIALS",
    });
  }

  // ✅ success => reset
  if (user.failedLoginCount || user.lockUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockUntil: null },
    });
  }

  const accessToken = signAccessToken({ sub: user.id, role: user.role });
  const refreshToken = signRefreshToken({ sub: user.id, role: user.role });

  const refreshTokenHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash },
  });

  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return ok(
    req,
    res,
    {
      accessToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        imagePath: user.imagePath,
      },
    },
    "LOGIN_SUCCESS",
  );
});

exports.logout = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (refreshToken) {
    const hash = crypto.createHash("sha256").update(refreshToken).digest("hex");
    const user = await prisma.user.findFirst({
      where: { refreshTokenHash: hash },
    });

    if (user) {
      await prisma.user.update({
        where: { id: user.id },
        data: { refreshTokenHash: null },
      });
    }
  }

  res.clearCookie("refreshToken", cookieOptions);
  return ok(req, res, {}, "LOGOUT_SUCCESS");
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const parsed = forgotSchema.safeParse(req.body);
  if (!parsed.success) throw mapZodIssues(parsed.error.issues);

  const email = parsed.data.email.trim().toLowerCase();

  const user = await prisma.user.findUnique({ where: { email } });

  // ✅ enumeration
  if (!user) {
    return ok(req, res, {}, "PASSWORD_RESET_SENT");
  }

  const code = generateNumericCode(6);
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const exp = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetCodeHash: codeHash, resetCodeExp: exp },
  });

  // ⚠️ email template’ni 3 tilda qilgan bo‘lsangiz shu yerda chaqirasiz
  // const { getEmailTemplate } = require("../utils/emailTemplates");
  // const tpl = getEmailTemplate(req.lang, "passwordReset", { code, minutes: 15 });

  await sendMail({
    to: email,
    subject: "Password reset code",
    html: `
      <h3>Password reset</h3>
      <p>Code: <b style="font-size:20px">${code}</b></p>
      <p>Expires in 15 minutes.</p>
    `,
  });

  return ok(req, res, {}, "PASSWORD_RESET_SENT");
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) throw mapZodIssues(parsed.error.issues);

  const email = parsed.data.email.trim().toLowerCase();
  const { code, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.resetCodeHash || !user.resetCodeExp) {
    throw new AppError("RESET_CODE_INVALID_OR_EXPIRED", 400, {
      code: "INVALID_CODE",
    });
  }

  if (user.resetCodeExp.getTime() < Date.now()) {
    throw new AppError("RESET_CODE_EXPIRED", 400, { code: "CODE_EXPIRED" });
  }

  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  if (codeHash !== user.resetCodeHash) {
    throw new AppError("RESET_CODE_INVALID", 400, { code: "INVALID_CODE" });
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      passwordHash,
      resetCodeHash: null,
      resetCodeExp: null,
      refreshTokenHash: null,
    },
  });

  res.clearCookie("refreshToken", cookieOptions);
  return ok(req, res, {}, "PASSWORD_UPDATED_RELOGIN");
});

exports.refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new AppError("AUTH_NO_REFRESH_TOKEN", 401, {
      code: "NO_REFRESH_TOKEN",
    });
  }

  let payload;
  try {
    payload = verifyRefresh(refreshToken);
  } catch (e) {
    res.clearCookie("refreshToken", cookieOptions);
    throw new AppError("AUTH_INVALID_REFRESH_TOKEN", 401, {
      code: "INVALID_REFRESH_TOKEN",
    });
  }

  const presentedHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");
  const user = await prisma.user.findUnique({ where: { id: payload.sub } });

  if (!user || !user.refreshTokenHash) {
    res.clearCookie("refreshToken", cookieOptions);
    throw new AppError("AUTH_SESSION_EXPIRED", 401, {
      code: "SESSION_EXPIRED",
    });
  }

  if (user.refreshTokenHash !== presentedHash) {
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: null },
    });

    res.clearCookie("refreshToken", cookieOptions);

    throw new AppError("AUTH_REFRESH_REUSE_DETECTED", 401, {
      code: "REFRESH_REUSE_DETECTED",
    });
  }

  const newAccessToken = signAccessToken({ sub: user.id, role: user.role });
  const newRefreshToken = signRefreshToken({ sub: user.id, role: user.role });

  const newHash = crypto
    .createHash("sha256")
    .update(newRefreshToken)
    .digest("hex");

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshTokenHash: newHash },
  });

  res.cookie("refreshToken", newRefreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return ok(req, res, { accessToken: newAccessToken }, "TOKEN_REFRESHED");
});
