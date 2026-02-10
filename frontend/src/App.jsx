import { Routes, Route, Navigate } from "react-router-dom";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

import Login from "./pages/Login";
import Signup from "./pages/Signup";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Profile from "./pages/Profile";
import DeleteAccount from "./pages/DeleteAccount";
import AdminStudents from "./pages/AdminStudents";

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { getProfileThunk, refreshThunk } from "./features/auth/authThunks";

export default function App() {
  const dispatch = useDispatch();
  const token = useSelector((s) => s.auth.accessToken);

  useEffect(() => {
    // ✅ Refresh cookie bor bo‘lsa tokenni yangilab oladi
    // token localStorage bo‘lsa ham, user’ni qayta olib kelamiz
    (async () => {
      try {
        if (!token) {
          const r = await dispatch(refreshThunk());
          if (refreshThunk.fulfilled.match(r)) {
            await dispatch(getProfileThunk());
          }
        } else {
          await dispatch(getProfileThunk());
        }
      } catch (err) {
        console.log(err);
      }
    })();
  }, [dispatch]); // token’ni dependency qilmaymiz, loop bo‘lmasin

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Navigate to="/profile" replace />} />

        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="forgot" element={<ForgotPassword />} />
        <Route path="reset" element={<ResetPassword />} />

        <Route element={<ProtectedRoute />}>
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
