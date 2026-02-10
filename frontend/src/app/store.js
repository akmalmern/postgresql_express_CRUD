import { configureStore } from "@reduxjs/toolkit";
import authReducer from "../features/auth/authSlice";
import profileReducer from "../features/profile/profileSlice";
import adminReducer from "../features/admin/adminSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
    profile: profileReducer,
    admin: adminReducer,
  },
});

export default store;
