"use client";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { formatDate, statusVariant } from "@/lib/utils";

export function SubmissionCard({ submission, canReview, onReview }) {
  return (
    <Card className="mb-2 bg-bg border-border-light">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="font-bold text-xs text-text">v{submission.version} — {submission.fileName}</span>
            <Badge variant={statusVariant(submission.reviewStatus)}>{submission.reviewStatus}</Badge>
          </div>
          {submission.notes && (
            <p className="text-xs text-text-muted mb-1">{submission.notes}</p>
          )}
          {submission.rejectionReason && (
            <p className="text-xs text-red-500 mt-1">Rejection: {submission.rejectionReason}</p>
          )}
          <p className="text-xs text-text-light mt-1">Submitted: {formatDate(submission.createdAt)}</p>
        </div>

        <div className="flex gap-2 shrink-0">
          <a href={submission.fileUrl} target="_blank" rel="noreferrer">
            <Button size="sm" variant="ghost">⬇ Download</Button>
          </a>
          {canReview && submission.reviewStatus === "PENDING" && (
            <>
              <Button size="sm" onClick={() => onReview(submission._id, "ACCEPTED")}>Accept</Button>
              <Button size="sm" variant="danger" onClick={() => onReview(submission._id, "REJECTED")}>Reject</Button>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
