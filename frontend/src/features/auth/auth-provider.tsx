"use client";

import { useEffect } from "react";
import { fetchCurrentUser } from "@/features/auth/api";
import { useAppDispatch } from "@/hooks/redux";
import { clearCredentials, setCredentials } from "@/store/slices/authSlice";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    // The auth cookie is httpOnly, so JS can't check for its presence up
    // front the way it could read a localStorage token — the browser just
    // attaches it (or doesn't) on this request, and a 401 means "no session."
    fetchCurrentUser()
      .then((user) => dispatch(setCredentials({ user })))
      .catch(() => dispatch(clearCredentials()));
  }, [dispatch]);

  return <>{children}</>;
}
