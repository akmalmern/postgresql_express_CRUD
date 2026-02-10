// import { useState } from "react";
// import { useDispatch } from "react-redux";
// import { forgotPasswordThunk } from "../features/auth/authThunks";
// import { toast } from "react-toastify";
// import { Link, useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";

// export default function ForgotPassword() {
//   const { t } = useTranslation();
//   const dispatch = useDispatch();
//   const nav = useNavigate();

//   const [email, setEmail] = useState("");
//   const [loading, setLoading] = useState(false);

//   const submit = async (e) => {
//     e.preventDefault();
//     setLoading(true);

//     const r = await dispatch(forgotPasswordThunk({ email }));

//     setLoading(false);

//     if (forgotPasswordThunk.fulfilled.match(r)) {
//       toast.success(r.payload.message); // ✅ backend x-lang bo‘yicha tarjima qiladi
//       nav(`/reset?email=${encodeURIComponent(email)}`);
//     } else {
//       toast.error(r.payload?.message || t("common.error"));
//     }
//   };

//   return (
//     <div style={{ maxWidth: 420, margin: "80px auto" }}>
//       <h2>{t("auth.forgot.title")}</h2>

//       <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
//         <input
//           placeholder={t("auth.email")}
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />

//         <button disabled={loading} type="submit">
//           {loading ? t("auth.forgot.sending") : t("auth.forgot.sendCode")}
//         </button>
//       </form>

//       <p style={{ marginTop: 12 }}>
//         <Link to="/login">{t("auth.backToLogin")}</Link>
//       </p>
//     </div>
//   );
// }
import { useState } from "react";
import { useDispatch } from "react-redux";
import { forgotPasswordThunk } from "../features/auth/authThunks";
import { toast } from "react-toastify";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ForgotPassword() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const r = await dispatch(forgotPasswordThunk({ email }));

    setLoading(false);

    if (forgotPasswordThunk.fulfilled.match(r)) {
      toast.success(r.payload.message);
      nav(`/reset?email=${encodeURIComponent(email)}`);
    } else {
      toast.error(r.payload?.message || t("common.error"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-2">
          {t("auth.forgot.title")}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {t("auth.forgot.sendCode")}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <input
            type="email"
            placeholder={t("auth.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-gray-300 px-4 py-2
                       focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <button
            disabled={loading}
            type="submit"
            className={`w-full rounded-lg py-2 font-medium text-white
              ${
                loading
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
          >
            {loading ? t("auth.forgot.sending") : t("auth.forgot.sendCode")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/login" className="text-sm text-blue-600 hover:underline">
            {t("auth.backToLogin")}
          </Link>
        </div>
      </div>
    </div>
  );
}
