"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useProject, useTasks, useUpdateTaskStatus,
  useTaskSubmissions, useReviewSubmission, useDeleteProject,
} from "@/hooks";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { Textarea } from "@/components/ui/Textarea";
import { ProjectStatusBar } from "@/components/projects/ProjectStatusBar";
import { TaskCard } from "@/components/tasks/TaskCard";
import { SubmissionCard } from "@/components/submissions/SubmissionCard";
import { formatDate, formatCurrency, statusVariant, statusLabel } from "@/lib/utils";

// Submissions per task
function TaskSubmissions({ taskId, projectId }) {
  const { data } = useTaskSubmissions(taskId);
  const reviewMutation = useReviewSubmission(projectId);
  const [rejectModal, setRejectModal] = useState(null);
  const [reason, setReason] = useState("");

  const submissions = data?.data?.submissions || [];
  if (submissions.length === 0) return null;

  const handleReview = (submissionId, status) => {
    if (status === "REJECTED") { setRejectModal(submissionId); return; }
    reviewMutation.mutate({ submissionId, data: { reviewStatus: "ACCEPTED" } });
  };

  const confirmReject = () => {
    reviewMutation.mutate({
      submissionId: rejectModal,
      data: { reviewStatus: "REJECTED", rejectionReason: reason },
    });
    setRejectModal(null);
    setReason("");
  };

  return (
    <>
      <div className="ml-4 mb-2 flex flex-col gap-1">
        {submissions.map((s) => (
          <SubmissionCard key={s._id} submission={s} canReview onReview={handleReview} />
        ))}
      </div>

      <Modal open={!!rejectModal} onClose={() => setRejectModal(null)} title="Reject Submission">
        <div className="flex flex-col gap-4">
          <Textarea
            label="Rejection reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Explain why this submission is being rejected..."
            rows={3}
          />
          <Button variant="danger" disabled={!reason} onClick={confirmReject}>
            Confirm Rejection
          </Button>
        </div>
      </Modal>
    </>
  );
}

export default function BuyerProjectDetailPage() {
  const { id } = useParams();
  const { data: projData, isLoading } = useProject(id);
  const { data: tasksData } = useTasks(id);
  const updateTaskStatus = useUpdateTaskStatus(id);
  const deleteProject = useDeleteProject();

  const project = projData?.data?.project;
  const tasks = tasksData?.data?.tasks || [];

  if (isLoading) return <Spinner />;
  if (!project) return <Empty message="Project not found." />;

  return (
    <div>
      <PageHeader
        title={project.title}
        subtitle={`${formatCurrency(project.budget)} · Due ${formatDate(project.deadline)}`}
        action={
          <div className="flex gap-2">
            {project.status === "OPEN" && (
              <>
                <Link href={`/buyer/projects/${id}/edit`}>
                  <Button variant="ghost">Edit</Button>
                </Link>
                <Link href={`/buyer/projects/${id}/requests`}>
                  <Button>View Requests</Button>
                </Link>
              </>
            )}
            {project.status === "OPEN" && (
              <Button
                variant="ghost"
                className="text-red-500 border-red-200 hover:bg-red-50"
                onClick={() => deleteProject.mutate(id)}
              >
                Delete
              </Button>
            )}
          </div>
        }
      />

      <ProjectStatusBar status={project.status} />

      {/* Info card */}
      <Card className="mb-6">
        <p className="text-sm text-text-muted leading-relaxed mb-4">{project.description}</p>
        <div className="flex flex-wrap gap-4 text-sm border-t border-border pt-4">
          <div>
            <span className="text-xs text-text-light font-semibold uppercase">Budget</span>
            <p className="font-bold text-text">{formatCurrency(project.budget)}</p>
          </div>
          <div>
            <span className="text-xs text-text-light font-semibold uppercase">Deadline</span>
            <p className="font-bold text-text">{formatDate(project.deadline)}</p>
          </div>
          <div>
            <span className="text-xs text-text-light font-semibold uppercase">Status</span>
            <p><Badge variant={statusVariant(project.status)}>{statusLabel(project.status)}</Badge></p>
          </div>
          {project.solver && (
            <div>
              <span className="text-xs text-text-light font-semibold uppercase">Assigned to</span>
              <p className="font-bold text-text">{project.solver.name}</p>
            </div>
          )}
        </div>
        {project.tags?.length > 0 && (
          <div className="flex gap-1.5 flex-wrap mt-3">
            {project.tags.map((t) => <Badge key={t} variant="brand">{t}</Badge>)}
          </div>
        )}
      </Card>

      {/* Tasks */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-base font-extrabold text-text">
          Tasks <span className="text-text-muted font-semibold text-sm">({tasks.length})</span>
        </h2>
      </div>

      {tasks.length === 0 ? (
        <Empty message="No tasks yet. The assigned solver will create tasks." />
      ) : (
        tasks.map((task) => (
          <div key={task._id}>
            <TaskCard
              task={task}
              role="BUYER"
              onStatusChange={(taskId, newStatus) =>
                updateTaskStatus.mutate({ taskId, newStatus })
              }
            />
            <TaskSubmissions taskId={task._id} projectId={id} />
          </div>
        ))
      )}
    </div>
  );
}
