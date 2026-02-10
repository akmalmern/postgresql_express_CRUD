// import { Outlet, Link } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { logoutThunk } from "../features/auth/authThunks";
// import { toast } from "react-toastify";
// import { useTranslation } from "react-i18next";
// import LanguageSwitcher from "./LanguageSwitcher";

// export default function Layout() {
//   const dispatch = useDispatch();
//   const { t } = useTranslation();

//   const logout = async () => {
//     const r = await dispatch(logoutThunk());
//     if (logoutThunk.fulfilled.match(r)) toast.success(r.payload.message);
//     else toast.error(r.payload?.message || "Error");
//   };

//   return (
//     <div style={{ display: "flex", minHeight: "100vh" }}>
//       <aside style={{ width: 240, padding: 16, borderRight: "1px solid #ddd" }}>
//         <LanguageSwitcher />
//         <nav
//           style={{
//             display: "flex",
//             flexDirection: "column",
//             gap: 8,
//             marginTop: 16,
//           }}
//         >
//           <Link to="/profile">{t("nav.profile")}</Link>
//           <Link to="/admin/students">{t("nav.adminStudents")}</Link>
//           <button onClick={logout} style={{ marginTop: 12 }}>
//             {t("nav.logout")}
//           </button>
//         </nav>
//       </aside>

//       <main style={{ flex: 1, padding: 16 }}>
//         <Outlet />
//       </main>
//     </div>
//   );
// }
import { Outlet, NavLink } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logoutThunk } from "../features/auth/authThunks";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import LanguageSwitcher from "./LanguageSwitcher";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `rounded-lg px-3 py-2 text-sm font-medium transition ${
          isActive
            ? "bg-blue-600 text-white"
            : "text-gray-700 hover:bg-gray-100"
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default function Layout() {
  const dispatch = useDispatch();
  const { t } = useTranslation();
  const user = useSelector((s) => s.auth.user);

  const logout = async () => {
    const r = await dispatch(logoutThunk());
    if (logoutThunk.fulfilled.match(r)) toast.success(r.payload.message);
    else toast.error(r.payload?.message || t("common.error"));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <aside className="w-64 border-r border-gray-200 bg-white">
          <div className="p-4">
            {/* Logo / Title */}
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-gray-900">
                  Student System
                </h1>
                <p className="text-xs text-gray-500">{user?.email || "—"}</p>
              </div>
            </div>

            {/* Language Switch */}
            <div className="mt-4">
              <LanguageSwitcher />
            </div>

            {/* Nav */}
            <nav className="mt-6 flex flex-col gap-2">
              <NavItem to="/profile">{t("nav.profile")}</NavItem>

              {/* ✅ admin linkni faqat admin ko‘rsa ham bo‘ladi */}

              {user?.role === "ADMIN" && (
                <NavItem to="/admin/students">{t("nav.adminStudents")}</NavItem>
              )}
              <button
                onClick={logout}
                className="mt-3 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700
                           hover:bg-gray-100 transition"
              >
                {t("nav.logout")}
              </button>
            </nav>
          </div>
        </aside>

        {/* Main */}
        <div className="flex-1">
          {/* Topbar */}
          <header className="sticky top-0 z-10 border-b border-gray-200 bg-white/80 backdrop-blur">
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <p className="text-sm text-gray-500">
                  {t("common.welcome") || "Welcome"}
                </p>
                <h2 className="text-lg font-semibold text-gray-900">
                  {user?.firstName ? `${user.firstName} ${user.lastName}` : "—"}
                </h2>
              </div>

              <div className="flex items-center gap-3">
                {/* xohlasangiz, topbarda ham til switch qo‘yish mumkin */}
                {/* <LanguageSwitcher /> */}
                <button
                  onClick={logout}
                  className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-800 transition"
                >
                  {t("nav.logout")}
                </button>
              </div>
            </div>
          </header>

          {/* Content */}
          <main className="p-6">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
