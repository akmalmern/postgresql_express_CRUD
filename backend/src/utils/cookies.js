/**
 * ✅ Cookie options: dev/prod muhitga mos
 * - httpOnly: JS o‘qiy olmaydi (xavfsiz)
 * - secure: prod’da true (HTTPS)
 * - sameSite: prod’da 'none' (agar frontend boshqa domen bo‘lsa), aks holda 'lax'
 *
 * ENV:
 *  NODE_ENV=production
 *  COOKIE_SECURE=true/false
 *  COOKIE_SAMESITE=lax/none/strict
 *  COOKIE_DOMAIN=example.com (ixtiyoriy)
 */
function getCookieOptions() {
  const isProd = process.env.NODE_ENV === "production";

  // ✅ secure: prod’da default true
  const secure =
    process.env.COOKIE_SECURE != null
      ? process.env.COOKIE_SECURE === "true"
      : isProd;

  // ✅ sameSite: agar secure true va cross-site kerak bo‘lsa 'none' bo‘lishi shart
  const sameSite = process.env.COOKIE_SAMESITE || (secure ? "none" : "lax"); // dev’da odatda lax

  const options = {
    httpOnly: true,
    secure,
    sameSite,
    path: "/",
  };

  // ixtiyoriy: domen bir xil bo‘lsa kerak bo‘lmaydi
  if (process.env.COOKIE_DOMAIN) {
    options.domain = process.env.COOKIE_DOMAIN;
  }

  return options;
}

module.exports = { getCookieOptions };
