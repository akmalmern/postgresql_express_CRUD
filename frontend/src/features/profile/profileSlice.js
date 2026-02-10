import { createSlice } from "@reduxjs/toolkit";
import {
  getProfileThunk,
  updateProfileThunk,
  uploadAvatarThunk,
  deleteAvatarThunk,
} from "./profileThunks";

const initialState = {
  profile: null,
  status: "idle",
  error: null,
};

const slice = createSlice({
  name: "profile",
  initialState,
  reducers: {},
  extraReducers: (b) => {
    b.addCase(getProfileThunk.pending, (s) => {
      s.status = "loading";
      s.error = null;
    });
    b.addCase(getProfileThunk.fulfilled, (s, a) => {
      s.status = "succeeded";
      s.profile = a.payload.user;
    });
    b.addCase(getProfileThunk.rejected, (s, a) => {
      s.status = "failed";
      s.error = a.payload;
    });

    b.addCase(updateProfileThunk.fulfilled, (s, a) => {
      s.profile = a.payload.user;
    });

    b.addCase(uploadAvatarThunk.fulfilled, (s, a) => {
      s.profile = a.payload.user;
    });

    b.addCase(deleteAvatarThunk.fulfilled, (s, a) => {
      s.profile = a.payload.user;
    });
  },
});

export default slice.reducer;
