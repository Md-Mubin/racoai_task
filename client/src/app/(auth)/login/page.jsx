"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function LoginPage() {
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(form);
    } catch (err) {
      toast.error(err.response?.data?.message || "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-brand tracking-tight">RacoAI</h1>
          <p className="text-text-muted text-sm mt-2">Project Marketplace</p>
        </div>

        <div className="bg-surface border border-border rounded-lg shadow-sm p-8">
          <h2 className="text-xl font-extrabold text-text mb-1">Welcome back</h2>
          <p className="text-sm text-text-muted mb-6">Sign in to continue</p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <Input
              label="Email"
              name="email"
              type="email"
              value={form.email}
              onChange={handle}
              placeholder="you@example.com"
              required
            />
            <Input
              label="Password"
              name="password"
              type="password"
              value={form.password}
              onChange={handle}
              placeholder="••••••••"
              required
            />
            <Button type="submit" disabled={loading} size="lg" className="w-full mt-1 bg-black">
              {loading ? "Signing in..." : "Sign in"}
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            No account?{" "}
            <Link href="/register" className="text-brand font-semibold hover:underline">
              Create one
            </Link>
          </p>
        </div>

        <p className="text-center text-xs text-text-light mt-4">
          Demo: admin@racoai.com - password: @Pass123
        </p>
      </div>
    </div>
  );
}
