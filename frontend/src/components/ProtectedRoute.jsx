import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ roles }) {
  const token = useSelector((s) => s.auth.accessToken);
  const role = useSelector((s) => s.auth.user?.role);
  const location = useLocation();

  // ✅ login bo‘lmagan user
  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  // ✅ role tekshiruv
  if (roles?.length && role && !roles.includes(role)) {
    return <Navigate to="/app/profile" replace />;
  }

  return <Outlet />;
}
