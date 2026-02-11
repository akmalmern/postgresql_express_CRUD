import { useState } from "react";
import { useDispatch } from "react-redux";
import { signupThunk } from "../features/auth/authThunks";
import { toast } from "react-toastify";
import { useNavigate, Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function Signup() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const nav = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    age: "",
  });

  const [loading, setLoading] = useState(false);

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...form,
      age: form.age === "" ? null : Number(form.age),
    };

    const r = await dispatch(signupThunk(payload));

    setLoading(false);

    if (signupThunk.fulfilled.match(r)) {
      toast.success(r.payload.message);
      nav("/login");
    } else {
      toast.error(r.payload?.message || t("common.error"));
    }
  };

  return (
    <div className="page flex items-center justify-center">
      <div className="w-full max-w-md card">
        <h2 className="text-2xl font-semibold text-gray-900 mb-1">
          {t("auth.signup")}
        </h2>
        <p className="text-sm text-gray-500 mb-6">
          {t("auth.signupHelp") || "Create a new account"}
        </p>

        <form onSubmit={submit} className="space-y-4">
          <input
            className="input"
            placeholder={t("auth.email")}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            className="input"
            placeholder={t("auth.password")}
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <input
              className="input"
              placeholder={t("auth.firstName")}
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
            />
            <input
              className="input"
              placeholder={t("auth.lastName")}
              value={form.lastName}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
            />
          </div>

          <input
            className="input"
            placeholder={t("auth.age")}
            type="number"
            value={form.age}
            onChange={(e) => setForm({ ...form, age: e.target.value })}
          />

          <button
            disabled={loading}
            type="submit"
            className="btn-primary w-full"
          >
            {loading ? t("common.loading") || "Loading..." : t("auth.signup")}
          </button>
        </form>

        <p className="mt-6 text-sm text-gray-600">
          {t("auth.haveAccount") || "Already have an account?"}{" "}
          <Link to="/login" className="text-blue-600 hover:underline">
            {t("auth.login")}
          </Link>
        </p>
      </div>
    </div>
  );
}
