"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks";

const NAV = {
  ADMIN:          [{ label: "Dashboard", href: "/admin" }, { label: "Users", href: "/admin/users" }],
  BUYER:          [{ label: "Dashboard", href: "/buyer" }, { label: "My Projects", href: "/buyer/projects" }],
  PROBLEM_SOLVER: [{ label: "Dashboard", href: "/solver" }, { label: "Browse Projects", href: "/solver/projects" }, { label: "My Profile", href: "/solver/profile" }],
};

export function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const items = NAV[user?.role] || [];

  return (
    <aside className="w-56 min-h-screen bg-surface border-r border-border flex flex-col shrink-0">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <div className="text-xl font-extrabold text-brand">RacoAI</div>
        <div className="text-xs text-text-muted mt-0.5 font-medium">
          {user?.role?.replace("_", " ")}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 flex flex-col gap-0.5">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link key={item.href} href={item.href}
              className={`block px-3 py-2.5 rounded-md text-sm font-semibold transition-colors
                ${active ? "bg-brand-light text-brand" : "text-text-muted hover:bg-bg hover:text-text"}`}>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* User */}
      <div className="px-5 py-4 border-t border-border">
        <p className="text-sm font-bold text-text truncate">{user?.name}</p>
        <p className="text-xs text-text-light truncate mb-3">{user?.email}</p>
        <button onClick={logout}
          className="text-xs font-semibold text-red-500 hover:text-red-700 transition-colors bg-transparent border-none cursor-pointer p-0">
          Logout →
        </button>
      </div>
    </aside>
  );
}
