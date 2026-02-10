const { t } = require("./i18n");

/**
 * ✅ 200 OK
 * messageKey bo‘lsa: tarjima qilib beradi
 * data bo‘lsa: response’ga qo‘shadi
 */
function ok(req, res, data = {}, messageKey) {
  return res.status(200).json({
    success: true,
    ...(messageKey ? { message: t(req.lang, messageKey) } : {}),
    ...data,
  });
}

/**
 * ✅ 201 Created
 */
function created(req, res, data = {}, messageKey) {
  return res.status(201).json({
    success: true,
    ...(messageKey ? { message: t(req.lang, messageKey) } : {}),
    ...data,
  });
}

module.exports = { ok, created };
