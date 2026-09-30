"use client";

import { useEffect, useState } from "react";

import { supabase } from "@/src/lib/supabase";

type Video = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
  published: boolean;
  created_at: string;
};

export default function VideosAdminPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    category: "",
    video_url: "",
    thumbnail_url: "",
  });

  async function loadVideos() {
    setLoading(true);

    const { data, error } = await supabase
      .from("videos")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      alert("LOAD ERROR: " + error.message);
    } else {
      setVideos(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadVideos();
  }, []);

  function resetForm() {
    setForm({
      title: "",
      slug: "",
      description: "",
      category: "",
      video_url: "",
      thumbnail_url: "",
    });

    setEditingId(null);
  }

  async function uploadVideo(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("video/")) {
      alert("Please select a video file.");
      return;
    }

    if (file.size > 200 * 1024 * 1024) {
      alert("Video must be smaller than 200MB.");
      return;
    }

    setUploadingVideo(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      setUploadingVideo(false);
      return;
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "mp4";

    const fileName = `${crypto.randomUUID()}.${extension}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("videos")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (uploadError) {
      alert("VIDEO UPLOAD ERROR: " + uploadError.message);
      setUploadingVideo(false);
      return;
    }

    const { data: signedData, error: signedError } =
      await supabase.storage
        .from("videos")
        .createSignedUrl(filePath, 60 * 60);

    if (signedError) {
      alert("VIDEO URL ERROR: " + signedError.message);
      setUploadingVideo(false);
      return;
    }

    setForm((previous) => ({
      ...previous,
      video_url: signedData.signedUrl,
    }));

    setUploadingVideo(false);

    alert("Video uploaded successfully!");
  }

  async function uploadThumbnail(
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

    setUploadingImage(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      setUploadingImage(false);
      return;
    }

    const extension =
      file.name.split(".").pop()?.toLowerCase() || "jpg";

    const fileName = `${crypto.randomUUID()}.${extension}`;
    const filePath = `${user.id}/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from("thumbnails")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      alert("IMAGE UPLOAD ERROR: " + uploadError.message);
      setUploadingImage(false);
      return;
    }

    const { data: signedData, error: signedError } =
      await supabase.storage
        .from("thumbnails")
        .createSignedUrl(filePath, 60 * 60);

    if (signedError) {
      alert("IMAGE URL ERROR: " + signedError.message);
      setUploadingImage(false);
      return;
    }

    setForm((previous) => ({
      ...previous,
      thumbnail_url: signedData.signedUrl,
    }));

    setUploadingImage(false);

    alert("Thumbnail uploaded successfully!");
  }

  async function saveVideo() {
    if (!form.title.trim()) {
      alert("Please enter a title.");
      return;
    }

    if (!form.slug.trim()) {
      alert("Please enter a slug.");
      return;
    }

    if (!form.video_url.trim()) {
      alert("Please upload a video or enter a video URL.");
      return;
    }

    setSaving(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("Please login first.");
      setSaving(false);
      return;
    }

    if (editingId) {
      const { error } = await supabase
        .from("videos")
        .update({
          title: form.title,
          slug: form.slug,
          description: form.description,
          category: form.category,
          video_url: form.video_url,
          thumbnail_url: form.thumbnail_url || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", editingId);

      if (error) {
        alert("UPDATE ERROR: " + error.message);
      } else {
        alert("Video updated successfully!");
        resetForm();
        await loadVideos();
      }
    } else {
      const { error } = await supabase.from("videos").insert({
        title: form.title,
        slug: form.slug,
        description: form.description,
        category: form.category,
        video_url: form.video_url,
        thumbnail_url: form.thumbnail_url || null,
        author_id: user.id,
        published: false,
      });

      if (error) {
        alert("CREATE ERROR: " + error.message);
      } else {
        alert("Video created successfully!");
        resetForm();
        await loadVideos();
      }
    }

    setSaving(false);
  }

  function editVideo(video: Video) {
    setEditingId(video.id);

    setForm({
      title: video.title,
      slug: video.slug,
      description: video.description || "",
      category: video.category || "",
      video_url: video.video_url || "",
      thumbnail_url: video.thumbnail_url || "",
    });

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function deleteVideo(id: number) {
    const confirmed = confirm(
      "Are you sure you want to delete this video?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("videos")
      .delete()
      .eq("id", id);

    if (error) {
      alert("DELETE ERROR: " + error.message);
      return;
    }

    alert("Video deleted successfully!");
    await loadVideos();
  }

  async function togglePublish(video: Video) {
    const { error } = await supabase
      .from("videos")
      .update({
        published: !video.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", video.id);

    if (error) {
      alert("PUBLISH ERROR: " + error.message);
      return;
    }

    await loadVideos();
  }

  const inputClass =
    "w-full rounded-xl border border-black/10 bg-[#f7f7f4] px-4 py-3.5 text-sm font-medium text-[#111] placeholder:text-black/25 outline-none transition-all duration-300 focus:border-[#163A5F] focus:bg-white focus:ring-4 focus:ring-[#163A5F]/10";

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f5f2] text-[#111]">
      {/* Background Grid */}
      <div
        className="pointer-events-none fixed inset-0 opacity-[0.035]"
        style={{
          backgroundImage:
            "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
          backgroundSize: "70px 70px",
        }}
      />

      {/* Blue Glow */}
      <div className="pointer-events-none fixed left-1/2 top-[8%] h-[550px] w-[550px] -translate-x-1/2 rounded-full bg-blue-500/10 blur-[130px]" />

      <div className="relative mx-auto max-w-6xl px-5 py-14 md:px-8">
        {/* HEADER */}
        <div className="mb-8 flex items-center justify-center gap-3">
          <span className="h-px w-10 bg-[#163A5F]" />

          <span className="text-xs font-bold uppercase tracking-[0.25em] text-[#163A5F]">
            Career Platform
          </span>

          <span className="h-px w-10 bg-[#163A5F]" />
        </div>

        <div className="mb-10">
          <p className="mb-3 text-xs font-bold uppercase tracking-[0.2em] text-[#163A5F]">
            Admin Panel
          </p>

          <h1 className="text-4xl font-semibold tracking-[-0.05em] md:text-6xl">
            Videos
            <span className="text-black/20">.</span>
          </h1>

          <p className="mt-4 max-w-2xl text-sm leading-6 text-black/45 md:text-base">
            Upload videos, add external video links and manage
            career-focused video content.
          </p>
        </div>

        {/* FORM */}
        <section className="rounded-[2rem] border border-black/10 bg-white/90 p-6 shadow-[0_30px_100px_rgba(0,0,0,0.08)] backdrop-blur-xl md:p-9">
          <div className="mb-8 flex flex-col justify-between gap-5 border-b border-black/10 pb-7 md:flex-row md:items-center">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#163A5F]">
                Content Editor
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                {editingId ? "Edit Video" : "Create Video"}
              </h2>

              <p className="mt-2 text-sm leading-6 text-black/45">
                Fill in the details below to manage your video.
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

          <div className="grid gap-6">
            {/* TITLE */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-black/60">
                Title
              </label>

              <input
                type="text"
                value={form.title}
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
                placeholder="Example: How to Build a Strong Resume"
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
                  setForm({
                    ...form,
                    slug: e.target.value
                      .toLowerCase()
                      .replace(/\s+/g, "-"),
                  })
                }
                placeholder="how-to-build-a-strong-resume"
                spellCheck={false}
                className={`${inputClass} font-mono`}
              />

              <p className="mt-2 text-xs leading-5 text-black/40">
                Used as the URL-friendly identifier for this video.
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
                  setForm({
                    ...form,
                    category: e.target.value,
                  })
                }
                placeholder="Career / Resume / Interview"
                className={inputClass}
              />
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-[0.12em] text-black/60">
                Description
              </label>

              <textarea
                value={form.description}
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
                placeholder="Describe this video..."
                rows={5}
                className={`${inputClass} resize-none leading-6`}
              />
            </div>

            {/* VIDEO SECTION */}
            <div className="rounded-[1.5rem] border border-black/10 bg-[#f7f7f4] p-5 md:p-6">
              <div className="mb-5">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#163A5F]">
                  Video Source
                </p>

                <p className="mt-2 text-sm leading-6 text-black/45">
                  Upload your own video or paste an external video URL.
                </p>
              </div>

              <div className="grid gap-5 md:grid-cols-2">
                {/* UPLOAD */}
                <div className="rounded-[1.25rem] border border-black/10 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-black">
                    Upload Video
                  </p>

                  <p className="mt-2 text-xs leading-5 text-black/45">
                    MP4 or another supported video file.
                    Maximum size: 200MB.
                  </p>

                  <label className="mt-4 flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-black/10 bg-[#f7f7f4] px-4 py-5 text-sm font-bold text-black transition-all duration-300 hover:border-[#163A5F] hover:bg-[#163A5F]/5">
                    <span>
                      {uploadingVideo
                        ? "Uploading..."
                        : "Choose Video File"}
                    </span>

                    <input
                      type="file"
                      accept="video/*"
                      onChange={uploadVideo}
                      disabled={uploadingVideo}
                      className="hidden"
                    />
                  </label>

                  {uploadingVideo && (
                    <p className="mt-3 text-sm font-bold text-[#163A5F]">
                      Uploading video...
                    </p>
                  )}
                </div>

                {/* URL */}
                <div className="rounded-[1.25rem] border border-black/10 bg-white p-5 shadow-sm">
                  <p className="text-sm font-bold text-black">
                    Video URL
                  </p>

                  <p className="mt-2 text-xs leading-5 text-black/45">
                    YouTube, YouTube Shorts, Vimeo or direct video URL.
                  </p>

                  <input
                    type="url"
                    value={form.video_url}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        video_url: e.target.value,
                      })
                    }
                    placeholder="https://www.youtube.com/watch?v=..."
                    spellCheck={false}
                    autoComplete="off"
                    className={`${inputClass} mt-4 font-mono text-[13px]`}
                  />

                  <p className="mt-2 text-[11px] leading-5 text-black/40">
                    Paste the complete URL including https://
                  </p>
                </div>
              </div>

              {/* CURRENT URL */}
              {form.video_url && (
                <div className="mt-5 rounded-[1.25rem] border border-[#163A5F]/15 bg-[#163A5F]/5 p-5">
                  <p className="mb-2 text-xs font-bold uppercase tracking-[0.15em] text-[#163A5F]">
                    Current Video URL
                  </p>

                  <div className="overflow-x-auto rounded-xl border border-black/10 bg-white px-4 py-3 font-mono text-xs leading-6 text-black">
                    {form.video_url}
                  </div>

                  <p className="mt-2 text-xs leading-5 text-black/45">
                    If you enter a URL after uploading a video,
                    this URL will replace the uploaded video for this record.
                  </p>
                </div>
              )}
            </div>

            {/* THUMBNAIL */}
            <div className="rounded-[1.5rem] border border-black/10 bg-[#f7f7f4] p-5 md:p-6">
              <div className="mb-4">
                <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#163A5F]">
                  Thumbnail
                </p>

                <p className="mt-2 text-sm leading-6 text-black/45">
                  Upload an image to use as the video thumbnail.
                  Maximum size: 5MB.
                </p>
              </div>

              <label className="flex cursor-pointer items-center justify-center rounded-xl border-2 border-dashed border-black/10 bg-white px-4 py-5 text-sm font-bold text-black transition-all duration-300 hover:border-[#163A5F] hover:bg-[#163A5F]/5">
                <span>
                  {uploadingImage
                    ? "Uploading Thumbnail..."
                    : "Choose Thumbnail Image"}
                </span>

                <input
                  type="file"
                  accept="image/*"
                  onChange={uploadThumbnail}
                  disabled={uploadingImage}
                  className="hidden"
                />
              </label>

              {uploadingImage && (
                <p className="mt-3 text-sm font-bold text-[#163A5F]">
                  Uploading image...
                </p>
              )}

              {form.thumbnail_url && (
                <div className="mt-5 overflow-hidden rounded-[1.25rem] border border-black/10 bg-white shadow-sm">
                  <img
                    src={form.thumbnail_url}
                    alt="Video thumbnail"
                    className="h-56 w-full object-cover"
                  />
                </div>
              )}
            </div>

            {/* SAVE */}
            <div className="flex flex-wrap gap-3 border-t border-black/10 pt-6">
              <button
                type="button"
                onClick={saveVideo}
                disabled={
                  saving ||
                  uploadingVideo ||
                  uploadingImage
                }
                className="group flex items-center gap-3 rounded-xl bg-[#163A5F] px-6 py-3.5 text-sm font-bold text-white shadow-[0_12px_30px_rgba(22,58,95,0.20)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#0B2742] hover:shadow-[0_18px_40px_rgba(22,58,95,0.28)] disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving
                  ? "Saving..."
                  : editingId
                  ? "Update Video"
                  : "Create Video"}

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
                  Clear Form
                </button>
              )}
            </div>
          </div>
        </section>

        {/* LIST */}
        <section className="mt-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.15em] text-[#163A5F]">
                Library
              </p>

              <h2 className="mt-2 text-2xl font-semibold tracking-tight">
                All Videos
              </h2>

              <p className="mt-2 text-sm leading-6 text-black/45">
                Manage your published and unpublished videos.
              </p>
            </div>

            <span className="rounded-full bg-[#163A5F] px-4 py-1.5 text-sm font-bold text-white shadow-lg shadow-[#163A5F]/15">
              {videos.length}
            </span>
          </div>

          {loading ? (
            <div className="rounded-[1.5rem] border border-black/10 bg-white/90 p-8 text-sm text-black/45 shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl">
              Loading videos...
            </div>
          ) : videos.length === 0 ? (
            <div className="rounded-[1.5rem] border border-black/10 bg-white/90 p-8 text-sm text-black/45 shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl">
              No videos uploaded yet.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2">
              {videos.map((video) => (
                <article
                  key={video.id}
                  className="overflow-hidden rounded-[1.75rem] border border-black/10 bg-white/90 shadow-[0_20px_60px_rgba(0,0,0,0.05)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_25px_70px_rgba(0,0,0,0.09)]"
                >
                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="h-52 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-[#163A5F] text-5xl text-white">
                      🎥
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="text-xl font-semibold tracking-tight">
                          {video.title}
                        </h3>

                        {video.category && (
                          <p className="mt-2 text-xs font-bold uppercase tracking-[0.12em] text-[#163A5F]">
                            {video.category}
                          </p>
                        )}

                        <p className="mt-2 break-all font-mono text-xs text-black/30">
                          /{video.slug}
                        </p>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                          video.published
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        {video.published
                          ? "Published"
                          : "Draft"}
                      </span>
                    </div>

                    {video.description && (
                      <p className="mt-4 line-clamp-3 text-sm leading-6 text-black/45">
                        {video.description}
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap gap-2">
                      <button
                        type="button"
                        onClick={() => editVideo(video)}
                        className="rounded-lg border border-black/10 bg-[#f7f7f4] px-4 py-2 text-xs font-bold text-black transition-all duration-300 hover:border-[#163A5F] hover:bg-[#163A5F] hover:text-white"
                      >
                        Edit
                      </button>

                      <button
                        type="button"
                        onClick={() => togglePublish(video)}
                        className="rounded-lg bg-[#163A5F] px-4 py-2 text-xs font-bold text-white transition-all duration-300 hover:bg-[#0B2742]"
                      >
                        {video.published
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        type="button"
                        onClick={() => deleteVideo(video.id)}
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