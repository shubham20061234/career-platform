
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type Blog = {
  id: number;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  cover_image_url: string | null;
  category: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
};

const emptyForm = {
  title: "",
  slug: "",
  excerpt: "",
  content: "",
  cover_image_url: "",
  category: "",
};

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  async function loadBlogs() {
    setLoading(true);

    const { data, error } = await supabase
      .from("blogs")
      .select(
        "id, title, slug, excerpt, content, cover_image_url, category, published, created_at, updated_at"
      )
      .order("created_at", { ascending: false });

    if (error) {
      alert("BLOG LOAD ERROR: " + error.message);
      setLoading(false);
      return;
    }

    setBlogs(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadBlogs();
  }, []);

  function makeSlug(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  }

  function updateForm(
    field: keyof typeof emptyForm,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  function handleTitleChange(value: string) {
    setForm((previous) => ({
      ...previous,
      title: value,
      slug: makeSlug(value),
    }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function startEdit(blog: Blog) {
    setEditingId(blog.id);

    setForm({
      title: blog.title || "",
      slug: blog.slug || "",
      excerpt: blog.excerpt || "",
      content: blog.content || "",
      cover_image_url: blog.cover_image_url || "",
      category: blog.category || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function uploadCoverImage(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be smaller than 5MB.");
      return;
    }

    setUploading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      setUploading(false);
      return;
    }

    const fileExtension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${crypto.randomUUID()}.${fileExtension}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("thumbnails")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      alert("IMAGE UPLOAD ERROR: " + uploadError.message);
      setUploading(false);
      return;
    }

    const { data: signedData, error: signedError } =
      await supabase.storage
        .from("thumbnails")
        .createSignedUrl(filePath, 60 * 60);

    if (signedError) {
      alert("IMAGE URL ERROR: " + signedError.message);
      setUploading(false);
      return;
    }

    setForm((previous) => ({
      ...previous,
      cover_image_url: signedData.signedUrl,
    }));

    setUploading(false);

    alert("Cover image uploaded successfully!");
  }

  async function createBlog() {
    if (!form.title.trim()) {
      alert("Blog title is required.");
      return;
    }

    const generatedSlug = makeSlug(form.title);

    if (!generatedSlug) {
      alert("Please enter a valid blog title.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      return;
    }

    setSaving(true);

    const { error } = await supabase.from("blogs").insert({
      title: form.title.trim(),
      slug: generatedSlug,
      excerpt: form.excerpt.trim() || null,
      content: form.content.trim() || null,
      cover_image_url: form.cover_image_url.trim() || null,
      category: form.category.trim() || null,
      author_id: user.id,
      published: false,
    });

    setSaving(false);

    if (error) {
      alert("CREATE ERROR: " + error.message);
      return;
    }

    resetForm();
    await loadBlogs();

    alert("Blog created successfully!");
  }

  async function updateBlog() {
    if (!editingId) return;

    if (!form.title.trim()) {
      alert("Blog title is required.");
      return;
    }

    const generatedSlug = makeSlug(form.title);

    if (!generatedSlug) {
      alert("Please enter a valid blog title.");
      return;
    }

    setSaving(true);

    const { error } = await supabase
      .from("blogs")
      .update({
        title: form.title.trim(),
        slug: generatedSlug,
        excerpt: form.excerpt.trim() || null,
        content: form.content.trim() || null,
        cover_image_url: form.cover_image_url.trim() || null,
        category: form.category.trim() || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingId);

    setSaving(false);

    if (error) {
      alert("UPDATE ERROR: " + error.message);
      return;
    }

    resetForm();
    await loadBlogs();

    alert("Blog updated successfully!");
  }

  async function deleteBlog(blog: Blog) {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${blog.title}"?`
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("blogs")
      .delete()
      .eq("id", blog.id);

    if (error) {
      alert("DELETE ERROR: " + error.message);
      return;
    }

    if (editingId === blog.id) {
      resetForm();
    }

    await loadBlogs();

    alert("Blog deleted successfully!");
  }

  async function togglePublish(blog: Blog) {
    const { error } = await supabase
      .from("blogs")
      .update({
        published: !blog.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", blog.id);

    if (error) {
      alert("PUBLISH ERROR: " + error.message);
      return;
    }

    await loadBlogs();
  }

  return (
    <main className="min-h-screen bg-[#f8f8f6] p-6 md:p-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Admin Panel
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Blog Management
          </h1>

          <p className="mt-3 text-black/60">
            Create, edit, publish and manage your career blogs.
          </p>
        </div>

        {/* FORM */}
        <section className="rounded-3xl border bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-bold">
                {editingId ? "Edit Blog" : "Create New Blog"}
              </h2>

              <p className="mt-1 text-sm text-black/50">
                {editingId
                  ? "Update your existing blog."
                  : "Add a new blog to your platform."}
              </p>
            </div>

            {editingId && (
              <button
                onClick={resetForm}
                className="rounded-xl border px-5 py-2.5 text-sm font-semibold hover:bg-gray-50"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="mt-7 grid gap-5">

            {/* TITLE */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Blog Title
              </label>

              <input
                type="text"
                placeholder="Example: How to Build a Career in AI"
                value={form.title}
                onChange={(e) =>
                  handleTitleChange(e.target.value)
                }
                className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* AUTO SLUG */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Slug
              </label>

              <input
                type="text"
                value={form.slug}
                readOnly
                className="w-full rounded-xl border bg-gray-50 p-3 text-black/60 outline-none"
              />

              <p className="mt-1 text-xs text-black/40">
                Public URL: /blogs/{form.slug || "your-slug"}
              </p>

              <p className="mt-1 text-xs text-green-600">
                Slug is automatically generated from the blog title.
              </p>
            </div>

            {/* CATEGORY */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Category
              </label>

              <input
                type="text"
                placeholder="Career, AI, Technology, College..."
                value={form.category}
                onChange={(e) =>
                  updateForm("category", e.target.value)
                }
                className="w-full rounded-xl border p-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* COVER IMAGE */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Cover Image
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={uploadCoverImage}
                disabled={uploading}
                className="block w-full rounded-xl border p-3 text-sm"
              />

              {uploading && (
                <p className="mt-2 text-sm text-blue-600">
                  Uploading image...
                </p>
              )}

              {form.cover_image_url && (
                <div className="mt-4 overflow-hidden rounded-2xl border">
                  <img
                    src={form.cover_image_url}
                    alt="Cover preview"
                    className="h-56 w-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* EXCERPT */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Short Description
              </label>

              <textarea
                placeholder="Write a short description for the blog..."
                value={form.excerpt}
                onChange={(e) =>
                  updateForm("excerpt", e.target.value)
                }
                rows={4}
                className="w-full resize-y rounded-xl border p-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* CONTENT */}
            <div>
              <label className="mb-2 block text-sm font-semibold">
                Blog Content
              </label>

              <textarea
                placeholder="Write the complete blog content here..."
                value={form.content}
                onChange={(e) =>
                  updateForm("content", e.target.value)
                }
                rows={14}
                className="w-full resize-y rounded-xl border p-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={editingId ? updateBlog : createBlog}
                disabled={saving || uploading}
                className="rounded-xl bg-black px-7 py-3 font-semibold text-white transition hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Blog"
                  : "Create Blog"}
              </button>

              {editingId && (
                <button
                  onClick={resetForm}
                  disabled={saving}
                  className="rounded-xl border px-7 py-3 font-semibold hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>
        </section>

        {/* BLOG LIST */}
        <section className="mt-10">
          <div className="mb-5">
            <h2 className="text-2xl font-bold">
              Existing Blogs
            </h2>

            <p className="mt-1 text-sm text-black/50">
              {blogs.length} blog
              {blogs.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border bg-white p-8 text-center">
              Loading blogs...
            </div>
          ) : blogs.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-center">
              <p className="font-semibold">
                No blogs created yet.
              </p>

              <p className="mt-1 text-sm text-black/50">
                Create your first blog using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="rounded-2xl border bg-white p-5 shadow-sm"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    {/* IMAGE */}
                    {blog.cover_image_url && (
                      <img
                        src={blog.cover_image_url}
                        alt={blog.title}
                        className="h-28 w-full rounded-xl object-cover md:w-44"
                      />
                    )}

                    {/* INFO */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-bold">
                          {blog.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-semibold ${
                            blog.published
                              ? "bg-green-100 text-green-700"
                              : "bg-yellow-100 text-yellow-700"
                          }`}
                        >
                          {blog.published
                            ? "Published"
                            : "Draft"}
                        </span>
                      </div>

                      <p className="mt-1 text-sm text-blue-600">
                        /blogs/{blog.slug}
                      </p>

                      {blog.category && (
                        <p className="mt-2 text-sm font-medium text-black/60">
                          Category: {blog.category}
                        </p>
                      )}

                      {blog.excerpt && (
                        <p className="mt-3 max-w-3xl text-sm leading-6 text-black/60">
                          {blog.excerpt}
                        </p>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => startEdit(blog)}
                        className="rounded-xl border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => togglePublish(blog)}
                        className={`rounded-xl px-4 py-2 text-sm font-semibold ${
                          blog.published
                            ? "bg-yellow-100 text-yellow-800 hover:bg-yellow-200"
                            : "bg-green-100 text-green-800 hover:bg-green-200"
                        }`}
                      >
                        {blog.published
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        onClick={() => deleteBlog(blog)}
                        className="rounded-xl bg-red-100 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-200"
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
      </div>
    </main>
  );
}