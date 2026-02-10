import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ✅ Faqat role mos bo‘lsa kiradi
 */
export default function RoleRoute({ roles = [], children }) {
  const user = useSelector((s) => s.auth.user);
  if (!user) return <Navigate to="/login" replace />;
  if (!roles.includes(user.role)) return <Navigate to="/profile" replace />;
  return children;
}
