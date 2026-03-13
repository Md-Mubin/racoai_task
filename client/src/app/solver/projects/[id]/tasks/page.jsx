"use client";
import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  useProject, useTasks, useCreateTask,
  useUpdateTaskStatus, useDeleteTask,
  useTaskSubmissions, useSubmitTask,
} from "@/hooks";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { Badge } from "@/components/ui/Badge";
import { ProjectStatusBar } from "@/components/projects/ProjectStatusBar";
import { TaskCard } from "@/components/tasks/TaskCard";
import { TaskForm } from "@/components/tasks/TaskForm";
import { SubmissionCard } from "@/components/submissions/SubmissionCard";
import { SubmissionUpload } from "@/components/submissions/SubmissionUpload";
import { statusVariant } from "@/lib/utils";

function TaskSubmissions({ taskId, projectId }) {
  const { data } = useTaskSubmissions(taskId);
  const submissions = data?.data?.submissions || [];
  if (submissions.length === 0) return null;
  return (
    <div className="ml-5 mb-3 flex flex-col gap-1.5">
      {submissions.map((s) => (
        <SubmissionCard key={s._id} submission={s} canReview={false} />
      ))}
    </div>
  );
}

export default function SolverTasksPage() {
  const { id } = useParams();
  const { data: projData } = useProject(id);
  const { data: tasksData, isLoading } = useTasks(id);
  const createTask      = useCreateTask(id);
  const updateStatus    = useUpdateTaskStatus(id);
  const deleteTask      = useDeleteTask(id);

  const [taskModal,   setTaskModal]   = useState(false);
  const [uploadModal, setUploadModal] = useState(null); // taskId

  const project = projData?.data?.project;
  const tasks   = tasksData?.data?.tasks || [];

  const counts = {
    total:     tasks.length,
    completed: tasks.filter((t) => t.status === "COMPLETED").length,
    pending:   tasks.filter((t) => t.status === "PENDING").length,
    active:    tasks.filter((t) => t.status === "IN_PROGRESS").length,
  };

  const canCreate = ["ASSIGNED", "IN_PROGRESS"].includes(project?.status);

  return (
    <div>
      <PageHeader
        title={project?.title || "Tasks"}
        subtitle="Create tasks, track progress and submit work"
        action={
          <div className="flex gap-2">
            <Link href={`/solver/projects/${id}`}>
              <Button variant="ghost">← Project</Button>
            </Link>
            {canCreate && (
              <Button onClick={() => setTaskModal(true)}>+ Add Task</Button>
            )}
          </div>
        }
      />

      {project && <ProjectStatusBar status={project.status} />}

      {/* Summary bar */}
      {tasks.length > 0 && (
        <Card className="mb-5 bg-brand-light border-brand/20">
          <div className="flex gap-6 text-sm">
            <div>
              <span className="text-text-muted font-semibold">Total </span>
              <span className="font-extrabold text-text">{counts.total}</span>
            </div>
            <div>
              <span className="text-text-muted font-semibold">Active </span>
              <span className="font-extrabold text-amber-600">{counts.active}</span>
            </div>
            <div>
              <span className="text-text-muted font-semibold">Pending </span>
              <span className="font-extrabold text-text-muted">{counts.pending}</span>
            </div>
            <div>
              <span className="text-text-muted font-semibold">Done </span>
              <span className="font-extrabold text-green-600">{counts.completed}</span>
            </div>
          </div>
        </Card>
      )}

      {isLoading ? (
        <Spinner />
      ) : tasks.length === 0 ? (
        <Empty message={canCreate ? "No tasks yet. Add your first task to start working." : "Tasks will appear here once you are assigned to this project."} />
      ) : (
        tasks.map((task) => (
          <div key={task._id}>
            <TaskCard
              task={task}
              role="PROBLEM_SOLVER"
              onStatusChange={(taskId, newStatus) => updateStatus.mutate({ taskId, newStatus })}
              onDelete={(taskId) => deleteTask.mutate(taskId)}
              onSubmitWork={(taskId) => setUploadModal(taskId)}
            />
            <TaskSubmissions taskId={task._id} projectId={id} />
          </div>
        ))
      )}

      {/* Create task modal */}
      <Modal open={taskModal} onClose={() => setTaskModal(false)} title="Create New Task">
        <TaskForm
          onSubmit={async (data) => {
            await createTask.mutateAsync(data);
            setTaskModal(false);
          }}
          loading={createTask.isPending}
        />
      </Modal>

      {/* Submit ZIP modal */}
      <Modal open={!!uploadModal} onClose={() => setUploadModal(null)} title="Submit Work (ZIP)">
        {uploadModal && (
          <SubmitWrapper
            taskId={uploadModal}
            projectId={id}
            onDone={() => setUploadModal(null)}
          />
        )}
      </Modal>
    </div>
  );
}

function SubmitWrapper({ taskId, projectId, onDone }) {
  const submitTask = useSubmitTask(taskId, projectId);

  const handleSubmit = async ({ formData, onUploadProgress }) => {
    await submitTask.mutateAsync({ formData, onUploadProgress });
    onDone();
  };

  return (
    <SubmissionUpload onSubmit={handleSubmit} loading={submitTask.isPending} />
  );
}
