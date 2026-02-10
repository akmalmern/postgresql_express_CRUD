const { normalizeLang } = require("../utils/i18n");

function language(req, res, next) {
  // 1) query: ?lang=ru
  if (req.query?.lang) {
    req.lang = normalizeLang(req.query.lang);
    return next();
  }

  // 2) custom header: x-lang: en
  if (req.headers["x-lang"]) {
    req.lang = normalizeLang(req.headers["x-lang"]);
    return next();
  }

  // 3) standard header: Accept-Language
  req.lang = normalizeLang(req.headers["accept-language"]);
  next();
}

module.exports = language;
