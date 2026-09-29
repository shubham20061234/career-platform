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
      slug:
        form.slug.trim() ||
        createSlug(form.title),
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
        data: {
          user,
        },
      } = await supabase.auth.getUser();

      const { error } = await supabase
        .from("resources")
        .insert({
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

    if (!confirmed) {
      return;
    }

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

  async function togglePublished(
    resource: Resource
  ) {
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
    <main className="min-h-screen bg-[#f8f8f6] px-6 py-12">
      <div className="mx-auto max-w-7xl">

        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Admin
          </p>

          <h1 className="mt-2 text-4xl font-bold tracking-tight">
            Resources
          </h1>

          <p className="mt-3 text-black/55">
            Add and manage career resources using Google Drive PDF links.
          </p>
        </div>

        {message && (
          <div className="mb-6 rounded-xl border border-black/10 bg-white px-5 py-4 text-sm">
            {message}
          </div>
        )}

        <section className="mb-12 rounded-3xl border border-black/10 bg-white p-6 shadow-sm md:p-8">

          <div className="mb-6 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                {editingId
                  ? "Edit Resource"
                  : "Add New Resource"}
              </h2>

              <p className="mt-1 text-sm text-black/50">
                Add the PDF using a Google Drive sharing link.
              </p>
            </div>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold transition hover:bg-black hover:text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid gap-5 md:grid-cols-2">

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Resource Title
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  updateField("title", e.target.value)
                }
                placeholder="e.g. Resume Building Guide"
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Slug
              </label>

              <input
                type="text"
                value={form.slug}
                onChange={(e) =>
                  updateField("slug", e.target.value)
                }
                placeholder="resume-building-guide"
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Category
              </label>

              <input
                type="text"
                value={form.category}
                onChange={(e) =>
                  updateField("category", e.target.value)
                }
                placeholder="Career / Resume / Interview"
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  updateField(
                    "description",
                    e.target.value
                  )
                }
                placeholder="Short description of this resource..."
                rows={4}
                className="w-full resize-none rounded-xl border border-black/10 px-4 py-3 outline-none transition focus:border-blue-500"
              />
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Google Drive PDF Link
              </label>

              <input
                type="url"
                value={form.file_url}
                onChange={(e) =>
                  updateField(
                    "file_url",
                    e.target.value
                  )
                }
                placeholder="https://drive.google.com/file/d/..."
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none transition focus:border-blue-500"
              />

              <p className="mt-2 text-xs leading-5 text-black/45">
                Google Drive → Share → General access →
                Anyone with the link → Viewer
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="mb-2 block text-sm font-semibold">
                Thumbnail URL
              </label>

              <input
                type="url"
                value={form.thumbnail_url}
                onChange={(e) =>
                  updateField(
                    "thumbnail_url",
                    e.target.value
                  )
                }
                placeholder="https://..."
                className="w-full rounded-xl border border-black/10 px-4 py-3 outline-none transition focus:border-blue-500"
              />

              <p className="mt-2 text-xs text-black/45">
                Optional. Paste an image URL for the resource thumbnail.
              </p>
            </div>

            <div className="md:col-span-2">
              <label className="flex cursor-pointer items-center gap-3">
                <input
                  type="checkbox"
                  checked={form.published}
                  onChange={(e) =>
                    updateField(
                      "published",
                      e.target.checked
                    )
                  }
                  className="h-5 w-5"
                />

                <span className="text-sm font-semibold">
                  Publish this resource
                </span>
              </label>
            </div>

          </div>

          <div className="mt-7 flex flex-wrap gap-3">

            <button
              type="button"
              onClick={saveResource}
              disabled={saving}
              className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Resource"
                : "Create Resource"}
            </button>

            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-xl border border-black/10 px-6 py-3 text-sm font-semibold transition hover:bg-black hover:text-white"
              >
                Clear
              </button>
            )}

          </div>
        </section>

        <section>
          <div className="mb-6">
            <h2 className="text-2xl font-bold">
              Existing Resources
            </h2>

            <p className="mt-1 text-sm text-black/50">
              Manage your published and unpublished resources.
            </p>
          </div>

          {loading ? (
            <div className="rounded-3xl border border-black/10 bg-white p-8">
              <p className="text-black/50">
                Loading resources...
              </p>
            </div>
          ) : resources.length === 0 ? (
            <div className="rounded-3xl border border-black/10 bg-white p-8">
              <p className="text-black/50">
                No resources found.
              </p>
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {resources.map((resource) => (
                <article
                  key={resource.id}
                  className="rounded-3xl border border-black/10 bg-white p-6 shadow-sm"
                >
                  {resource.thumbnail_url && (
                    <img
                      src={resource.thumbnail_url}
                      alt={resource.title}
                      className="mb-5 aspect-video w-full rounded-2xl object-cover"
                    />
                  )}

                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-xl font-bold">
                      {resource.title}
                    </h3>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        resource.published
                          ? "bg-green-100 text-green-700"
                          : "bg-black/5 text-black/50"
                      }`}
                    >
                      {resource.published
                        ? "Published"
                        : "Draft"}
                    </span>
                  </div>

                  {resource.category && (
                    <p className="mt-2 text-xs font-semibold uppercase tracking-wider text-blue-600">
                      {resource.category}
                    </p>
                  )}

                  {resource.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/55">
                      {resource.description}
                    </p>
                  )}

                  <div className="mt-6 flex flex-wrap gap-2">

                    {resource.file_url && (
                      <a
                        href={resource.file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg bg-black px-4 py-2 text-xs font-semibold text-white transition hover:bg-blue-600"
                      >
                        Open PDF
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() =>
                        editResource(resource)
                      }
                      className="rounded-lg border border-black/10 px-4 py-2 text-xs font-semibold transition hover:bg-black hover:text-white"
                    >
                      Edit
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        togglePublished(resource)
                      }
                      className="rounded-lg border border-black/10 px-4 py-2 text-xs font-semibold transition hover:bg-black hover:text-white"
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
                      className="rounded-lg border border-red-200 px-4 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                    >
                      Delete
                    </button>

                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

      </div>
    </main>
  );
}