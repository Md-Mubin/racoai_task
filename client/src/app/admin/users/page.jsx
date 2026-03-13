"use client";
import { useState } from "react";
import { useUsers, useUpdateRole } from "@/hooks";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { statusVariant } from "@/lib/utils";

const ROLES = ["ADMIN", "BUYER", "PROBLEM_SOLVER"];

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [pendingRoles, setPendingRoles] = useState({});
  const { data, isLoading } = useUsers(search ? { search } : undefined);
  const updateRole = useUpdateRole();

  const users = data?.data?.users || [];

  const handleSave = (userId) => {
    const role = pendingRoles[userId];
    if (!role) return;
    updateRole.mutate({ userId, role });
    setPendingRoles((p) => { const n = { ...p }; delete n[userId]; return n; });
  };

  return (
    <div>
      <PageHeader title="Users" subtitle="Manage user roles across the platform" />

      <div className="mb-5 max-w-sm">
        <Input
          placeholder="Search name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : users.length === 0 ? (
        <Empty message="No users found." />
      ) : (
        <div className="flex flex-col gap-2">
          {users.map((user) => (
            <Card key={user._id} className="hover:border-brand transition-colors">
              <div className="flex items-center justify-between gap-4 flex-wrap">
                {/* Avatar + info */}
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-brand-light flex items-center justify-center text-brand font-extrabold text-sm shrink-0">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-text">{user.name}</p>
                    <p className="text-xs text-text-muted">{user.email}</p>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-3">
                  <Badge variant={statusVariant(user.role)}>
                    {user.role.replace("_", " ")}
                  </Badge>
                  <select
                    value={pendingRoles[user._id] ?? user.role}
                    onChange={(e) =>
                      setPendingRoles((p) => ({ ...p, [user._id]: e.target.value }))
                    }
                    className="text-xs border border-border rounded-sm px-2 py-1.5 bg-surface text-text focus:outline-none focus:border-brand cursor-pointer font-semibold"
                  >
                    {ROLES.map((r) => (
                      <option key={r} value={r}>{r.replace("_", " ")}</option>
                    ))}
                  </select>
                  <Button
                    size="sm"
                    variant="secondary"
                    disabled={!pendingRoles[user._id] || pendingRoles[user._id] === user.role}
                    onClick={() => handleSave(user._id)}
                  >
                    Save
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
