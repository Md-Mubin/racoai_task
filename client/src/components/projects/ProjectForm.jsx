"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";

export function ProjectForm({ onSubmit, loading, initial = {} }) {
  const [form, setForm] = useState({
    title:       initial.title       || "",
    description: initial.description || "",
    budget:      initial.budget      || "",
    deadline:    initial.deadline    ? initial.deadline.slice(0, 10) : "",
    tags:        initial.tags?.join(", ") || "",
  });

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit({
      ...form,
      budget: Number(form.budget),
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-5">
      <Input label="Project Title" name="title" value={form.title} onChange={handle} placeholder="e.g. E-Commerce Platform" required />
      <Textarea label="Description" name="description" value={form.description} onChange={handle}
        placeholder="Describe the project in detail..." rows={5} required />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Budget ($)" name="budget" type="number" value={form.budget} onChange={handle} placeholder="2500" required />
        <Input label="Deadline" name="deadline" type="date" value={form.deadline} onChange={handle} required />
      </div>
      <Input label="Tags (comma separated)" name="tags" value={form.tags} onChange={handle} placeholder="React, Node.js, MongoDB" />
      <Button type="submit" disabled={loading} size="lg">
        {loading ? "Saving..." : "Save Project"}
      </Button>
    </form>
  );
}
