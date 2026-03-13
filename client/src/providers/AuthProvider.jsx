"use client";
import { useEffect } from "react";
import { useAuthStore } from "@/stores";
import { authService } from "@/services";

export function AuthProvider({ children }) {
  const { setAuth, logout, setLoading } = useAuthStore();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const stored = localStorage.getItem("user");
    if (!token || !stored) { setLoading(false); return; }

    setAuth({ token, user: JSON.parse(stored) });

    authService.getMe()
      .then((res) => setAuth({ token, user: res.data.data.user }))
      .catch(() => logout());
  }, []);

  return <>{children}</>;
}
