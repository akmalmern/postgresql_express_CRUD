const { OAuth2Client } = require("google-auth-library");
const AppError = require("./AppError");

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

async function verifyGoogleIdToken(idToken) {
  try {
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID, // ✅ juda muhim
    });

    const payload = ticket.getPayload(); // name, email, sub, picture...
    if (!payload?.email || !payload?.sub) {
      throw new AppError("Google token noto‘g‘ri", 401, {
        code: "INVALID_GOOGLE_TOKEN",
      });
    }

    return payload;
  } catch (e) {
    throw new AppError("Google token noto‘g‘ri yoki eskirgan", 401, {
      code: "INVALID_GOOGLE_TOKEN",
    });
  }
}

module.exports = { verifyGoogleIdToken };
