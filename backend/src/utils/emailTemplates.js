function escapeHtml(s) {
  return String(s)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const templates = {
  uz: {
    passwordReset: ({ code, minutes }) => ({
      subject: "Parolni tiklash kodi",
      html: `
        <h3>Parolni tiklash</h3>
        <p>Kodingiz: <b style="font-size:20px">${escapeHtml(code)}</b></p>
        <p>Kod ${minutes} daqiqa amal qiladi.</p>
      `,
    }),
    deleteAccount: ({ code, minutes }) => ({
      subject: "Account o‘chirish kodi",
      html: `
        <h3>Account o‘chirish</h3>
        <p>5 xonali kodingiz: <b style="font-size:22px">${escapeHtml(code)}</b></p>
        <p>Kod ${minutes} daqiqa amal qiladi.</p>
      `,
    }),
  },

  ru: {
    passwordReset: ({ code, minutes }) => ({
      subject: "Код для сброса пароля",
      html: `
        <h3>Сброс пароля</h3>
        <p>Ваш код: <b style="font-size:20px">${escapeHtml(code)}</b></p>
        <p>Код действует ${minutes} минут.</p>
      `,
    }),
    deleteAccount: ({ code, minutes }) => ({
      subject: "Код для удаления аккаунта",
      html: `
        <h3>Удаление аккаунта</h3>
        <p>Ваш 5-значный код: <b style="font-size:22px">${escapeHtml(code)}</b></p>
        <p>Код действует ${minutes} минут.</p>
      `,
    }),
  },

  en: {
    passwordReset: ({ code, minutes }) => ({
      subject: "Password reset code",
      html: `
        <h3>Password reset</h3>
        <p>Your code: <b style="font-size:20px">${escapeHtml(code)}</b></p>
        <p>The code is valid for ${minutes} minutes.</p>
      `,
    }),
    deleteAccount: ({ code, minutes }) => ({
      subject: "Delete account code",
      html: `
        <h3>Delete account</h3>
        <p>Your 5-digit code: <b style="font-size:22px">${escapeHtml(code)}</b></p>
        <p>The code is valid for ${minutes} minutes.</p>
      `,
    }),
  },
};

function getEmailTemplate(lang, type, params) {
  const safeLang = ["uz", "ru", "en"].includes(lang) ? lang : "uz";
  const fn = templates[safeLang]?.[type];
  if (!fn) throw new Error(`Unknown email template: ${type}`);
  return fn(params);
}

module.exports = { getEmailTemplate };
