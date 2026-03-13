"use client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, formatCurrency, statusVariant } from "@/lib/utils";

export function RequestCard({ request, onAssign, canAssign, onWithdraw, canWithdraw }) {
  return (
    <Card className="mb-3">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-sm text-text">{request.solver?.name}</span>
            <span className="text-xs text-text-muted">{request.solver?.email}</span>
            <Badge variant={statusVariant(request.status)}>{request.status}</Badge>
          </div>

          <p className="text-sm text-text-muted leading-relaxed mb-3">{request.message}</p>

          <div className="flex gap-4 text-xs text-text-light mb-2">
            {request.proposedBudget && <span>Proposed: <strong className="text-text">{formatCurrency(request.proposedBudget)}</strong></span>}
            {request.estimatedDays  && <span>Est. <strong className="text-text">{request.estimatedDays} days</strong></span>}
            <span>Applied: {formatDate(request.createdAt)}</span>
          </div>

          {request.solver?.skills?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap">
              {request.solver.skills.map((s) => (
                <Badge key={s} variant="brand">{s}</Badge>
              ))}
            </div>
          )}
        </div>

        <div className="flex gap-2 shrink-0">
          {canAssign && request.status === "PENDING" && (
            <Button size="sm" onClick={() => onAssign(request._id)}>Assign</Button>
          )}
          {canWithdraw && request.status === "PENDING" && (
            <Button size="sm" variant="ghost" onClick={() => onWithdraw(request._id)}
              className="text-red-500 border-red-200 hover:bg-red-50">
              Withdraw
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
