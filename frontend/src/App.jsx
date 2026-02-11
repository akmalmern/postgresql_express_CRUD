import { Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import PublicLayout from "./components/PublicLayout";
import AppLayout from "./components/AppLayout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import Profile from "./pages/Profile";
import DeleteAccount from "./pages/DeleteAccount";
import AdminStudents from "./pages/AdminStudents";

import { refreshThunk, getProfileThunk } from "./features/auth/authThunks";

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.accessToken);

  // ✅ refresh + profile restore (sizda user refreshdan keyin yo‘qolmasin)
  useEffect(() => {
    (async () => {
      try {
        if (!token) {
          const r = await dispatch(refreshThunk());
          if (refreshThunk.fulfilled.match(r))
            await dispatch(getProfileThunk());
        } else {
          await dispatch(getProfileThunk());
        }
      } catch (error) {
        console.log(error);
      }
    })();
  }, [dispatch]); // token qo‘shmang (loop bo‘lmasin)

  return (
    <Routes>
      {/* ✅ Public (sidebar yo‘q) */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot" element={<ForgotPassword />} />
        <Route path="/reset" element={<ResetPassword />} />
      </Route>

      {/* ✅ Private (sidebar bor) */}
      <Route path="/app" element={<AppLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route index element={<Navigate to="/app/profile" replace />} />
          <Route path="profile" element={<Profile />} />
          <Route path="delete-account" element={<DeleteAccount />} />
        </Route>

        <Route element={<ProtectedRoute roles={["ADMIN"]} />}>
          <Route path="admin/students" element={<AdminStudents />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
