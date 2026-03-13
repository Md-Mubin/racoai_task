"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
export default function SolverLayout({ children }) {
  return <DashboardLayout allowedRole="PROBLEM_SOLVER">{children}</DashboardLayout>;
}
