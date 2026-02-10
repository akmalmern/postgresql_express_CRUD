import { createSlice } from "@reduxjs/toolkit";
import { listStudentsThunk, deleteStudentThunk } from "./adminThunks";

const initialState = { students: [], status: "idle", error: null };

const slice = createSlice({
  name: "admin",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(listStudentsThunk.pending, (s) => {
      s.status = "loading";
    });
    b.addCase(listStudentsThunk.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.students = a.payload.students || [];
    });
    b.addCase(listStudentsThunk.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload;
    });

    b.addCase(deleteStudentThunk.fulfilled, (s, a) => {
      s.students = s.students.filter((x) => x.id !== a.payload.studentId);
    });
  },
});

export default slice.reducer;
