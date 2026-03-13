"use client";
import { useState } from "react";
import { useProjects } from "@/hooks";
import { PageHeader } from "@/components/ui/PageHeader";
import { Input } from "@/components/ui/Input";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { ProjectCard } from "@/components/projects/ProjectCard";

export default function SolverBrowsePage() {
  const [search, setSearch] = useState("");
  const { data, isLoading } = useProjects({ status: "OPEN", search: search || undefined });
  const projects = data?.data?.projects || [];

  return (
    <div>
      <PageHeader
        title="Open Projects"
        subtitle="Browse and apply to projects that match your skills"
      />

      <div className="mb-5 max-w-sm">
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : projects.length === 0 ? (
        <Empty message="No open projects right now. Check back soon!" />
      ) : (
        projects.map((p) => <ProjectCard key={p._id} project={p} role="PROBLEM_SOLVER" />)
      )}
    </div>
  );
}
