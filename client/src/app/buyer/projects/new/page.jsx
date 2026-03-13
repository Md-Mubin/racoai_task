"use client";
import { useCreateProject } from "@/hooks";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { ProjectForm } from "@/components/projects/ProjectForm";

export default function NewProjectPage() {
  const { mutateAsync, isPending } = useCreateProject();

  return (
    <div className="max-w-2xl">
      <PageHeader
        title="New Project"
        subtitle="Post a project and get solver applications"
      />
      <Card>
        <ProjectForm onSubmit={(data) => mutateAsync(data)} loading={isPending} />
      </Card>
    </div>
  );
}
