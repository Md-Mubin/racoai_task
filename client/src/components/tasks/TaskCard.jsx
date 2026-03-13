"use client";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { formatDate, statusVariant, statusLabel } from "@/lib/utils";

const solverNext  = { PENDING: "IN_PROGRESS", IN_PROGRESS: "SUBMITTED", REJECTED: "IN_PROGRESS" };
const buyerReview = { SUBMITTED: ["COMPLETED", "REJECTED"] };

export function TaskCard({ task, role, onStatusChange, onDelete, onSubmitWork }) {
  const next = solverNext[task.status];
  const buyerActions = buyerReview[task.status];

  return (
    <Card className="mb-3">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-text text-sm">{task.title}</span>
            <Badge variant={statusVariant(task.status)}>{statusLabel(task.status)}</Badge>
            <Badge variant={statusVariant(task.priority)}>{task.priority}</Badge>
          </div>
          <p className="text-xs text-text-muted leading-relaxed mb-2">{task.description}</p>
          <p className="text-xs text-text-light">Due: {formatDate(task.deadline)}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          {role === "PROBLEM_SOLVER" && next && (
            <Button className={"text-white"} size="sm" variant="secondary" onClick={() => onStatusChange(task._id, next)}>
              → {statusLabel(next)}
            </Button>
          )}
          {role === "PROBLEM_SOLVER" && task.status === "IN_PROGRESS" && onSubmitWork && (
            <Button className={"text-white"} size="sm" onClick={() => onSubmitWork(task._id)}>
              Submit ZIP
            </Button>
          )}
          {role === "BUYER" && buyerActions?.map((s) => (
            <Button className="text-white" key={s} size="sm"
              variant={s === "REJECTED" ? "danger" : "primary"}
              onClick={() => onStatusChange(task._id, s)}>
              {s}
            </Button>
          ))}
          {role === "PROBLEM_SOLVER" && task.status === "PENDING" && onDelete && (
            <Button size="sm" variant="ghost" onClick={() => onDelete(task._id)}
              className="text-red-500 border-red-200 hover:bg-red-50">
              Delete
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
