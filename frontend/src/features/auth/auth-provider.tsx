"use client";

import { useEffect } from "react";
import { fetchCurrentUser } from "@/features/auth/api";
import { useAppDispatch } from "@/hooks/redux";
import { getStoredToken, setStoredToken } from "@/lib/api/axios";
import { clearCredentials, setCredentials } from "@/store/slices/authSlice";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();

  useEffect(() => {
    const token = getStoredToken();

    if (!token) {
      dispatch(clearCredentials());
      return;
    }

    fetchCurrentUser()
      .then((user) => dispatch(setCredentials({ user, token })))
      .catch(() => {
        setStoredToken(null);
        dispatch(clearCredentials());
      });
  }, [dispatch]);

  return <>{children}</>;
}
