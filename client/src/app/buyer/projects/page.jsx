"use client";
import Link from "next/link";
import { useProjects } from "@/hooks";
import { PageHeader } from "@/components/ui/PageHeader";
import { Button } from "@/components/ui/Button";
import { Spinner } from "@/components/ui/Spinner";
import { Empty } from "@/components/ui/Empty";
import { ProjectCard } from "@/components/projects/ProjectCard";

export default function BuyerProjectsPage() {
  const { data, isLoading } = useProjects();
  const projects = data?.data?.projects || [];

  return (
    <div>
      <PageHeader
        title="My Projects"
        subtitle={`${projects.length} project${projects.length !== 1 ? "s" : ""} posted`}
        action={
          <Link href="/buyer/projects/new">
            <Button>+ New Project</Button>
          </Link>
        }
      />

      {isLoading ? (
        <Spinner />
      ) : projects.length === 0 ? (
        <Empty message="No projects yet. Create your first one!" />
      ) : (
        projects.map((p) => <ProjectCard key={p._id} project={p} role="BUYER" />)
      )}
    </div>
  );
}
