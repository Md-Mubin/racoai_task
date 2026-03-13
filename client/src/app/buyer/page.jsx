"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export default function BuyerRoot() {
  const router = useRouter();
  useEffect(() => { router.replace("/buyer/projects"); }, []);
  return null;
}
