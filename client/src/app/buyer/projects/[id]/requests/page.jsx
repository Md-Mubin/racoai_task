"use client";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useProject, useProjectRequests, useAssignSolver } from "@/hooks";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { RequestCard } from "@/components/requests/RequestCard";

export default function BuyerRequestsPage() {
  const { id } = useParams();
  const { data: projData } = useProject(id);
  const { data, isLoading } = useProjectRequests(id);
  const assignSolver = useAssignSolver(id);

  const project = projData?.data?.project;
  const requests = data?.data?.requests || [];
  const pending  = requests.filter((r) => r.status === "PENDING");
  const others   = requests.filter((r) => r.status !== "PENDING");

  return (
    <div>
      <PageHeader
        title="Solver Requests"
        subtitle={`${requests.length} application${requests.length !== 1 ? "s" : ""} for "${project?.title || ""}"`}
        action={
          <Link href={`/buyer/projects/${id}`}>
            <Button variant="ghost">← Back to Project</Button>
          </Link>
        }
      />

      {isLoading ? (
        <Spinner />
      ) : requests.length === 0 ? (
        <Empty message="No requests yet. Share your project to get applications." />
      ) : (
        <div>
          {pending.length > 0 && (
            <div className="mb-6">
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                Pending ({pending.length})
              </p>
              {pending.map((r) => (
                <RequestCard
                  key={r._id}
                  request={r}
                  canAssign={project?.status === "OPEN"}
                  onAssign={(requestId) => assignSolver.mutate(requestId)}
                />
              ))}
            </div>
          )}

          {others.length > 0 && (
            <div>
              <p className="text-xs font-bold text-text-muted uppercase tracking-wider mb-3">
                Processed ({others.length})
              </p>
              {others.map((r) => (
                <RequestCard key={r._id} request={r} canAssign={false} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
