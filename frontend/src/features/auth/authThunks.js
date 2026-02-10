import { createAsyncThunk } from "@reduxjs/toolkit";
import http from "../../api/http";

function errPayload(e) {
  return e?.response?.data || { message: "Error" };
}

export const signupThunk = createAsyncThunk(
  "auth/signup",
  async (body, { rejectWithValue }) => {
    try {
      const { data } = await http.post("/api/auth/student/signup", body);
      return data;
    } catch (e) {
      return rejectWithValue(errPayload(e));
    }
  },
);

export const signinThunk = createAsyncThunk(
  "auth/signin",
  async ({ email, password }, { rejectWithValue }) => {
    try {
      const { data } = await http.post("/api/auth/signin", { email, password });
      return data;
    } catch (e) {
      return rejectWithValue(errPayload(e));
    }
  },
);

export const logoutThunk = createAsyncThunk(
  "auth/logout",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await http.post("/api/auth/logout");
      return data;
    } catch (e) {
      return rejectWithValue(errPayload(e));
    }
  },
);

export const refreshThunk = createAsyncThunk(
  "auth/refresh",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await http.post("/api/auth/refresh");
      return data;
    } catch (e) {
      return rejectWithValue(errPayload(e));
    }
  },
);

export const getProfileThunk = createAsyncThunk(
  "auth/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await http.get("/api/profile");
      return data;
    } catch (e) {
      return rejectWithValue(errPayload(e));
    }
  },
);

export const forgotPasswordThunk = createAsyncThunk(
  "auth/forgot",
  async ({ email }, { rejectWithValue }) => {
    try {
      const { data } = await http.post("/api/auth/forgot", { email });
      return data;
    } catch (e) {
      return rejectWithValue(errPayload(e));
    }
  },
);

export const resetPasswordThunk = createAsyncThunk(
  "auth/reset",
  async ({ email, code, newPassword }, { rejectWithValue }) => {
    try {
      const { data } = await http.post("/api/auth/reset", {
        email,
        code,
        newPassword,
      });
      return data;
    } catch (e) {
      return rejectWithValue(errPayload(e));
    }
  },
);

export const googleAuthThunk = createAsyncThunk(
  "auth/google",
  async ({ idToken }, { rejectWithValue }) => {
    try {
      const { data } = await http.post("/api/auth/google", { idToken });
      return data;
    } catch (e) {
      return rejectWithValue(errPayload(e));
    }
  },
);
