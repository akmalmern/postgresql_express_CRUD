import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

/**
 * ✅ Token bor bo‘lsa kiradi, yo‘q bo‘lsa login
 */
export default function ProtectedRoute({ children }) {
  const token = useSelector((s) => s.auth.accessToken);
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
