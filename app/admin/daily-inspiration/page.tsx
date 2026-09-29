"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type Inspiration = {
  id: number;
  image_url: string;
  published: boolean;
};

export default function DailyInspirationPage() {
  const [items, setItems] = useState<Inspiration[]>([]);
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadItems() {
    setLoading(true);

    const { data, error } = await supabase
      .from("daily_inspiration")
      .select("id, image_url, published")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setMessage("Failed to load inspiration.");
    } else {
      setItems(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  async function addImage() {
    if (!imageUrl.trim()) {
      setMessage("Please enter an image URL.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("daily_inspiration")
      .insert({
        image_url: imageUrl.trim(),
        published: true,
      });

    if (error) {
      console.error(error);
      setMessage("Failed to save image.");
    } else {
      setImageUrl("");
      setMessage("Image added successfully.");
      await loadItems();
    }

    setSaving(false);
  }

  async function togglePublished(
    id: number,
    currentStatus: boolean
  ) {
    const { error } = await supabase
      .from("daily_inspiration")
      .update({
        published: !currentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage("Failed to update image.");
      return;
    }

    await loadItems();
  }

  async function deleteImage(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this image?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("daily_inspiration")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage("Failed to delete image.");
      return;
    }

    setMessage("Image deleted.");
    await loadItems();
  }

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-[#111]">
      {/* HEADER */}
      <section className="border-b border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
            Homepage Content
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight">
            Daily Inspiration
          </h1>

          <p className="mt-4 max-w-2xl text-black/55">
            Add quote, motivation or inspiration images that will
            appear publicly on the homepage.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-10">
        {/* ADD IMAGE */}
        <div className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
          <h2 className="text-2xl font-bold">
            Add New Image
          </h2>

          <p className="mt-2 text-sm text-black/50">
            Paste a direct image URL below.
          </p>

          <div className="mt-6 flex flex-col gap-3 md:flex-row">
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="https://example.com/quote.jpg"
              className="flex-1 rounded-xl border border-black/10 bg-[#f8f8f6] px-4 py-3 outline-none focus:border-blue-500"
            />

            <button
              onClick={addImage}
              disabled={saving}
              className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Add Image"}
            </button>
          </div>

          {message && (
            <p className="mt-4 text-sm font-medium text-blue-600">
              {message}
            </p>
          )}
        </div>

        {/* PREVIEW LIST */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold">
            Inspiration Images
          </h2>

          {loading ? (
            <p className="mt-6 text-black/50">
              Loading...
            </p>
          ) : items.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-black/20 bg-white p-10 text-center">
              <p className="font-semibold">
                No inspiration images added yet.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="overflow-hidden rounded-3xl border border-black/10 bg-white"
                >
                  <img
                    src={item.image_url}
                    alt="Daily inspiration"
                    className="h-64 w-full object-cover"
                  />

                  <div className="p-5">
                    <div className="flex items-center justify-between gap-3">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-semibold ${
                          item.published
                            ? "bg-green-100 text-green-700"
                            : "bg-black/10 text-black/50"
                        }`}
                      >
                        {item.published
                          ? "Published"
                          : "Hidden"}
                      </span>

                      <span className="text-xs text-black/40">
                        #{item.id}
                      </span>
                    </div>

                    <div className="mt-4 flex gap-2">
                      <button
                        onClick={() =>
                          togglePublished(
                            item.id,
                            item.published
                          )
                        }
                        className="flex-1 rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold transition hover:bg-black hover:text-white"
                      >
                        {item.published
                          ? "Hide"
                          : "Publish"}
                      </button>

                      <button
                        onClick={() =>
                          deleteImage(item.id)
                        }
                        className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 transition hover:bg-red-600 hover:text-white"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}