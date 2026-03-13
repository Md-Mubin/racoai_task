"use client";
import { useState } from "react";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Select } from "@/components/ui/Select";
import { Button } from "@/components/ui/Button";
import { PRIORITY } from "@/constants";

export function TaskForm({ onSubmit, loading }) {
  const [form, setForm] = useState({ title: "", description: "", deadline: "", priority: "MEDIUM" });
  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = (e) => {
    e.preventDefault();
    onSubmit(form);
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <Input label="Title" name="title" value={form.title} onChange={handle} required />
      <Textarea label="Description" name="description" value={form.description} onChange={handle} required rows={3} />
      <div className="grid grid-cols-2 gap-4">
        <Input label="Deadline" name="deadline" type="date" value={form.deadline} onChange={handle} required />
        <Select label="Priority" name="priority" value={form.priority} onChange={handle}
          options={PRIORITY.map((p) => ({ value: p, label: p }))} />
      </div>
      <Button type="submit" disabled={loading} className="mt-1">
        {loading ? "Creating..." : "Create Task"}
      </Button>
    </form>
  );
}
