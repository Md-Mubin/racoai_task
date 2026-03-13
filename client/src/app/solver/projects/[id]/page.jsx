"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { useProject, useCreateRequest, useMyRequests, useWithdrawRequest } from "@/hooks";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { ProjectStatusBar } from "@/components/projects/ProjectStatusBar";
import { formatDate, formatCurrency, statusVariant, statusLabel } from "@/lib/utils";

export default function SolverProjectDetailPage() {
  const { id } = useParams();
  const { data, isLoading } = useProject(id);
  const { data: myReqData } = useMyRequests();
  const createRequest = useCreateRequest(id);
  const withdrawRequest = useWithdrawRequest();

  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ message: "", proposedBudget: "", estimatedDays: "" });

  const project = data?.data?.project;
  const allMyRequests = myReqData?.data?.requests || [];
  const myRequest = allMyRequests.find(
    (r) => r.project?._id === id || r.project === id
  );

  if (isLoading) return <Spinner />;
  if (!project) return <Empty message="Project not found." />;

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    await createRequest.mutateAsync({
      message: form.message,
      proposedBudget: form.proposedBudget ? Number(form.proposedBudget) : undefined,
      estimatedDays:  form.estimatedDays  ? Number(form.estimatedDays)  : undefined,
    });
    setModal(false);
    setForm({ message: "", proposedBudget: "", estimatedDays: "" });
  };

  const isAssignedToMe = project.solver?._id === myRequest?.solver || project.solver === myRequest?.solver;

  return (
    <div>
      <PageHeader
        title={project.title}
        subtitle={`${formatCurrency(project.budget)} · Due ${formatDate(project.deadline)}`}
        action={
          <div className="flex gap-2 items-center">
            {project.status === "OPEN" && !myRequest && (
              <Button onClick={() => setModal(true)}>Apply to Project</Button>
            )}
            {myRequest && (
              <div className="flex items-center gap-2">
                <Badge variant={statusVariant(myRequest.status)}>
                  Request {myRequest.status}
                </Badge>
                {myRequest.status === "PENDING" && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 border-red-200 hover:bg-red-50"
                    onClick={() => withdrawRequest.mutate(myRequest._id)}
                  >
                    Withdraw
                  </Button>
                )}
                {myRequest.status === "ACCEPTED" && (
                  <Link href={`/solver/projects/${id}/tasks`}>
                    <Button size="sm">Manage Tasks →</Button>
                  </Link>
                )}
              </div>
            )}
          </div>
        }
      />

      <ProjectStatusBar status={project.status} />

      {/* Main info */}
      <Card className="mb-5">
        <p className="text-sm text-text-muted leading-relaxed mb-5">{project.description}</p>

        <div className="grid grid-cols-2 gap-4 border-t border-border pt-4">
          <div>
            <p className="text-xs text-text-light font-semibold uppercase mb-1">Budget</p>
            <p className="text-base font-extrabold text-text">{formatCurrency(project.budget)}</p>
          </div>
          <div>
            <p className="text-xs text-text-light font-semibold uppercase mb-1">Deadline</p>
            <p className="text-base font-extrabold text-text">{formatDate(project.deadline)}</p>
          </div>
          <div>
            <p className="text-xs text-text-light font-semibold uppercase mb-1">Status</p>
            <Badge variant={statusVariant(project.status)}>{statusLabel(project.status)}</Badge>
          </div>
          <div>
            <p className="text-xs text-text-light font-semibold uppercase mb-1">Posted by</p>
            <p className="text-sm font-bold text-text">{project.buyer?.name}</p>
          </div>
        </div>

        {project.tags?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-4 pt-4 border-t border-border">
            {project.tags.map((t) => <Badge key={t} variant="brand">{t}</Badge>)}
          </div>
        )}
      </Card>

      {/* Apply modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="Apply to this Project">
        <form onSubmit={submit} className="flex flex-col gap-4">
          <Textarea
            label="Cover message"
            name="message"
            value={form.message}
            onChange={handle}
            placeholder="Explain why you're the right fit, your approach, relevant experience..."
            rows={4}
            required
          />
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Your budget ($)"
              name="proposedBudget"
              type="number"
              value={form.proposedBudget}
              onChange={handle}
              placeholder="e.g. 2000"
            />
            <Input
              label="Estimated days"
              name="estimatedDays"
              type="number"
              value={form.estimatedDays}
              onChange={handle}
              placeholder="e.g. 30"
            />
          </div>
          <Button type="submit" disabled={createRequest.isPending} size="lg">
            {createRequest.isPending ? "Submitting..." : "Submit Application"}
          </Button>
        </form>
      </Modal>
    </div>
  );
}
