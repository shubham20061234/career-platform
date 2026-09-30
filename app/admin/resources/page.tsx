"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type Resource = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
  published: boolean;
};

type FormState = {
  title: string;
  slug: string;
  description: string;
  category: string;
  file_url: string;
  thumbnail_url: string;
  published: boolean;
};

const emptyForm: FormState = {
  title: "",
  slug: "",
  description: "",
  category: "",
  file_url: "",
  thumbnail_url: "",
  published: false,
};

const inputClass =
  "w-full rounded-xl border border-black/10 bg-[#f7f7f4] px-4 py-3.5 text-sm font-medium text-[#111] outline-none transition-all duration-300 placeholder:text-black/25 focus:border-[#163A5F] focus:bg-white focus:ring-4 focus:ring-[#163A5F]/10";

const textareaClass =
  "w-full resize-none rounded-xl border border-black/10 bg-[#f7f7f4] px-4 py-3.5 text-sm font-medium leading-6 text-[#111] outline-none transition-all duration-300 placeholder:text-black/25 focus:border-[#163A5F] focus:bg-white focus:ring-4 focus:ring-[#163A5F]/10";

export default function AdminResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadResources() {
    setLoading(true);

    const { data, error } = await supabase
      .from("resources")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error(error);
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setResources(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadResources();
  }, []);

  function createSlug(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function updateField(
    field: keyof FormState,
    value: string | boolean
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
    setMessage("");
  }

  async function saveResource() {
    setMessage("");

    if (!form.title.trim()) {
      setMessage("Please enter a resource title.");
      return;
    }

    if (!form.file_url.trim()) {
      setMessage("Please enter a Google Drive PDF link.");
      return;
    }

    if (!form.file_url.startsWith("https://")) {
      setMessage("Please enter a valid Google Drive URL.");
      return;
    }

    setSaving(true);

    const resourceData = {
      title: form.title.trim(),
      slug: form.slug.trim() || createSlug(form.title),
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      file_url: form.file_url.trim(),
      thumbnail_url: form.thumbnail_url.trim() || null,
      published: form.published,
    };

    if (editingId) {
      const { error } = await supabase
        .from("resources")
        .update(resourceData)
        .eq("id", editingId);

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Resource updated successfully.");
    } else {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      const { error } = await supabase.from("resources").insert({
        ...resourceData,
        author_id: user?.id || null,
      });

      if (error) {
        setMessage(error.message);
        setSaving(false);
        return;
      }

      setMessage("Resource created successfully.");
    }

    resetForm();
    await loadResources();
    setSaving(false);
  }

  function editResource(resource: Resource) {
    setEditingId(resource.id);

    setForm({
      title: resource.title || "",
      slug: resource.slug || "",
      description: resource.description || "",
      category: resource.category || "",
      file_url: resource.file_url || "",
      thumbnail_url: resource.thumbnail_url || "",
      published: resource.published,
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteResource(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this resource?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("resources")
      .delete()
      .eq("id", id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage("Resource deleted successfully.");
    await loadResources();
  }

  async function togglePublished(resource: Resource) {
    const { error } = await supabase
      .from("resources")
      .update({
        published: !resource.published,
      })
      .eq("id", resource.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    await loadResources();
  }

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f5f2] text-[#111]">
      {/* BACKGROUND GRID */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />

      {/* NAVY GLOW */}
      <div className="pointer-events-none fixed left-1/2 top-[8%] h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[130px]" />

      <div className="relative mx-auto max-w-6xl px-5 py-14 md:px-8">
        {/* TOP LABEL */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-[#163A5F]" />

          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#163A5F]">
            Career Platform
          </span>

          <span className="h-px w-10 bg-[#163A5F]" />
        </div>

        {/* HEADER */}
        <div className="mb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#163A5F]">
            Admin Panel
          </p>

          <h1 className="text-4xl font-semibold tracking-[-0.05em] md:text-6xl">
            Resources
            <span className="text-black/20">.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-black/45 md:text-base">
            Add and manage career resources using Google Drive PDF links.
          </p>
        </div>

        {/* MESSAGE */}
        {message && (
          <div className="mb-6 rounded-2xl border border-black/10 bg-white/90 px-5 py-4 text-sm font-semibold text-black/65 shadow-[0_15px_50px_rgba(0,0,0,0.05)] backdrop-blur-xl">
            {message}
          </div>
        )}

        {/* CREATE / EDIT FORM */}
        <section className="mb-12 rounded-[2rem] border border-black/10 bg-white/90 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.08)] backdrop-blur-xl md:p-9">
          {/* FORM HEADER */}
          <div className="mb-8 flex flex-col justify-between gap-5 border-b border-black/10 pb-7 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#163A5F]">
                Resource Editor
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {editingId ? "Edit Resource" : "Create Resource"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-black/45">
                Add a career resource using a Google Drive sharing link.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-black/10 bg-[#f7f7f4] px-5 py-3 text-sm font-bold text-black transition-all duration-300 hover:border-[#163A5F] hover:bg-[#163A5F] hover:text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* TITLE */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-black/60">
                Resource Title
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  updateField("title", e.target.value)
                }
                placeholder="e.g. Resume Building Guide"
                className={inputClass}
              />
            </div>

            {/* SLUG */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-black/60">
                Slug
              </label>

              <input
                type="text"
                value={form.slug}
                onChange={(e) =>
                  updateField("slug", e.target.value)
                }
                placeholder="resume-building-guide"
                spellCheck={false}
                className={`${inputClass} font-mono`}
              />

              <p className="mt-2 text-xs leading-5 text-black/40">
                URL-friendly identifier for this resource.
              </p>
            </div>

            {/* CATEGORY */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-black/60">
                Category
              </label>

              <input
                type="text"
                value={form.category}
                onChange={(e) =>
                  updateField("category", e.target.value)
                }
                placeholder="Career / Resume / Interview"
                className={inputClass}
              />
            </div>

            {/* DESCRIPTION */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-black/60">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  updateField("description", e.target.value)
                }
                placeholder="Short description of this resource..."
                rows={4}
                className={textareaClass}
              />
            </div>

            {/* GOOGLE DRIVE URL */}
            <div className="md:col-span-2 rounded-[1.5rem] border border-black/10 bg-[#f7f7f4] p-5 md:p-6">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#163A5F]">
                  Resource File
                </p>

                <p className="mt-2 text-sm leading-6 text-black/45">
                  Paste the Google Drive PDF link for this resource.
                </p>
              </div>

              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-black/60">
                Google Drive PDF Link
              </label>

              <input
                type="url"
                value={form.file_url}
                onChange={(e) =>
                  updateField("file_url", e.target.value)
                }
                placeholder="https://drive.google.com/file/d/..."
                spellCheck={false}
                autoComplete="off"
                className={`${inputClass} bg-white font-mono text-[13px]`}
              />

              <p className="mt-3 text-xs font-medium leading-5 text-black/45">
                Google Drive → Share → General access → Anyone with
                the link → Viewer
              </p>
            </div>

            {/* THUMBNAIL URL */}
            <div className="md:col-span-2">
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-black/60">
                Thumbnail URL
              </label>

              <input
                type="url"
                value={form.thumbnail_url}
                onChange={(e) =>
                  updateField("thumbnail_url", e.target.value)
                }
                placeholder="https://..."
                spellCheck={false}
                autoComplete="off"
                className={`${inputClass} font-mono text-[13px]`}
              />

              <p className="mt-2 text-xs leading-5 text-black/40">
                Optional. Paste an image URL for the resource thumbnail.
              </p>
            </div>

            {/* PUBLISH */}
            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-black/10 bg-[#f7f7f4] p-4 transition-all duration-300 hover:border-[#163A5F]/30 hover:bg-[#163A5F]/5">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    updateField("published", e.target.checked)
                  }
                  className="h-4 w-4 accent-[#163A5F]"
                />

                <span className="text-sm font-bold text-black">
                  Publish this resource
                </span>
              </label>
            </div>
          </div>

          {/* BUTTONS */}
          <div className="mt-7 flex flex-wrap gap-3 border-t border-black/10 pt-6">
            <button
              type="button"
              onClick={saveResource}
              disabled={saving}
              className="group flex items-center gap-3 rounded-xl bg-[#163A5F] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(22,58,95,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0B2742] hover:shadow-[0_18px_40px_rgba(22,58,95,0.28)] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Resource"
                : "Create Resource"}

              {!saving && (
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-white/10 transition-all duration-300 group-hover:translate-x-1 group-hover:bg-white/20">
                  →
                </span>
              )}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-black/10 bg-[#f7f7f4] px-6 py-3.5 text-sm font-bold text-black transition-all duration-300 hover:border-[#163A5F] hover:bg-[#163A5F] hover:text-white"
              >
                Clear
              </button>
            )}
          </div>
        </section>

        {/* EXISTING RESOURCES */}
        <section>
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#163A5F]">
                Library
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                Existing Resources
              </h2>

              <p className="mt-2 text-sm leading-6 text-black/45">
                Manage your published and unpublished resources.
              </p>
            </div>

            <span className="rounded-full bg-[#163A5F] px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-[#163A5F]/15">
              {resources.length}
            </span>
          </div>

          {loading ? (
            <div className="rounded-[1.5rem] border border-black/10 bg-white/90 p-8 text-sm text-black/45 shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl">
              Loading resources...
            </div>
          ) : resources.length === 0 ? (
            <div className="rounded-[1.5rem] border border-black/10 bg-white/90 p-8 text-sm text-black/45 shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl">
              No resources found.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <article
                  key={resource.id}
                  className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-white/90 shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(0,0,0,0.09)]"
                >
                  {/* THUMBNAIL */}
                  {resource.thumbnail_url ? (
                    <img
                      src={resource.thumbnail_url}
                      alt={resource.title}
                      className="aspect-video w-full object-cover"
                    />
                  ) : (
                    <div className="flex aspect-video items-center justify-center bg-[#163A5F] text-5xl text-white">
                      📄
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold tracking-tight">
                          {resource.title}
                        </h3>

                        {resource.category && (
                          <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#163A5F]">
                            {resource.category}
                          </p>
                        )}

                        <p className="mt-2 break-all font-mono text-xs text-black/30">
                          /{resource.slug}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                          resource.published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {resource.published ? "Published" : "Draft"}
                      </span>
                    </div>

                    {resource.description && (
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-black/45">
                        {resource.description}
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap gap-2">
                      {resource.file_url && (
                        <a
                          href={resource.file_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="group flex items-center gap-2 rounded-lg bg-[#163A5F] px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:bg-[#0B2742]"
                        >
                          Open PDF

                          <span className="transition-transform duration-300 group-hover:translate-x-0.5">
                            →
                          </span>
                        </a>
                      )}

                      <button
                        type="button"
                        onClick={() => editResource(resource)}
                        className="rounded-lg border border-black/10 bg-[#f7f7f4] px-4 py-2 text-xs font-bold text-black transition-all duration-300 hover:border-[#163A5F] hover:bg-[#163A5F] hover:text-white"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          togglePublished(resource)
                        }
                        className="rounded-lg border border-black/10 bg-[#f7f7f4] px-4 py-2 text-xs font-bold text-black transition-all duration-300 hover:border-[#163A5F] hover:bg-[#163A5F] hover:text-white"
                      >
                        {resource.published
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          deleteResource(resource.id)
                        }
                        className="rounded-lg border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-600 transition-all duration-300 hover:bg-red-600 hover:text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* FOOTER */}
        <div className="mt-12 flex items-center justify-between border-t border-black/10 pt-6 text-[9px] font-bold uppercase tracking-[0.18em] text-black/25">
          <span>Knowledge • Experience • Growth</span>
          <span>© Career Platform</span>
        </div>
      </div>
    </main>
  );
}