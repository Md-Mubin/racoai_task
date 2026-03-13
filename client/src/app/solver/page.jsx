"use client";
import Link from "next/link";
import { useMyRequests } from "@/hooks";
import { useAuthStore } from "@/stores";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { formatDate, formatCurrency, statusVariant } from "@/lib/utils";

export default function SolverDashboard() {
  const { user } = useAuthStore();
  const { data, isLoading } = useMyRequests();

  const requests  = data?.data?.requests || [];
  const assigned  = requests.filter((r) => r.status === "ACCEPTED");
  const pending   = requests.filter((r) => r.status === "PENDING");
  const rejected  = requests.filter((r) => r.status === "REJECTED");

  return (
    <div>
      <PageHeader
        title={`Welcome, ${user?.name?.split(" ")[0]} 👋`}
        subtitle="Here's what's happening with your work"
        action={
          <Link href="/solver/projects">
            <Button>Browse Projects</Button>
          </Link>
        }
      />

      {isLoading ? <Spinner /> : (
        <div className="flex flex-col gap-8">

          {/* Active assignments */}
          <section>
            <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
              Active Assignments ({assigned.length})
            </p>
            {assigned.length === 0 ? (
              <Card>
                <p className="text-sm text-text-muted text-center py-4">
                  No active assignments yet.{" "}
                  <Link href="/solver/projects" className="text-brand font-semibold hover:underline">
                    Browse open projects →
                  </Link>
                </p>
              </Card>
            ) : (
              assigned.map((r) => (
                <Card key={r._id} className="mb-3 border-l-4 border-l-brand">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <p className="font-bold text-text text-sm mb-1">{r.project?.title}</p>
                      <div className="flex gap-4 text-xs text-text-muted">
                        <span>💰 {formatCurrency(r.project?.budget)}</span>
                        <span>📅 Due {formatDate(r.project?.deadline)}</span>
                        <Badge variant={statusVariant(r.project?.status)}>
                          {r.project?.status?.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                    <Link href={`/solver/projects/${r.project?._id}/tasks`}>
                      <Button size="sm">Manage Tasks →</Button>
                    </Link>
                  </div>
                </Card>
              ))
            )}
          </section>

          {/* Pending requests */}
          {pending.length > 0 && (
            <section>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                Pending Requests ({pending.length})
              </p>
              {pending.map((r) => (
                <Card key={r._id} className="mb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-text text-sm mb-1">{r.project?.title}</p>
                      <p className="text-xs text-text-muted">Applied {formatDate(r.createdAt)}</p>
                    </div>
                    <Badge variant="pending">PENDING</Badge>
                  </div>
                </Card>
              ))}
            </section>
          )}

          {/* Rejected */}
          {rejected.length > 0 && (
            <section>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                Past Rejections ({rejected.length})
              </p>
              {rejected.map((r) => (
                <Card key={r._id} className="mb-3 opacity-60">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-bold text-text text-sm mb-1">{r.project?.title}</p>
                      <p className="text-xs text-text-muted">Applied {formatDate(r.createdAt)}</p>
                    </div>
                    <Badge variant="rejected">REJECTED</Badge>
                  </div>
                </Card>
              ))}
            </section>
          )}

        </div>
      )}
    </div>
  );
}
