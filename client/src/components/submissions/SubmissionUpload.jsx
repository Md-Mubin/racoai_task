"use client";
import { useState, useRef } from "react";
import { Button } from "@/components/ui/Button";

export function SubmissionUpload({ onSubmit, loading }) {
  const [file, setFile] = useState(null);
  const [notes, setNotes] = useState("");
  const [progress, setProgress] = useState(0);
  const ref = useRef();

  const submit = (e) => {
    e.preventDefault();
    if (!file) return;
    const fd = new FormData();
    fd.append("file", file);
    fd.append("notes", notes);
    onSubmit({
      formData: fd,
      onUploadProgress: (e) => setProgress(Math.round((e.loaded * 100) / e.total)),
    });
  };

  return (
    <form onSubmit={submit} className="flex flex-col gap-4">
      <div
        onClick={() => ref.current.click()}
        className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-brand transition-colors"
      >
        {file ? (
          <p className="text-sm font-semibold text-brand">📦 {file.name}</p>
        ) : (
          <div>
            <p className="text-sm font-semibold text-text-muted">Click to select ZIP file</p>
            <p className="text-xs text-text-light mt-1">Max 50MB</p>
          </div>
        )}
        <input ref={ref} type="file" accept=".zip" hidden onChange={(e) => setFile(e.target.files[0])} />
      </div>

      <textarea
        placeholder="Notes (optional)"
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        rows={2}
        className="w-full px-3 py-2 rounded-sm border border-border text-sm text-text bg-surface resize-none focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand-light"
      />

      {progress > 0 && progress < 100 && (
        <div className="bg-border rounded-full overflow-hidden h-1.5">
          <div className="h-full bg-brand transition-all duration-200" style={{ width: `${progress}%` }} />
        </div>
      )}

      <Button type="submit" disabled={!file || loading}>
        {loading ? `Uploading ${progress}%...` : "Submit Work"}
      </Button>
    </form>
  );
}
