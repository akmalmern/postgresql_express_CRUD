import { createAsyncThunk } from "@reduxjs/toolkit";
import http from "../../api/http";
import { clearAuth } from "../auth/authSlice";

function errPayload(e) {
  return e?.response?.data || { message: "Server error" };
}

export const getProfileThunk = createAsyncThunk(
  "profile/get",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await http.get("/api/profile");
      return data;
    } catch (e) {
      return rejectWithValue(errPayload(e));
    }
  },
);

export const updateProfileThunk = createAsyncThunk(
  "profile/updateText",
  async (payload, { rejectWithValue }) => {
    try {
      const { data } = await http.put("/api/profile", payload);
      return data;
    } catch (e) {
      return rejectWithValue(errPayload(e));
    }
  },
);

export const uploadAvatarThunk = createAsyncThunk(
  "profile/uploadAvatar",
  async (file, { rejectWithValue }) => {
    try {
      const fd = new FormData();
      fd.append("image", file);

      const { data } = await http.put("/api/profile/avatar", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data;
    } catch (e) {
      return rejectWithValue(errPayload(e));
    }
  },
);

export const deleteAvatarThunk = createAsyncThunk(
  "profile/deleteAvatar",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await http.delete("/api/profile/avatar");
      return data;
    } catch (e) {
      return rejectWithValue(errPayload(e));
    }
  },
);

export const requestDeleteAccountThunk = createAsyncThunk(
  "profile/requestDeleteAccount",
  async ({ email }, { rejectWithValue }) => {
    try {
      const { data } = await http.post("/api/profile/delete/request", {
        email,
      });
      return data;
    } catch (e) {
      return rejectWithValue(errPayload(e));
    }
  },
);

export const confirmDeleteAccountThunk = createAsyncThunk(
  "profile/confirmDeleteAccount",
  async ({ email, code }, { rejectWithValue, dispatch }) => {
    try {
      const { data } = await http.post("/api/profile/delete/confirm", {
        email,
        code,
      });
      dispatch(clearAuth()); // ✅ account o‘chdi -> token/user tozalash
      return data;
    } catch (e) {
      return rejectWithValue(errPayload(e));
    }
  },
);
