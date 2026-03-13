"use client";
import { useParams, useRouter } from "next/navigation";
import { useProject, useUpdateProject } from "@/hooks";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { ProjectForm } from "@/components/projects/ProjectForm";

export default function EditProjectPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data, isLoading } = useProject(id);
  const { mutateAsync, isPending } = useUpdateProject(id);

  const project = data?.data?.project;

  if (isLoading) return <Spinner />;

  const handleSubmit = async (formData) => {
    await mutateAsync(formData);
    router.push(`/buyer/projects/${id}`);
  };

  return (
    <div className="max-w-2xl">
      <PageHeader title="Edit Project" subtitle="Update your project details" />
      <Card>
        <ProjectForm onSubmit={handleSubmit} loading={isPending} initial={project} />
      </Card>
    </div>
  );
}
