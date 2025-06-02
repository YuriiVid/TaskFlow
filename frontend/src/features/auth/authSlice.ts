import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { TitleMessageResponse } from "./types";
import { AppUser } from "@shared/types";

interface VerifyEmailData {
  email: string;
  initialResponse: TitleMessageResponse;
}

interface AuthState {
  token: string | null;
  user: AppUser | null;
  verifyEmailData?: VerifyEmailData;
}

const initialState: AuthState = {
  token: null,
  user: null,
  verifyEmailData: undefined,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setToken(state, action: PayloadAction<string>) {
      state.token = action.payload;
    },
    logout(state) {
      state.token = null;
	  state.user = null;
    },
    setUser(state, action: PayloadAction<AppUser>) {
      state.user = action.payload;
    },
    setVerifyEmailData(state, action: PayloadAction<VerifyEmailData>) {
      state.verifyEmailData = action.payload;
    },
    clearVerifyEmailData(state) {
      state.verifyEmailData = undefined;
    },
  },
});

export const { setToken, logout, setUser, setVerifyEmailData, clearVerifyEmailData } = authSlice.actions;
export default authSlice.reducer;
