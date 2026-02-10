// import { useState } from "react";
// import { useDispatch } from "react-redux";
// import { signinThunk } from "../features/auth/authThunks";
// import { toast } from "react-toastify";
// import { useNavigate, Link } from "react-router-dom";
// import { useTranslation } from "react-i18next";

// export default function Login() {
//   const { t } = useTranslation();
//   const dispatch = useDispatch();
//   const nav = useNavigate();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");

//   const submit = async (e) => {
//     e.preventDefault();
//     const r = await dispatch(signinThunk({ email, password }));

//     if (signinThunk.fulfilled.match(r)) {
//       toast.success(r.payload.message); // ✅ backend tarjima qilib beradi
//       nav("/profile");
//     } else {
//       toast.error(r.payload?.message || "Error");
//     }
//   };

//   return (
//     <div style={{ maxWidth: 420, margin: "80px auto" }}>
//       <h2>{t("auth.login")}</h2>

//       <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
//         <input
//           placeholder={t("auth.email")}
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//         />
//         <input
//           placeholder={t("auth.password")}
//           type="password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//         />
//         <button type="submit">{t("auth.login")}</button>
//       </form>

//       <p style={{ marginTop: 12 }}>
//         <Link to="/signup">{t("auth.signup")}</Link>
//       </p>
//       <p style={{ marginTop: 12 }}>
//         <Link to="/forgot">{t("auth.forgot.title")}</Link>
//       </p>
//     </div>
//   );
// }
import { useState } from "react";
import { useDispatch } from "react-redux";
import { signinThunk } from "../features/auth/authThunks";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Login() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const nav = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const r = await dispatch(signinThunk({ email, password }));

    setLoading(false);

    if (signinThunk.fulfilled.match(r)) {
      toast.success(r.payload.message);
      nav("/profile");
    } else {
      toast.error(r.payload?.message || t("common.error"));
    }
  };

  return (
    <div className="page flex items-center justify-center">
      <div className="w-full max-w-md card">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">
          {t("auth.login")}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {t("auth.loginHelp") || "Enter your credentials to continue"}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <input
            className="input"
            placeholder={t("auth.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <input
            className="input"
            placeholder={t("auth.password")}
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            disabled={loading}
            type="submit"
            className="btn-primary w-full"
          >
            {loading ? t("common.loading") || "Loading..." : t("auth.login")}
          </button>
        </form>

        <div className="mt-6 flex flex-col gap-2 text-sm">
          <Link to="/signup" className="text-blue-600 hover:underline">
            {t("auth.signup")}
          </Link>
          <Link to="/forgot" className="text-blue-600 hover:underline">
            {t("auth.forgot.title")}
          </Link>
        </div>
      </div>
    </div>
  );
}
