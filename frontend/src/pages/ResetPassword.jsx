import { useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { resetPasswordThunk } from "../features/auth/authThunks";
import { toast } from "react-toastify";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function ResetPassword() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const nav = useNavigate();
  const [params] = useSearchParams();

  const initialEmail = useMemo(() => params.get("email") || "", [params]);

  const [email, setEmail] = useState(initialEmail);
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const r = await dispatch(resetPasswordThunk({ email, code, newPassword }));

    setLoading(false);

    if (resetPasswordThunk.fulfilled.match(r)) {
      toast.success(r.payload.message);
      nav("/login");
    } else {
      toast.error(r.payload?.message || t("common.error"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
          {t("auth.reset.title")}
        </h2>

        <form onSubmit={submit} className="space-y-4">
          <input
            placeholder={t("auth.email")}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="input"
          />

          <input
            placeholder={t("auth.reset.codePlaceholder")}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            className="input"
          />

          <input
            type="password"
            placeholder={t("auth.reset.newPasswordPlaceholder")}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="input"
          />

          <button
            disabled={loading}
            className={`w-full rounded-lg py-2 font-medium text-white
              ${
                loading
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
          >
            {loading ? t("auth.reset.saving") : t("auth.reset.submit")}
          </button>
        </form>

        <div className="mt-6 text-center">
          <Link to="/forgot" className="text-sm text-blue-600 hover:underline">
            {t("auth.reset.resendCode")}
          </Link>
        </div>
      </div>
    </div>
  );
}
