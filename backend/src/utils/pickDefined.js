// update Profile  uchun

function pickDefined(obj) {
  return Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined),
  );
}

module.exports = pickDefined;
