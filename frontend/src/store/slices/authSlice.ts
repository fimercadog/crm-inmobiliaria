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
  status: "idle" | "authenticated" | "unauthenticated";
}

const initialState: AuthState = {
  user: null,
  status: "idle",
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    // No token here — it lives only in the httpOnly cookie the backend sets,
    // which JS was never meant to read in the first place.
    setCredentials(state, action: PayloadAction<{ user: AuthUser }>) {
      state.user = action.payload.user;
      state.status = "authenticated";
    },
    clearCredentials(state) {
      state.user = null;
      state.status = "unauthenticated";
    },
    updateUser(state, action: PayloadAction<AuthUser>) {
      state.user = action.payload;
    },
  },
});

export const { setCredentials, clearCredentials, updateUser } = authSlice.actions;
export default authSlice.reducer;
