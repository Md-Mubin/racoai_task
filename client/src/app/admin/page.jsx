"use client";
import { useAdminStats } from "@/hooks";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";

function StatCard({ label, value, icon, sub }) {
  return (
    <Card>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-text-muted uppercase tracking-wider mb-2">{label}</p>
          <p className="text-4xl font-extrabold text-text">{value ?? 0}</p>
          {sub && <p className="text-xs text-text-light mt-1">{sub}</p>}
        </div>
        <span className="text-2xl">{icon}</span>
      </div>
    </Card>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useAdminStats();

  if (isLoading) return <Spinner />;

  const s = data?.data;

  return (
    <div>
      <PageHeader
        title="Admin Dashboard"
        subtitle="Platform-wide overview"
      />

      <div className="mb-2">
        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Users</p>
        <div className="grid grid-cols-3 gap-4 mb-6">
          <StatCard label="Total Users"     value={s?.users?.total}   icon="👥" />
          <StatCard label="Buyers"          value={s?.users?.buyers}  icon="🛒" />
          <StatCard label="Problem Solvers" value={s?.users?.solvers} icon="🔧" />
        </div>

        <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">Projects</p>
        <div className="grid grid-cols-3 gap-4">
          <StatCard label="Total Projects" value={s?.projects?.total}     icon="📁" />
          <StatCard label="Open"           value={s?.projects?.open}      icon="🟢" sub="Accepting requests" />
          <StatCard label="Completed"      value={s?.projects?.completed} icon="✅" />
        </div>
      </div>
    </div>
  );
}
