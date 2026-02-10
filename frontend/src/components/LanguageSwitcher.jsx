import { useTranslation } from "react-i18next";

/* ✅ Tashqarida — PRO */
function LangBtn({ active, lng, label, onClick }) {
  return (
    <button
      onClick={() => onClick(lng)}
      className={`rounded-md px-3 py-1 text-xs font-semibold border transition
        ${
          active === lng
            ? "bg-gray-900 text-white border-gray-900"
            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
        }`}
    >
      {label}
    </button>
  );
}

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const setLang = (lng) => {
    i18n.changeLanguage(lng);
    localStorage.setItem("lang", lng);
  };

  const active = i18n.language || "uz";

  return (
    <div className="flex items-center gap-2">
      <LangBtn active={active} lng="uz" label="UZ" onClick={setLang} />
      <LangBtn active={active} lng="ru" label="RU" onClick={setLang} />
      <LangBtn active={active} lng="en" label="EN" onClick={setLang} />
    </div>
  );
}
