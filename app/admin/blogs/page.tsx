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

  const inputClass =
    "w-full rounded-xl border border-[#cbd5e1] bg-white px-4 py-3 text-sm font-medium text-[#111827] placeholder:text-[#64748b] outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10";

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

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        alert("Please login first.");
        return;
      }

      const fileExtension =
        file.name.split(".").pop()?.toLowerCase() || "jpg";

      const fileName = `${crypto.randomUUID()}.${fileExtension}`;

      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("thumbnails")
        .upload(filePath, file, {
          cacheControl: "31536000",
          upsert: false,
          contentType: file.type,
        });

      if (uploadError) {
        alert("IMAGE UPLOAD ERROR: " + uploadError.message);
        return;
      }

      /*
       * IMPORTANT:
       * We use a permanent public URL instead of a signed URL.
       * Signed URLs expire and can make old blog images disappear.
       */
      const { data: publicUrlData } = supabase.storage
        .from("thumbnails")
        .getPublicUrl(filePath);

      if (!publicUrlData?.publicUrl) {
        alert("IMAGE URL ERROR: Could not generate public image URL.");
        return;
      }

      setForm((previous) => ({
        ...previous,
        cover_image_url: publicUrlData.publicUrl,
      }));

      alert("Cover image uploaded successfully!");
    } catch (error) {
      console.error("IMAGE UPLOAD ERROR:", error);
      alert("Something went wrong while uploading the image.");
    } finally {
      setUploading(false);
    }
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
    <main className="min-h-screen bg-[#f7f9fc] px-6 py-8 md:px-10 md:py-10">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="mb-10">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-blue-600">
            Admin Panel
          </p>

          <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[#111827]">
            Blog Management
          </h1>

          <p className="mt-3 text-[15px] font-medium text-[#475569]">
            Create, edit, publish and manage your career blogs.
          </p>
        </div>

        {/* FORM */}
        <section className="rounded-3xl border border-[#dfe5ee] bg-white p-6 shadow-sm md:p-8">
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
            <div>
              <h2 className="text-2xl font-extrabold text-[#111827]">
                {editingId ? "Edit Blog" : "Create New Blog"}
              </h2>

              <p className="mt-1 text-sm font-medium text-[#64748b]">
                {editingId
                  ? "Update your existing blog."
                  : "Add a new blog to your platform."}
              </p>
            </div>

            {editingId && (
              <button
                onClick={resetForm}
                className="rounded-xl border border-[#cbd5e1] px-5 py-2.5 text-sm font-bold text-[#334155] transition hover:bg-[#f8fafc]"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="mt-7 grid gap-6">

            {/* TITLE */}
            <div>
              <label className="mb-2 block text-sm font-bold text-[#111827]">
                Blog Title
              </label>

              <input
                type="text"
                placeholder="Example: How to Build a Career in AI"
                value={form.title}
                onChange={(e) =>
                  handleTitleChange(e.target.value)
                }
                className={inputClass}
              />
            </div>

            {/* SLUG */}
            <div>
              <label className="mb-2 block text-sm font-bold text-[#111827]">
                Slug
              </label>

              <input
                type="text"
                value={form.slug}
                readOnly
                className="w-full rounded-xl border border-[#cbd5e1] bg-[#f8fafc] px-4 py-3 font-mono text-sm font-medium text-[#334155] outline-none"
              />

              <p className="mt-2 text-xs font-semibold text-[#475569]">
                Public URL: /blogs/{form.slug || "your-slug"}
              </p>

              <p className="mt-1 text-xs font-semibold text-green-600">
                Slug is automatically generated from the blog title.
              </p>
            </div>

            {/* CATEGORY */}
            <div>
              <label className="mb-2 block text-sm font-bold text-[#111827]">
                Category
              </label>

              <input
                type="text"
                placeholder="Career, AI, Technology, College..."
                value={form.category}
                onChange={(e) =>
                  updateForm("category", e.target.value)
                }
                className={inputClass}
              />
            </div>

            {/* COVER IMAGE */}
            <div>
              <label className="mb-2 block text-sm font-bold text-[#111827]">
                Cover Image
              </label>

              <div className="rounded-2xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] p-4">
                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadCoverImage}
                  disabled={uploading}
                  className="block w-full text-sm font-medium text-[#334155] file:mr-4 file:rounded-xl file:border-0 file:bg-blue-600 file:px-4 file:py-2.5 file:font-bold file:text-white file:transition hover:file:bg-blue-700 disabled:cursor-not-allowed"
                />

                <p className="mt-2 text-xs font-medium text-[#64748b]">
                  JPG, PNG, WEBP or other image formats. Maximum 5MB.
                </p>
              </div>

              {uploading && (
                <div className="mt-3 rounded-xl border border-blue-100 bg-blue-50 px-4 py-3">
                  <p className="text-sm font-bold text-blue-700">
                    Uploading image...
                  </p>
                </div>
              )}

              {form.cover_image_url && (
                <div className="mt-5 overflow-hidden rounded-2xl border border-[#dfe5ee] bg-[#f8fafc]">
                  <div className="border-b border-[#e5e7eb] px-4 py-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-[#64748b]">
                      Cover Preview
                    </p>
                  </div>

                  <img
                    src={form.cover_image_url}
                    alt="Cover preview"
                    className="h-64 w-full object-cover"
                  />

                  <div className="border-t border-[#e5e7eb] px-4 py-3">
                    <p className="break-all text-xs font-medium text-[#64748b]">
                      {form.cover_image_url}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* EXCERPT */}
            <div>
              <label className="mb-2 block text-sm font-bold text-[#111827]">
                Short Description
              </label>

              <textarea
                placeholder="Write a short description for the blog..."
                value={form.excerpt}
                onChange={(e) =>
                  updateForm("excerpt", e.target.value)
                }
                rows={4}
                className={`${inputClass} resize-y`}
              />
            </div>

            {/* CONTENT */}
            <div>
              <label className="mb-2 block text-sm font-bold text-[#111827]">
                Blog Content
              </label>

              <textarea
                placeholder="Write the complete blog content here..."
                value={form.content}
                onChange={(e) =>
                  updateForm("content", e.target.value)
                }
                rows={14}
                className={`${inputClass} resize-y leading-7`}
              />
            </div>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={editingId ? updateBlog : createBlog}
                disabled={saving || uploading}
                className="rounded-xl bg-[#111827] px-7 py-3 font-bold text-white shadow-sm transition hover:bg-blue-600 hover:shadow-md hover:shadow-blue-600/20 disabled:cursor-not-allowed disabled:bg-[#64748b]"
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
                  className="rounded-xl border border-[#cbd5e1] px-7 py-3 font-bold text-[#334155] transition hover:bg-[#f8fafc]"
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
            <h2 className="text-2xl font-extrabold text-[#111827]">
              Existing Blogs
            </h2>

            <p className="mt-1 text-sm font-medium text-[#64748b]">
              {blogs.length} blog
              {blogs.length !== 1 ? "s" : ""} found
            </p>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-[#dfe5ee] bg-white p-8 text-center">
              <p className="font-semibold text-[#334155]">
                Loading blogs...
              </p>
            </div>
          ) : blogs.length === 0 ? (
            <div className="rounded-2xl border border-[#dfe5ee] bg-white p-8 text-center">
              <p className="font-bold text-[#111827]">
                No blogs created yet.
              </p>

              <p className="mt-1 text-sm font-medium text-[#64748b]">
                Create your first blog using the form above.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <article
                  key={blog.id}
                  className="rounded-2xl border border-[#dfe5ee] bg-white p-5 shadow-sm transition hover:shadow-md"
                >
                  <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">

                    {/* IMAGE */}
                    {blog.cover_image_url ? (
                      <img
                        src={blog.cover_image_url}
                        alt={blog.title}
                        className="h-32 w-full rounded-xl border border-[#e5e7eb] object-cover md:w-48"
                      />
                    ) : (
                      <div className="flex h-32 w-full items-center justify-center rounded-xl border border-dashed border-[#cbd5e1] bg-[#f8fafc] md:w-48">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#94a3b8]">
                          No Image
                        </span>
                      </div>
                    )}

                    {/* INFO */}
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-xl font-extrabold text-[#111827]">
                          {blog.title}
                        </h3>

                        <span
                          className={`rounded-full px-3 py-1 text-xs font-bold ${
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

                      <p className="mt-1 text-sm font-semibold text-blue-600">
                        /blogs/{blog.slug}
                      </p>

                      {blog.category && (
                        <p className="mt-2 text-sm font-bold text-[#475569]">
                          Category: {blog.category}
                        </p>
                      )}

                      {blog.excerpt && (
                        <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-[#475569]">
                          {blog.excerpt}
                        </p>
                      )}
                    </div>

                    {/* ACTIONS */}
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => startEdit(blog)}
                        className="rounded-xl border border-[#cbd5e1] px-4 py-2 text-sm font-bold text-[#334155] transition hover:bg-[#f8fafc]"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => togglePublish(blog)}
                        className={`rounded-xl px-4 py-2 text-sm font-bold ${
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
                        className="rounded-xl bg-red-100 px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-200"
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