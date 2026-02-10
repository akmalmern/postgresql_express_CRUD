import { createAsyncThunk } from "@reduxjs/toolkit";
import http from "../../api/http";

export const listStudentsThunk = createAsyncThunk(
  "admin/listStudents",
  async (_, { rejectWithValue }) => {
    try {
      const res = await http.get("/api/admin/students");
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "Server error" });
    }
  },
);

export const deleteStudentThunk = createAsyncThunk(
  "admin/deleteStudent",
  async (studentId, { rejectWithValue }) => {
    try {
      const res = await http.delete(`/api/admin/students/${studentId}`);
      return { ...res.data, studentId };
    } catch (e) {
      return rejectWithValue(e.response?.data || { message: "Server error" });
    }
  },
);
