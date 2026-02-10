// import { useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   requestDeleteAccountThunk,
//   confirmDeleteAccountThunk,
// } from "../features/profile/profileThunks";
// import { toast } from "react-toastify";
// import { useNavigate } from "react-router-dom";
// import { useTranslation } from "react-i18next";

// export default function DeleteAccount() {
//   const { t } = useTranslation();
//   const dispatch = useDispatch();
//   const nav = useNavigate();

//   // ✅ login bo‘lgan user emailini avtomatik qo‘yish (qulay)
//   const user = useSelector((s) => s.auth.user);

//   const [email, setEmail] = useState(user?.email || "");
//   const [code, setCode] = useState("");
//   const [step, setStep] = useState(1); // 1=request, 2=confirm
//   const [loading, setLoading] = useState(false);

//   const requestCode = async () => {
//     setLoading(true);
//     const r = await dispatch(requestDeleteAccountThunk({ email }));
//     setLoading(false);

//     if (requestDeleteAccountThunk.fulfilled.match(r)) {
//       toast.success(r.payload.message);
//       setStep(2);
//     } else {
//       toast.error(r.payload?.message || t("common.error"));
//     }
//   };

//   const confirmDelete = async () => {
//     setLoading(true);
//     const r = await dispatch(confirmDeleteAccountThunk({ email, code }));
//     setLoading(false);

//     if (confirmDeleteAccountThunk.fulfilled.match(r)) {
//       toast.success(r.payload.message);
//       nav("/signup");
//     } else {
//       toast.error(r.payload?.message || t("common.error"));
//     }
//   };

//   return (
//     <div style={{ maxWidth: 520 }}>
//       <h2>{t("auth.delete.title")}</h2>

//       <div style={{ display: "grid", gap: 10, marginTop: 12 }}>
//         <input
//           placeholder={t("auth.delete.emailPlaceholder")}
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           disabled={step === 2}
//         />

//         {step === 1 && (
//           <>
//             <p style={{ opacity: 0.8 }}>{t("auth.delete.helpText")}</p>

//             <button disabled={loading} onClick={requestCode}>
//               {loading ? t("auth.delete.sending") : t("auth.delete.sendCode")}
//             </button>
//           </>
//         )}

//         {step === 2 && (
//           <>
//             <input
//               placeholder={t("auth.delete.codePlaceholder")}
//               value={code}
//               onChange={(e) => setCode(e.target.value)}
//             />

//             <div style={{ display: "flex", gap: 10 }}>
//               <button disabled={loading} onClick={confirmDelete}>
//                 {loading ? t("auth.delete.deleting") : t("auth.delete.confirm")}
//               </button>

//               <button
//                 disabled={loading}
//                 onClick={() => {
//                   setStep(1);
//                   setCode("");
//                 }}
//               >
//                 {t("common.back")}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// }
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  requestDeleteAccountThunk,
  confirmDeleteAccountThunk,
} from "../features/profile/profileThunks";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

export default function DeleteAccount() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const nav = useNavigate();
  const user = useSelector((s) => s.auth.user);

  const [email, setEmail] = useState(user?.email || "");
  const [code, setCode] = useState("");
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const requestCode = async () => {
    setLoading(true);
    const r = await dispatch(requestDeleteAccountThunk({ email }));
    setLoading(false);

    if (requestDeleteAccountThunk.fulfilled.match(r)) {
      toast.success(r.payload.message);
      setStep(2);
    } else {
      toast.error(r.payload?.message || t("common.error"));
    }
  };

  const confirmDelete = async () => {
    setLoading(true);
    const r = await dispatch(confirmDeleteAccountThunk({ email, code }));
    setLoading(false);

    if (confirmDeleteAccountThunk.fulfilled.match(r)) {
      toast.success(r.payload.message);
      nav("/signup");
    } else {
      toast.error(r.payload?.message || t("common.error"));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-red-50 px-4">
      <div className="w-full max-w-lg bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-semibold text-red-600 mb-4">
          {t("auth.delete.title")}
        </h2>

        <input
          placeholder={t("auth.delete.emailPlaceholder")}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={step === 2}
          className="w-full rounded-lg border px-4 py-2 mb-4
                     focus:ring-2 focus:ring-red-500"
        />

        {step === 1 && (
          <>
            <p className="text-sm text-gray-600 mb-4">
              {t("auth.delete.helpText")}
            </p>

            <button
              disabled={loading}
              onClick={requestCode}
              className={`w-full rounded-lg py-2 font-medium text-white
                ${
                  loading
                    ? "bg-red-300 cursor-not-allowed"
                    : "bg-red-600 hover:bg-red-700"
                }`}
            >
              {loading ? t("auth.delete.sending") : t("auth.delete.sendCode")}
            </button>
          </>
        )}

        {step === 2 && (
          <>
            <input
              placeholder={t("auth.delete.codePlaceholder")}
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-lg border px-4 py-2 mb-4
                         focus:ring-2 focus:ring-red-500"
            />

            <div className="flex gap-3">
              <button
                disabled={loading}
                onClick={confirmDelete}
                className={`flex-1 rounded-lg py-2 font-medium text-white
                  ${
                    loading
                      ? "bg-red-300 cursor-not-allowed"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
              >
                {loading ? t("auth.delete.deleting") : t("auth.delete.confirm")}
              </button>

              <button
                disabled={loading}
                onClick={() => {
                  setStep(1);
                  setCode("");
                }}
                className="flex-1 rounded-lg py-2 font-medium border border-gray-300 hover:bg-gray-100"
              >
                {t("common.back")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
