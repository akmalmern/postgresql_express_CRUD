// import { createSlice } from "@reduxjs/toolkit";
// import {
//   signinThunk,
//   logoutThunk,
//   refreshThunk,
//   getProfileThunk,
//   googleAuthThunk,
// } from "./authThunks";

// const initialState = {
//   accessToken: localStorage.getItem("accessToken") || null,
//   user: null,
//   status: "idle",
// };

// const authSlice = createSlice({
//   name: "auth",
//   initialState,
//   reducers: {
//     setAccessToken(state, action) {
//       state.accessToken = action.payload;
//       if (action.payload) localStorage.setItem("accessToken", action.payload);
//       else localStorage.removeItem("accessToken");
//     },
//     setUser(state, action) {
//       state.user = action.payload;
//     },
//     clearAuth(state) {
//       state.accessToken = null;
//       state.user = null;
//       localStorage.removeItem("accessToken");
//     },
//   },
//   extraReducers: (b) => {
//     b.addCase(signinThunk.fulfilled, (state, action) => {
//       state.accessToken = action.payload.accessToken;
//       state.user = action.payload.user;
//       localStorage.setItem("accessToken", action.payload.accessToken);
//     });

//     b.addCase(googleAuthThunk.fulfilled, (state, action) => {
//       state.accessToken = action.payload.accessToken;
//       state.user = action.payload.user;
//       localStorage.setItem("accessToken", action.payload.accessToken);
//     });

//     b.addCase(logoutThunk.fulfilled, (state) => {
//       state.accessToken = null;
//       state.user = null;
//       localStorage.removeItem("accessToken");
//     });

//     b.addCase(refreshThunk.fulfilled, (state, action) => {
//       state.accessToken = action.payload.accessToken;
//       localStorage.setItem("accessToken", action.payload.accessToken);
//     });

//     b.addCase(getProfileThunk.fulfilled, (state, action) => {
//       state.user = action.payload.user;
//     });
//   },
// });

// export const { setAccessToken, setUser, clearAuth } = authSlice.actions;
// export default authSlice.reducer;

import { createSlice } from "@reduxjs/toolkit";
import {
  signinThunk,
  logoutThunk,
  refreshThunk,
  getProfileThunk,
  googleAuthThunk,
} from "./authThunks";

const initialState = {
  accessToken: localStorage.getItem("accessToken") || null,
  user: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setAccessToken(state, action) {
      state.accessToken = action.payload;
      if (action.payload) localStorage.setItem("accessToken", action.payload);
      else localStorage.removeItem("accessToken");
    },
    setUser(state, action) {
      state.user = action.payload;
    },
    clearAuth(state) {
      state.accessToken = null;
      state.user = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("hasSession"); // ✅
    },
  },
  extraReducers: (b) => {
    b.addCase(signinThunk.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("hasSession", "1"); // ✅
    });

    b.addCase(googleAuthThunk.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user;
      localStorage.setItem("accessToken", action.payload.accessToken);
      localStorage.setItem("hasSession", "1"); // ✅
    });

    b.addCase(logoutThunk.fulfilled, (state) => {
      state.accessToken = null;
      state.user = null;
      localStorage.removeItem("accessToken");
      localStorage.removeItem("hasSession"); // ✅
    });

    b.addCase(refreshThunk.fulfilled, (state, action) => {
      state.accessToken = action.payload.accessToken;
      localStorage.setItem("accessToken", action.payload.accessToken);
      // hasSession qoladi (cookie bor deb turadi)
    });

    b.addCase(getProfileThunk.fulfilled, (state, action) => {
      state.user = action.payload.user;
    });
  },
});

export const { setAccessToken, setUser, clearAuth } = authSlice.actions;
export default authSlice.reducer;
