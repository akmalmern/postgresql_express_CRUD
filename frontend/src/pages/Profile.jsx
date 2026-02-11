// import { useEffect, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   getProfileThunk,
//   updateProfileThunk,
//   uploadAvatarThunk,
//   deleteAvatarThunk,
// } from "../features/profile/profileThunks";
// import { toast } from "react-toastify";
// import { useTranslation } from "react-i18next";
// import { Link } from "react-router-dom";

// export default function Profile() {
//   const { t } = useTranslation();
//   const dispatch = useDispatch();
//   const profile = useSelector((s) => s.profile.profile);

//   const [form, setForm] = useState({ firstName: "", lastName: "", age: "" });

//   useEffect(() => {
//     dispatch(getProfileThunk());
//   }, [dispatch]);

//   useEffect(() => {
//     if (profile) {
//       setForm({
//         firstName: profile.firstName || "",
//         lastName: profile.lastName || "",
//         age: profile.age ?? "",
//       });
//     }
//   }, [profile]);

//   const saveText = async () => {
//     // ✅ faqat o‘zgarganlarni yuborish ham mumkin, hozir soddaroq
//     const payload = { ...form, age: form.age === "" ? null : Number(form.age) };
//     const r = await dispatch(updateProfileThunk(payload));
//     if (updateProfileThunk.fulfilled.match(r)) toast.success(r.payload.message);
//     else toast.error(r.payload?.message || "Error");
//   };

//   const upload = async (e) => {
//     const file = e.target.files?.[0];
//     if (!file) return;
//     const r = await dispatch(uploadAvatarThunk(file));
//     if (uploadAvatarThunk.fulfilled.match(r)) toast.success(r.payload.message);
//     else toast.error(r.payload?.message || "Error");
//   };

//   const removeAvatar = async () => {
//     const r = await dispatch(deleteAvatarThunk());
//     if (deleteAvatarThunk.fulfilled.match(r)) toast.success(r.payload.message);
//     else toast.error(r.payload?.message || "Error");
//   };

//   if (!profile) return <div>{t("common.loading")}</div>;

//   const avatarUrl = profile.imagePath
//     ? `${import.meta.env.VITE_API_URL}/${profile.imagePath}`
//     : null;

//   return (
//     <div style={{ maxWidth: 700 }}>
//       <h2>{t("nav.profile")}</h2>

//       <Link
//         to="/delete-account"
//         style={{ display: "inline-block", marginTop: 16 }}
//       >
//         Delete account
//       </Link>
//       <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
//         <div>
//           {avatarUrl ? (
//             <img
//               src={avatarUrl}
//               alt="avatar"
//               style={{
//                 width: 100,
//                 height: 100,
//                 objectFit: "cover",
//                 borderRadius: 12,
//               }}
//             />
//           ) : (
//             <div
//               style={{
//                 width: 100,
//                 height: 100,
//                 background: "#eee",
//                 borderRadius: 12,
//                 display: "grid",
//                 placeItems: "center",
//               }}
//             >
//               No Avatar
//             </div>
//           )}
//         </div>

//         <div style={{ display: "grid", gap: 8 }}>
//           <input type="file" accept="image/*" onChange={upload} />
//           <button onClick={removeAvatar}>{t("common.delete")}</button>
//         </div>
//       </div>
//       <div style={{ marginTop: 20, display: "grid", gap: 10 }}>
//         <input
//           value={form.firstName}
//           onChange={(e) => setForm({ ...form, firstName: e.target.value })}
//           placeholder={t("auth.firstName")}
//         />
//         <input
//           value={form.lastName}
//           onChange={(e) => setForm({ ...form, lastName: e.target.value })}
//           placeholder={t("auth.lastName")}
//         />
//         <input
//           value={form.age}
//           onChange={(e) => setForm({ ...form, age: e.target.value })}
//           placeholder={t("auth.age")}
//           type="number"
//         />
//         <button onClick={saveText}>{t("common.save")}</button>
//       </div>
//     </div>
//   );
// }
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  getProfileThunk,
  updateProfileThunk,
  uploadAvatarThunk,
  deleteAvatarThunk,
} from "../features/profile/profileThunks";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";

export default function Profile() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const profile = useSelector((s) => s.profile.profile);
  console.log(profile.imagePath);
  const [form, setForm] = useState({ firstName: "", lastName: "", age: "" });
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    dispatch(getProfileThunk());
  }, [dispatch]);

  useEffect(() => {
    if (profile) {
      setForm({
        firstName: profile.firstName || "",
        lastName: profile.lastName || "",
        age: profile.age ?? "",
      });
    }
  }, [profile]);

  const saveText = async () => {
    setSaving(true);
    const payload = { ...form, age: form.age === "" ? null : Number(form.age) };

    const r = await dispatch(updateProfileThunk(payload));
    setSaving(false);

    if (updateProfileThunk.fulfilled.match(r)) toast.success(r.payload.message);
    else toast.error(r.payload?.message || t("common.error"));
  };

  const upload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarLoading(true);
    const r = await dispatch(uploadAvatarThunk(file));
    setAvatarLoading(false);

    if (uploadAvatarThunk.fulfilled.match(r)) toast.success(r.payload.message);
    else toast.error(r.payload?.message || t("common.error"));

    e.target.value = ""; // ✅ qayta upload uchun (same file)
  };

  const removeAvatar = async () => {
    const ok = confirm(t("common.confirmDelete") || "Are you sure?");
    if (!ok) return;

    setAvatarLoading(true);
    const r = await dispatch(deleteAvatarThunk());
    setAvatarLoading(false);

    if (deleteAvatarThunk.fulfilled.match(r)) toast.success(r.payload.message);
    else toast.error(r.payload?.message || t("common.error"));
  };

  if (!profile) {
    return (
      <div className="page">
        <div className="mx-auto max-w-3xl card">{t("common.loading")}</div>
      </div>
    );
  }

  const avatarUrl = profile.imagePath
    ? `${import.meta.env.VITE_API_URL}/${profile.imagePath}`
    : null;

  return (
    <div className="page">
      <div className="mx-auto w-full max-w-3xl space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t("nav.profile")}
          </h2>

          <Link to="/app/delete-account" className="link">
            {t("auth.delete.title")}
          </Link>
        </div>

        <div className="card">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
            <div className="flex items-center gap-4">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="avatar"
                  className="h-24 w-24 rounded-xl object-cover border"
                />
              ) : (
                <div className="h-24 w-24 rounded-xl bg-gray-100 border flex items-center justify-center text-gray-500">
                  {t("profile.noAvatar") || "No Avatar"}
                </div>
              )}

              <div className="flex flex-col gap-2">
                <label className="text-sm text-gray-600">
                  {t("profile.avatar") || "Avatar"}
                </label>

                <input
                  type="file"
                  accept="image/*"
                  onChange={upload}
                  disabled={avatarLoading}
                  className="block text-sm text-gray-700 file:mr-3 file:rounded-lg file:border-0 file:bg-gray-900 file:px-4 file:py-2 file:text-white hover:file:bg-gray-800"
                />

                <button
                  onClick={removeAvatar}
                  disabled={avatarLoading || !profile.imagePath}
                  className="btn-ghost"
                >
                  {avatarLoading
                    ? t("common.loading") || "Loading..."
                    : t("profile.removeAvatar") || t("common.delete")}
                </button>
              </div>
            </div>

            <div className="flex-1">
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <input
                  className="input"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  placeholder={t("auth.firstName")}
                />
                <input
                  className="input"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  placeholder={t("auth.lastName")}
                />
              </div>

              <div className="mt-4">
                <input
                  className="input"
                  value={form.age}
                  onChange={(e) => setForm({ ...form, age: e.target.value })}
                  placeholder={t("auth.age")}
                  type="number"
                />
              </div>

              <button
                onClick={saveText}
                disabled={saving}
                className="btn-primary mt-4 w-full"
              >
                {saving
                  ? t("common.loading") || "Loading..."
                  : t("common.save")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
