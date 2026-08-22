import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

export type UserRole = "admin" | "agente" | "asistente";

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  status: "idle" | "authenticated" | "unauthenticated";
}

const initialState: AuthState = {
  user: null,
  token: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials(state, action: PayloadAction<{ user: AuthUser; token: string }>) {
      state.user = action.payload.user;
      state.token = action.payload.token;
      state.status = "authenticated";
    },
    clearCredentials(state) {
      state.user = null;
      state.token = null;
      state.status = "unauthenticated";
    },
  },
});

export const { setCredentials, clearCredentials } = authSlice.actions;
export default authSlice.reducer;
