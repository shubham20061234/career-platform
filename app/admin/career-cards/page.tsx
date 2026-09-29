"use client";

import { FormEvent, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/src/lib/supabase";

type CareerCard = {
  id: number;
  category: string | null;
  title: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  wikipedia_url: string | null;
  youtube_url: string | null;
  useful_link: string | null;
  resource_url: string | null;
  button_text: string | null;
  published: boolean;
};

type FormState = {
  category: string;
  title: string;
  slug: string;
  description: string;
  image_url: string;
  wikipedia_url: string;
  youtube_url: string;
  useful_link: string;
  resource_url: string;
  button_text: string;
};

const emptyForm: FormState = {
  category: "",
  title: "",
  slug: "",
  description: "",
  image_url: "",
  wikipedia_url: "",
  youtube_url: "",
  useful_link: "",
  resource_url: "",
  button_text: "Explore Career",
};

export default function CareerCardsAdminPage() {
  const searchParams = useSearchParams();

  const [cards, setCards] = useState<CareerCard[]>([]);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadCards() {
    setLoading(true);

    const { data, error } = await supabase
      .from("career_cards")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      setMessage(error.message);
      setLoading(false);
      return;
    }

    setCards(data || []);
    setLoading(false);
  }

  useEffect(() => {
    loadCards();
  }, []);

  useEffect(() => {
    const editId = searchParams.get("edit");

    if (!editId || cards.length === 0) return;

    const card = cards.find(
      (item) => item.id === Number(editId)
    );

    if (card) {
      startEdit(card);
    }
  }, [searchParams, cards]);

  function updateField(
    field: keyof FormState,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  function startEdit(card: CareerCard) {
    setEditingId(card.id);

    setForm({
      category: card.category || "",
      title: card.title || "",
      slug: card.slug || "",
      description: card.description || "",
      image_url: card.image_url || "",
      wikipedia_url: card.wikipedia_url || "",
      youtube_url: card.youtube_url || "",
      useful_link: card.useful_link || "",
      resource_url: card.resource_url || "",
      button_text: card.button_text || "Explore Career",
    });

    setMessage("");

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(emptyForm);
    setMessage("");
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!editingId) {
      setMessage("Select one of the six cards below to edit.");
      return;
    }

    if (!form.title.trim()) {
      setMessage("Career title is required.");
      return;
    }

    setSaving(true);
    setMessage("");

    const { error } = await supabase
      .from("career_cards")
      .update({
        category: form.category.trim() || null,
        title: form.title.trim(),
        slug:
          form.slug.trim() ||
          form.title
            .trim()
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, ""),
        description: form.description.trim() || null,
        image_url: form.image_url.trim() || null,
        wikipedia_url:
          form.wikipedia_url.trim() || null,
        youtube_url:
          form.youtube_url.trim() || null,
        useful_link:
          form.useful_link.trim() || null,
        resource_url:
          form.resource_url.trim() || null,
        button_text:
          form.button_text.trim() || "Explore Career",
        updated_at: new Date().toISOString(),
      })
      .eq("id", editingId);

    if (error) {
      setMessage(error.message);
      setSaving(false);
      return;
    }

    setMessage(
      "Card updated successfully. Homepage changes are live."
    );

    await loadCards();

    setSaving(false);
  }

  async function togglePublished(card: CareerCard) {
    const { error } = await supabase
      .from("career_cards")
      .update({
        published: !card.published,
        updated_at: new Date().toISOString(),
      })
      .eq("id", card.id);

    if (error) {
      setMessage(error.message);
      return;
    }

    setCards((current) =>
      current.map((item) =>
        item.id === card.id
          ? {
              ...item,
              published: !card.published,
            }
          : item
      )
    );

    setMessage(
      card.published
        ? `${card.title} is now hidden from the homepage.`
        : `${card.title} is now visible on the homepage.`
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-[#111]">
      <div className="mx-auto max-w-7xl px-6 py-12 md:py-16">

        {/* HEADER */}
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
              Homepage Settings
            </p>

            <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
              Six Career Cards
            </h1>

            <p className="mt-4 max-w-2xl text-lg leading-8 text-black/55">
              Edit the six existing homepage cards. No new cards are created.
            </p>
          </div>

          <a
            href="/admin"
            className="inline-flex w-fit rounded-xl border border-black/10 bg-white px-5 py-3 text-sm font-semibold transition hover:bg-black hover:text-white"
          >
            ← Dashboard
          </a>
        </div>

        {/* EDITOR */}
        {editingId && (
          <section className="mt-10 rounded-3xl border border-blue-200 bg-white p-7 shadow-sm md:p-8">

            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
                  Editing Card
                </p>

                <h2 className="mt-2 text-2xl font-bold">
                  {form.title || "Career Card"}
                </h2>
              </div>

              <button
                type="button"
                onClick={cancelEdit}
                className="rounded-xl border border-black/10 px-5 py-3 text-sm font-semibold hover:bg-black hover:text-white"
              >
                Cancel
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-7 space-y-6"
            >

              {/* Category + Title */}
              <div className="grid gap-6 md:grid-cols-2">

                <div>
                  <label className="text-sm font-semibold">
                    Category
                  </label>

                  <input
                    value={form.category}
                    onChange={(e) =>
                      updateField(
                        "category",
                        e.target.value
                      )
                    }
                    placeholder="Career"
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Card Title
                  </label>

                  <input
                    value={form.title}
                    onChange={(e) =>
                      updateField(
                        "title",
                        e.target.value
                      )
                    }
                    className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

              </div>

              {/* Slug */}
              <div>
                <label className="text-sm font-semibold">
                  Slug
                </label>

                <input
                  value={form.slug}
                  onChange={(e) =>
                    updateField(
                      "slug",
                      e.target.value
                    )
                  }
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* Description */}
              <div>
                <label className="text-sm font-semibold">
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
                  rows={4}
                  className="mt-2 w-full resize-none rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* Image */}
              <div>
                <label className="text-sm font-semibold">
                  Card Image URL
                </label>

                <input
                  value={form.image_url}
                  onChange={(e) =>
                    updateField(
                      "image_url",
                      e.target.value
                    )
                  }
                  placeholder="https://..."
                  className="mt-2 w-full rounded-xl border border-black/10 bg-white px-4 py-3 outline-none focus:border-blue-500"
                />

                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="mt-4 h-40 w-full rounded-2xl object-cover"
                  />
                )}
              </div>

              {/* Links */}
              <div className="grid gap-6 md:grid-cols-2">

                <div>
                  <label className="text-sm font-semibold">
                    Wikipedia Link
                  </label>

                  <input
                    value={form.wikipedia_url}
                    onChange={(e) =>
                      updateField(
                        "wikipedia_url",
                        e.target.value
                      )
                    }
                    placeholder="https://en.wikipedia.org/..."
                    className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    YouTube Link
                  </label>

                  <input
                    value={form.youtube_url}
                    onChange={(e) =>
                      updateField(
                        "youtube_url",
                        e.target.value
                      )
                    }
                    placeholder="https://youtube.com/..."
                    className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Useful Link
                  </label>

                  <input
                    value={form.useful_link}
                    onChange={(e) =>
                      updateField(
                        "useful_link",
                        e.target.value
                      )
                    }
                    placeholder="https://..."
                    className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-sm font-semibold">
                    Resource / PDF Link
                  </label>

                  <input
                    value={form.resource_url}
                    onChange={(e) =>
                      updateField(
                        "resource_url",
                        e.target.value
                      )
                    }
                    placeholder="https://drive.google.com/..."
                    className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500"
                  />
                </div>

              </div>

              {/* Button */}
              <div>
                <label className="text-sm font-semibold">
                  Main Button Text
                </label>

                <input
                  value={form.button_text}
                  onChange={(e) =>
                    updateField(
                      "button_text",
                      e.target.value
                    )
                  }
                  placeholder="Explore Career"
                  className="mt-2 w-full rounded-xl border border-black/10 px-4 py-3 outline-none focus:border-blue-500"
                />
              </div>

              {/* Message */}
              {message && (
                <div className="rounded-xl bg-black/5 px-4 py-3 text-sm font-medium">
                  {message}
                </div>
              )}

              {/* Save */}
              <button
                type="submit"
                disabled={saving}
                className="w-full rounded-xl bg-black px-6 py-4 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {saving
                  ? "Saving Changes..."
                  : "Save Changes"}
              </button>

            </form>
          </section>
        )}

        {/* SIX EXISTING CARDS */}
        <section className="mt-10">

          <div className="mb-6">
            <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
              Existing Homepage Cards
            </p>

            <h2 className="mt-2 text-2xl font-bold">
              Manage all 6 cards
            </h2>
          </div>

          {loading ? (
            <div className="rounded-2xl border border-black/10 bg-white p-8 text-center">
              Loading cards...
            </div>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">

              {cards.map((card, index) => (
                <article
                  key={card.id}
                  className="overflow-hidden rounded-3xl border border-black/10 bg-white shadow-sm"
                >

                  {/* IMAGE */}
                  {card.image_url ? (
                    <img
                      src={card.image_url}
                      alt={card.title}
                      className="h-48 w-full object-cover"
                    />
                  ) : (
                    <div
                      className={`flex h-48 items-center justify-center text-5xl ${
                        index % 3 === 0
                          ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600"
                          : index % 3 === 1
                            ? "bg-gradient-to-br from-orange-400 via-red-500 to-pink-600"
                            : "bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500"
                      }`}
                    >
                      💼
                    </div>
                  )}

                  <div className="p-6">

                    <div className="flex items-start justify-between gap-3">

                      <div>
                        <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                          {card.category}
                        </p>

                        <h3 className="mt-2 text-xl font-bold">
                          {card.title}
                        </h3>
                      </div>

                      <span
                        className={`shrink-0 rounded-full px-3 py-1 text-xs font-bold ${
                          card.published
                            ? "bg-green-100 text-green-700"
                            : "bg-red-100 text-red-600"
                        }`}
                      >
                        {card.published
                          ? "Visible"
                          : "Hidden"}
                      </span>

                    </div>

                    {card.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/50">
                        {card.description}
                      </p>
                    )}

                    {/* EDIT */}
                    <button
                      type="button"
                      onClick={() => startEdit(card)}
                      className="mt-6 w-full rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-600"
                    >
                      ✏️ Edit This Card
                    </button>

                    {/* SHOW / HIDE */}
                    <button
                      type="button"
                      onClick={() =>
                        togglePublished(card)
                      }
                      className={`mt-3 w-full rounded-xl border px-5 py-3 text-sm font-semibold transition ${
                        card.published
                          ? "border-red-200 text-red-600 hover:bg-red-50"
                          : "border-green-200 text-green-600 hover:bg-green-50"
                      }`}
                    >
                      {card.published
                        ? "👁 Hide From Homepage"
                        : "👁 Show On Homepage"}
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