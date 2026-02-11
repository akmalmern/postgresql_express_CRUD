import { Outlet, Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk } from "../features/auth/authThunks";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

export default function AppLayout() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const role = useSelector((s) => s.auth.user?.role);

  const logout = async () => {
    const r = await dispatch(logoutThunk());
    if (logoutThunk.fulfilled.match(r)) toast.success(r.payload.message);
    else toast.error(r.payload?.message || t("common.error"));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-semibold text-gray-900">
            Student System
          </h1>
          <LanguageSwitcher />
        </div>

        <div className="mt-6 grid grid-cols-12 gap-6">
          <aside className="col-span-12 md:col-span-3">
            <div className="section">
              <nav className="flex flex-col gap-3">
                <Link className="link" to="/app/profile">
                  {t("nav.profile")}
                </Link>

                {role === "ADMIN" && (
                  <Link className="link" to="/app/admin/students">
                    {t("nav.adminStudents")}
                  </Link>
                )}

                <button onClick={logout} className="btn-ghost mt-2">
                  {t("nav.logout")}
                </button>
              </nav>
            </div>
          </aside>

          <main className="col-span-12 md:col-span-9">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
