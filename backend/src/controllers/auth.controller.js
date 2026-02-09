const prisma = require("../prisma");
const bcrypt = require("bcrypt");
const crypto = require("crypto");

const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { mapZodIssues } = require("../middlewares/errorHandler");

const {
  signAccessToken,
  signRefreshToken,
  verifyRefresh,
} = require("../utils/tokens");
const { sendMail } = require("../utils/sendMail");
const { generateNumericCode } = require("../utils/codes");

const {
  studentSignupSchema,
  signinSchema,
  forgotSchema,
  resetSchema,
} = require("../validators/auth.schema");

const { verifyGoogleIdToken } = require("../utils/google");

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax",
  secure: false, // prod: true
  path: "/",
};

exports.googleAuth = asyncHandler(async (req, res) => {
  const { idToken } = req.body;

  if (!idToken) {
    throw new AppError("idToken yuborilmadi", 400, {
      code: "ID_TOKEN_REQUIRED",
    });
  }

  // ✅ 1) Google tokenni tekshiramiz
  const payload = await verifyGoogleIdToken(idToken);

  const email = payload.email.trim().toLowerCase();
  const googleSub = payload.sub;

  // ✅ (ixtiyoriy) name parsing
  const fullName = (payload.name || "").trim();
  const [firstNameRaw, ...rest] = fullName.split(" ");
  const firstName = firstNameRaw || "User";
  const lastName = rest.join(" ") || "Google";

  // ✅ 2) Userni topamiz (googleSub bo‘yicha eng to‘g‘ri)
  let user = await prisma.user.findUnique({ where: { googleSub } });

  // ✅ 3) Agar googleSub bo‘yicha topilmasa, email bo‘yicha tekshiramiz
  // (email bir xil bo‘lsa accountlarni “link” qilamiz)
  if (!user) {
    const byEmail = await prisma.user.findUnique({ where: { email } });

    if (byEmail) {
      // email mavjud => shu accountga googleSub bog‘laymiz
      user = await prisma.user.update({
        where: { id: byEmail.id },
        data: { googleSub },
      });
    } else {
      // yangi user yaratamiz
      user = await prisma.user.create({
        data: {
          email,
          passwordHash: null, // ✅ google user
          firstName,
          lastName,
          age: null,
          imagePath: null, // avatarni keyin yuklaydi (sizda shunday)
          role: "STUDENT",
          googleSub,
        },
      });
    }
  }

  // ✅ 4) Bizning tokenlarimizni beramiz (sizning tizim)
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

  res.json({
    success: true,
    message: "Google orqali kirish muvaffaqiyatli",
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      imagePath: user.imagePath,
    },
  });
});

exports.studentSignup = asyncHandler(async (req, res) => {
  const parsed = studentSignupSchema.safeParse(req.body);
  if (!parsed.success) throw mapZodIssues(parsed.error.issues);

  const { email, password, firstName, lastName, age } = parsed.data;

  const exists = await prisma.user.findUnique({ where: { email } });
  if (exists)
    throw new AppError("Bu email allaqachon mavjud", 409, {
      code: "EMAIL_EXISTS",
    });

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: {
      email,
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
    },
  });

  res.status(201).json({ success: true, message: "Student yaratildi", user });
});

// exports.signin = asyncHandler(async (req, res) => {
//   const parsed = signinSchema.safeParse(req.body);
//   if (!parsed.success) throw mapZodIssues(parsed.error.issues);

//   const { email, password } = parsed.data;

//   const user = await prisma.user.findUnique({ where: { email } });

//   // ✅ enumeration: doim bir xil javob
//   if (!user)
//     throw new AppError("Email yoki parol noto‘g‘ri", 401, {
//       code: "INVALID_CREDENTIALS",
//     });

//   const ok = await bcrypt.compare(password, user.passwordHash);
//   if (!ok)
//     throw new AppError("Email yoki parol noto‘g‘ri", 401, {
//       code: "INVALID_CREDENTIALS",
//     });

//   const accessToken = signAccessToken({ sub: user.id, role: user.role });
//   const refreshToken = signRefreshToken({ sub: user.id, role: user.role });

//   const refreshTokenHash = crypto
//     .createHash("sha256")
//     .update(refreshToken)
//     .digest("hex");
//   await prisma.user.update({
//     where: { id: user.id },
//     data: { refreshTokenHash },
//   });

//   res.cookie("refreshToken", refreshToken, {
//     ...cookieOptions,
//     maxAge: 7 * 24 * 60 * 60 * 1000,
//   });

//   res.json({
//     success: true,
//     message: "Kirish muvaffaqiyatli",
//     accessToken,
//     user: {
//       id: user.id,
//       email: user.email,
//       firstName: user.firstName,
//       lastName: user.lastName,
//       role: user.role,
//       imagePath: user.imagePath,
//     },
//   });
// });

const MAX_FAILED = 5;
const LOCK_MINUTES = 15;

exports.signin = asyncHandler(async (req, res) => {
  const parsed = signinSchema.safeParse(req.body);
  if (!parsed.success) throw mapZodIssues(parsed.error.issues);

  // ✅ emailni normalizatsiya qilish (pro)
  const email = parsed.data.email.trim().toLowerCase();
  const { password } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // ✅ enumeration: user yo‘q bo‘lsa ham bir xil
  if (!user) {
    throw new AppError("Email yoki parol noto‘g‘ri", 401, {
      code: "INVALID_CREDENTIALS",
    });
  }

  // ✅ lock tekshirish
  if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
    throw new AppError(
      `Account vaqtincha bloklangan. ${LOCK_MINUTES} daqiqadan keyin urinib ko‘ring.`,
      403,
      { code: "ACCOUNT_LOCKED" },
    );
  }

  const ok = await bcrypt.compare(password, user.passwordHash);

  // ❌ Parol xato bo‘lsa: failed count + lock
  if (!ok) {
    const nextFailed = (user.failedLoginCount || 0) + 1;

    // ✅ limitga yetdimi?
    const shouldLock = nextFailed >= MAX_FAILED;

    await prisma.user.update({
      where: { id: user.id },
      data: {
        failedLoginCount: shouldLock ? 0 : nextFailed, // lock bo‘lsa 0ga qaytarib qo‘yamiz
        lockUntil: shouldLock
          ? new Date(Date.now() + LOCK_MINUTES * 60 * 1000)
          : null,
      },
    });

    throw new AppError("Email yoki parol noto‘g‘ri", 401, {
      code: "INVALID_CREDENTIALS",
    });
  }

  // ✅ login muvaffaqiyatli: failed reset + lock clear
  if (user.failedLoginCount || user.lockUntil) {
    await prisma.user.update({
      where: { id: user.id },
      data: { failedLoginCount: 0, lockUntil: null },
    });
  }

  // ✅ tokenlar
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

  res.json({
    success: true,
    message: "Kirish muvaffaqiyatli",
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      imagePath: user.imagePath,
    },
  });
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
  res.json({ success: true, message: "Logout bo‘ldi" });
});

exports.forgotPassword = asyncHandler(async (req, res) => {
  const parsed = forgotSchema.safeParse(req.body);
  if (!parsed.success) throw mapZodIssues(parsed.error.issues);

  const { email } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });

  // ✅ email bor/yo‘qligini oshkor qilmaymiz
  if (!user)
    return res.json({
      success: true,
      message: "Agar email mavjud bo‘lsa, kod yuborildi",
    });

  const code = generateNumericCode(6);
  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  const exp = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.user.update({
    where: { id: user.id },
    data: { resetCodeHash: codeHash, resetCodeExp: exp },
  });

  await sendMail({
    to: email,
    subject: "Parolni tiklash kodi",
    html: `
      <h3>Parolni tiklash</h3>
      <p>Kodingiz: <b style="font-size:20px">${code}</b></p>
      <p>Kod 15 daqiqa amal qiladi.</p>
    `,
  });

  res.json({
    success: true,
    message: "Agar email mavjud bo‘lsa, kod yuborildi",
  });
});

exports.resetPassword = asyncHandler(async (req, res) => {
  const parsed = resetSchema.safeParse(req.body);
  if (!parsed.success) throw mapZodIssues(parsed.error.issues);

  const { email, code, newPassword } = parsed.data;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.resetCodeHash || !user.resetCodeExp) {
    throw new AppError("Kod noto‘g‘ri yoki eskirgan", 400, {
      code: "INVALID_CODE",
    });
  }

  if (user.resetCodeExp.getTime() < Date.now()) {
    throw new AppError("Kod eskirgan", 400, { code: "CODE_EXPIRED" });
  }

  const codeHash = crypto.createHash("sha256").update(code).digest("hex");
  if (codeHash !== user.resetCodeHash) {
    throw new AppError("Kod noto‘g‘ri", 400, { code: "INVALID_CODE" });
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
  res.json({ success: true, message: "Parol yangilandi. Qayta login qiling." });
});

exports.refresh = asyncHandler(async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    throw new AppError("Refresh token yo‘q", 401, { code: "NO_REFRESH_TOKEN" });
  }

  // 1) Refresh token signature + exp tekshirish
  let payload;
  try {
    payload = verifyRefresh(refreshToken); // { sub, role, iat, exp }
  } catch (e) {
    // cookie bor, lekin token eskirgan/noto‘g‘ri
    res.clearCookie("refreshToken", cookieOptions);
    throw new AppError("Refresh token noto‘g‘ri yoki eskirgan", 401, {
      code: "INVALID_REFRESH_TOKEN",
    });
  }

  // 2) DB’da saqlangan refreshTokenHash bilan taqqoslash
  const presentedHash = crypto
    .createHash("sha256")
    .update(refreshToken)
    .digest("hex");

  const user = await prisma.user.findUnique({ where: { id: payload.sub } });

  // user yo‘q yoki DB’dagi hash yo‘q => qayta login
  if (!user || !user.refreshTokenHash) {
    res.clearCookie("refreshToken", cookieOptions);
    throw new AppError("Session tugagan. Qayta login qiling.", 401, {
      code: "SESSION_EXPIRED",
    });
  }

  // 3) Reuse detection: hash mos bo‘lmasa => token o‘g‘irlangan bo‘lishi mumkin
  if (user.refreshTokenHash !== presentedHash) {
    // ✅ xavfsizlik: eski sessionni bekor qilamiz
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshTokenHash: null },
    });

    res.clearCookie("refreshToken", cookieOptions);

    throw new AppError(
      "Xavfsizlik sabab sessiya bekor qilindi. Qayta login qiling.",
      401,
      {
        code: "REFRESH_REUSE_DETECTED",
      },
    );
  }

  // 4) Rotate: yangi access + yangi refresh beramiz
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

  // cookie’ni yangilaymiz
  res.cookie("refreshToken", newRefreshToken, {
    ...cookieOptions,
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  res.json({
    success: true,
    message: "Token yangilandi",
    accessToken: newAccessToken,
  });
});
