const uz = require("../i18n/uz.json");
const ru = require("../i18n/ru.json");
const en = require("../i18n/en.json");

const dict = { uz, ru, en };

function normalizeLang(raw) {
  if (!raw) return "uz";
  const v = String(raw).toLowerCase();

  // Accept-Language: "ru-RU,ru;q=0.9,en;q=0.8"
  if (v.includes("ru")) return "ru";
  if (v.includes("en")) return "en";
  if (v.includes("uz")) return "uz";

  // query lang=ru / header x-lang=ru
  if (v === "ru" || v === "en" || v === "uz") return v;

  return "uz";
}

function t(lang, key) {
  const d = dict[lang] || dict.uz;
  return d[key] || key; // key topilmasa o‘zini qaytaradi (debug oson)
}

module.exports = { normalizeLang, t };
