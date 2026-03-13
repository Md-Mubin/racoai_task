"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { ROLE_HOME } from "@/constants";

export default function RootPage() {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();

  useEffect(() => {
    if (!isLoading) {
      router.replace(user ? (ROLE_HOME[user.role] || "/login") : "/login");
    }
  }, [user, isLoading]);

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center">
      <div className="w-7 h-7 rounded-full border-2 border-border border-t-brand animate-spin" />
    </div>
  );
}
