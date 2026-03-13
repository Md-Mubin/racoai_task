"use client";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { formatDate, formatCurrency, statusVariant, statusLabel } from "@/lib/utils";

export function ProjectCard({ project, role }) {
  const href =
    role === "BUYER"          ? `/buyer/projects/${project._id}`  :
    role === "PROBLEM_SOLVER" ? `/solver/projects/${project._id}` :
                                `/admin/projects/${project._id}`;

  return (
    <Card className="mb-3 hover:border-brand transition-colors">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            <Link href={href} className="font-bold text-text hover:text-brand transition-colors text-sm">
              {project.title}
            </Link>
          </div>
          <p className="text-xs text-text-muted leading-relaxed mb-3 line-clamp-2">
            {project.description}
          </p>
          <div className="flex flex-wrap gap-3 text-xs text-text-muted">
            <span>💰 <strong className="text-text">{formatCurrency(project.budget)}</strong></span>
            <span>📅 <strong className="text-text">{formatDate(project.deadline)}</strong></span>
            {project.buyer && <span>👤 <strong className="text-text">{project.buyer.name}</strong></span>}
            {project.solver && <span>🔧 <strong className="text-text">{project.solver.name}</strong></span>}
          </div>
          {project.tags?.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-2">
              {project.tags.map((t) => <Badge key={t} variant="brand">{t}</Badge>)}
            </div>
          )}
        </div>
        <Badge variant={statusVariant(project.status)}>{statusLabel(project.status)}</Badge>
      </div>
    </Card>
  );
}
