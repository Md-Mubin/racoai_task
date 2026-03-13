"use client";
import { useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

export default function RegisterPage() {
  const { register } = useAuth();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
    } catch (err) {
      toast.error(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg flex items-center justify-center px-4">
      <div className="container">

        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-brand tracking-tight">RacoAI</h1>
          <p className="text-text-muted text-sm mt-2">Project Marketplace</p>
        </div>

        <div className="bg-surface border border-border rounded-lg shadow-sm p-8 max-w-xl mx-auto">
          <h2 className="text-xl font-extrabold text-text mb-1">Create account</h2>
          <p className="text-sm text-text-muted mb-6">
            You'll join as a{" "}
            <span className="font-semibold text-brand">Problem Solver</span> by default.
            An admin can upgrade you to Buyer.
          </p>

          <form onSubmit={submit} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              name="name"
              value={form.name}
              onChange={handle}
              placeholder="John Doe"
              required
            />
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
              placeholder="Min 6 characters"
              required
            />
            <Button type="submit" disabled={loading} size="lg" className="w-full mt-1 bg-black">
              {loading ? "Creating account..." : "Create account"}
            </Button>
          </form>

          <p className="text-center text-sm text-text-muted mt-6">
            Have an account?{" "}
            <Link href="/login" className="text-brand font-semibold hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
