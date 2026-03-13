"use client";
import { useState } from "react";
import { useAuthStore } from "@/stores";
import { userService } from "@/services";
import { PageHeader } from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { toast } from "sonner";

export default function SolverProfilePage() {
  const { user, setUser } = useAuthStore();

  const [form, setForm] = useState({
    name:     user?.name     || "",
    bio:      user?.bio      || "",
    skills:   user?.skills?.join(", ") || "",
    github:   user?.links?.github   || "",
    linkedin: user?.links?.linkedin || "",
    website:  user?.links?.website  || "",
  });
  const [avatarFile, setAvatarFile] = useState(null);
  const [loading, setLoading]       = useState(false);

  const handle = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append("name",  form.name);
      fd.append("bio",   form.bio);
      fd.append("skills", JSON.stringify(
        form.skills.split(",").map((s) => s.trim()).filter(Boolean)
      ));
      fd.append("links", JSON.stringify({
        github:   form.github,
        linkedin: form.linkedin,
        website:  form.website,
      }));
      if (avatarFile) fd.append("avatar", avatarFile);

      const res = await userService.updateProfile(fd);
      setUser(res.data.data.user);
      toast.success("Profile updated!");
    } catch (err) {
      toast.error(err.response?.data?.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  const skillList = form.skills.split(",").map((s) => s.trim()).filter(Boolean);

  return (
    <div className="max-w-2xl">
      <PageHeader title="My Profile" subtitle="Update your public profile" />

      <form onSubmit={submit} className="flex flex-col gap-5">

        {/* Avatar */}
        <Card>
          <p className="text-sm font-bold text-text mb-3">Profile Photo</p>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-brand-light flex items-center justify-center text-brand font-extrabold text-2xl shrink-0 overflow-hidden">
              {user?.avatar ? (
                <img src={user.avatar} alt="avatar" className="w-full h-full object-cover" />
              ) : (
                user?.name?.charAt(0).toUpperCase()
              )}
            </div>
            <div>
              <input
                type="file"
                accept="image/*"
                id="avatar-input"
                hidden
                onChange={(e) => setAvatarFile(e.target.files[0])}
              />
              <label
                htmlFor="avatar-input"
                className="cursor-pointer text-sm font-semibold text-brand border border-brand rounded-sm px-3 py-1.5 hover:bg-brand-light transition-colors"
              >
                {avatarFile ? avatarFile.name : "Change photo"}
              </label>
            </div>
          </div>
        </Card>

        {/* Basic info */}
        <Card>
          <p className="text-sm font-bold text-text mb-3">Basic Info</p>
          <div className="flex flex-col gap-4">
            <Input label="Full Name" name="name" value={form.name} onChange={handle} required />
            <Textarea
              label="Bio"
              name="bio"
              value={form.bio}
              onChange={handle}
              placeholder="Tell buyers about yourself, your experience and what you specialise in..."
              rows={4}
            />
          </div>
        </Card>

        {/* Skills */}
        <Card>
          <p className="text-sm font-bold text-text mb-1">Skills</p>
          <p className="text-xs text-text-muted mb-3">Comma separated</p>
          <Input
            name="skills"
            value={form.skills}
            onChange={handle}
            placeholder="React, Node.js, Python, AWS..."
          />
          {skillList.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mt-3">
              {skillList.map((s) => (
                <Badge key={s} variant="brand">{s}</Badge>
              ))}
            </div>
          )}
        </Card>

        {/* Links */}
        <Card>
          <p className="text-sm font-bold text-text mb-3">Links</p>
          <div className="flex flex-col gap-3">
            <Input label="GitHub"   name="github"   value={form.github}   onChange={handle} placeholder="https://github.com/username" />
            <Input label="LinkedIn" name="linkedin" value={form.linkedin} onChange={handle} placeholder="https://linkedin.com/in/username" />
            <Input label="Website"  name="website"  value={form.website}  onChange={handle} placeholder="https://yoursite.com" />
          </div>
        </Card>

        <Button type="submit" disabled={loading} size="lg">
          {loading ? "Saving..." : "Save Profile"}
        </Button>
      </form>
    </div>
  );
}
