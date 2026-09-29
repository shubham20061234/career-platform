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
      const { error } = await supabase
        .from("videos")
        .insert({
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

  return (
    <main className="min-h-screen bg-[#f8f8f6] p-6 md:p-10">
      <div className="mx-auto max-w-6xl">

        <div className="mb-10">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Admin Panel
          </p>

          <h1 className="mt-2 text-4xl font-bold">
            Videos
          </h1>

          <p className="mt-3 text-black/60">
            Upload or add video links and manage career videos.
          </p>
        </div>

        {/* FORM */}

        <section className="rounded-2xl border bg-white p-6 shadow-sm">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              {editingId ? "Edit Video" : "Create Video"}
            </h2>

            {editingId && (
              <button
                onClick={resetForm}
                className="rounded-lg border px-4 py-2 text-sm"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="grid gap-5">

            {/* TITLE */}

            <div>
              <label className="mb-2 block text-sm font-semibold">
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
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* SLUG */}

            <div>
              <label className="mb-2 block text-sm font-semibold">
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
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* CATEGORY */}

            <div>
              <label className="mb-2 block text-sm font-semibold">
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
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* DESCRIPTION */}

            <div>
              <label className="mb-2 block text-sm font-semibold">
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
                className="w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* VIDEO */}

            <div className="rounded-2xl border border-black/10 bg-[#f8f8f6] p-5">
              <label className="mb-4 block text-sm font-semibold">
                Video
              </label>

              <div className="grid gap-5 md:grid-cols-2">

                {/* UPLOAD */}

                <div className="rounded-xl border bg-white p-4">
                  <p className="text-sm font-semibold">
                    Upload Video
                  </p>

                  <p className="mt-1 text-xs text-black/50">
                    Upload MP4 or another supported video file.
                  </p>

                  <input
                    type="file"
                    accept="video/*"
                    onChange={uploadVideo}
                    disabled={uploadingVideo}
                    className="mt-4 w-full rounded-xl border bg-white px-4 py-3"
                  />

                  {uploadingVideo && (
                    <p className="mt-2 text-sm text-blue-600">
                      Uploading video...
                    </p>
                  )}
                </div>

                {/* URL */}

                <div className="rounded-xl border bg-white p-4">
                  <p className="text-sm font-semibold">
                    Video URL
                  </p>

                  <p className="mt-1 text-xs text-black/50">
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
                    className="mt-4 w-full rounded-xl border px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {form.video_url && (
                <div className="mt-5">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-black/40">
                    Current Video URL
                  </p>

                  <div className="break-all rounded-xl bg-black px-4 py-3 text-sm text-white/80">
                    {form.video_url}
                  </div>

                  <p className="mt-2 text-xs text-black/40">
                    If you enter a URL after uploading a video, the URL will
                    replace the uploaded video for this record.
                  </p>
                </div>
              )}
            </div>

            {/* THUMBNAIL */}

            <div>
              <label className="mb-2 block text-sm font-semibold">
                Thumbnail
              </label>

              <input
                type="file"
                accept="image/*"
                onChange={uploadThumbnail}
                disabled={uploadingImage}
                className="w-full rounded-xl border bg-white px-4 py-3"
              />

              {uploadingImage && (
                <p className="mt-2 text-sm text-blue-600">
                  Uploading image...
                </p>
              )}

              {form.thumbnail_url && (
                <img
                  src={form.thumbnail_url}
                  alt="Video thumbnail"
                  className="mt-4 h-48 w-full rounded-xl object-cover"
                />
              )}
            </div>

            {/* SAVE */}

            <button
              onClick={saveVideo}
              disabled={
                saving ||
                uploadingVideo ||
                uploadingImage
              }
              className="rounded-xl bg-black px-5 py-3 font-semibold text-white hover:bg-black/80 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                ? "Update Video"
                : "Create Video"}
            </button>
          </div>
        </section>

        {/* LIST */}

        <section className="mt-10">

          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              All Videos
            </h2>

            <span className="rounded-full bg-black px-3 py-1 text-sm text-white">
              {videos.length}
            </span>
          </div>

          {loading ? (
            <div className="rounded-2xl border bg-white p-8">
              Loading videos...
            </div>
          ) : videos.length === 0 ? (
            <div className="rounded-2xl border bg-white p-8 text-black/60">
              No videos uploaded yet.
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2">

              {videos.map((video) => (
                <article
                  key={video.id}
                  className="overflow-hidden rounded-2xl border bg-white shadow-sm"
                >

                  {video.thumbnail_url ? (
                    <img
                      src={video.thumbnail_url}
                      alt={video.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center bg-black text-5xl">
                      🎥
                    </div>
                  )}

                  <div className="p-6">

                    <div className="flex items-start justify-between gap-4">

                      <div>
                        <h3 className="text-xl font-bold">
                          {video.title}
                        </h3>

                        {video.category && (
                          <p className="mt-1 text-sm text-blue-600">
                            {video.category}
                          </p>
                        )}

                        <p className="mt-1 text-sm text-black/40">
                          /{video.slug}
                        </p>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
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
                      <p className="mt-4 line-clamp-3 text-sm text-black/60">
                        {video.description}
                      </p>
                    )}

                    <div className="mt-6 flex flex-wrap gap-2">

                      <button
                        onClick={() => editVideo(video)}
                        className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-black/5"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() => togglePublish(video)}
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                      >
                        {video.published
                          ? "Unpublish"
                          : "Publish"}
                      </button>

                      <button
                        onClick={() => deleteVideo(video.id)}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
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