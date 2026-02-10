// import { useEffect } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   listStudentsThunk,
//   deleteStudentThunk,
// } from "../features/admin/adminThunks";
// import { toast } from "react-toastify";
// import { useTranslation } from "react-i18next";

// export default function AdminStudents() {
//   const { t } = useTranslation();
//   const dispatch = useDispatch();
//   const { students, status } = useSelector((s) => s.admin);

//   useEffect(() => {
//     dispatch(listStudentsThunk());
//   }, [dispatch]);

//   const del = async (id) => {
//     const r = await dispatch(deleteStudentThunk(id));
//     if (deleteStudentThunk.fulfilled.match(r)) toast.success(r.payload.message);
//     else toast.error(r.payload?.message || "Error");
//   };

//   return (
//     <div>
//       <h2>{t("nav.adminStudents")}</h2>
//       {status === "loading" && <div>{t("common.loading")}</div>}

//       <table
//         border="1"
//         cellPadding="8"
//         style={{ borderCollapse: "collapse", width: "100%" }}
//       >
//         <thead>
//           <tr>
//             <th>Email</th>
//             <th>Full name</th>
//             <th>Age</th>
//             <th>Action</th>
//           </tr>
//         </thead>
//         <tbody>
//           {students.map((s) => (
//             <tr key={s.id}>
//               <td>{s.email}</td>
//               <td>
//                 {s.firstName} {s.lastName}
//               </td>
//               <td>{s.age ?? "-"}</td>
//               <td>
//                 <button onClick={() => del(s.id)}>{t("common.delete")}</button>
//               </td>
//             </tr>
//           ))}
//         </tbody>
//       </table>
//     </div>
//   );
// }

import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  listStudentsThunk,
  deleteStudentThunk,
} from "../features/admin/adminThunks";
import { toast } from "react-toastify";
import { useTranslation } from "react-i18next";

export default function AdminStudents() {
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { students, status } = useSelector((s) => s.admin);

  useEffect(() => {
    dispatch(listStudentsThunk());
  }, [dispatch]);

  const del = async (id) => {
    const ok = confirm(t("common.confirmDelete") || "Are you sure?");
    if (!ok) return;

    const r = await dispatch(deleteStudentThunk(id));
    if (deleteStudentThunk.fulfilled.match(r)) toast.success(r.payload.message);
    else toast.error(r.payload?.message || t("common.error"));
  };

  return (
    <div className="page">
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-semibold text-gray-900">
            {t("nav.adminStudents")}
          </h2>
        </div>

        <div className="card">
          {status === "loading" && (
            <div className="text-sm text-gray-600">{t("common.loading")}</div>
          )}

          {status !== "loading" && students.length === 0 && (
            <div className="text-sm text-gray-600">
              {t("common.noData") || "No data"}
            </div>
          )}

          {students.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b bg-gray-50 text-left text-gray-600">
                    <th className="px-4 py-3">Email</th>
                    <th className="px-4 py-3">Full name</th>
                    <th className="px-4 py-3">Age</th>
                    <th className="px-4 py-3 text-right">Action</th>
                  </tr>
                </thead>

                <tbody>
                  {students.map((s) => (
                    <tr key={s.id} className="border-b last:border-b-0">
                      <td className="px-4 py-3 font-medium text-gray-900">
                        {s.email}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {s.firstName} {s.lastName}
                      </td>
                      <td className="px-4 py-3 text-gray-700">
                        {s.age ?? "-"}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button
                          className="btn-danger"
                          onClick={() => del(s.id)}
                        >
                          {t("common.delete")}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
