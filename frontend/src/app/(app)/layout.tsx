"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hydrateAuth, useAuthStore } from "@/store/authStore";
import { Navbar } from "@/components/Navbar";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();

  useEffect(() => {
    hydrateAuth();
    if (!useAuthStore.getState().isAuthenticated) {
      router.push("/login");
    }
  }, []);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="page-container">{children}</main>
    </div>
  );
}
