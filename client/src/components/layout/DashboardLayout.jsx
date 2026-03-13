"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores";
import { Sidebar } from "@/components/layout/Sidebar";
import { Spinner } from "@/components/ui/Spinner";

export function DashboardLayout({ children, allowedRole }) {
  const router = useRouter();
  const { user, isLoading } = useAuthStore();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isLoading) return;
    if (!user || user.role !== allowedRole) {
      router.push("/login");
    } else {
      setReady(true);
    }
  }, [user, isLoading, allowedRole]);

  if (!ready) return <Spinner />;

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar />
      <main className="flex-1 p-8 overflow-y-auto max-w-5xl">
        {children}
      </main>
    </div>
  );
}
