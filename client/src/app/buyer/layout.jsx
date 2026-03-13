"use client";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
export default function BuyerLayout({ children }) {
  return <DashboardLayout allowedRole="BUYER">{children}</DashboardLayout>;
}
