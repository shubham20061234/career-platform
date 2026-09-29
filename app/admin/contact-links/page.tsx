"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type ContactLink = {
  id: number;
  platform: string;
  label: string;
  url: string;
  published: boolean;
  sort_order: number;
};

const platformOptions = [
  { value: "instagram", label: "Instagram" },
  { value: "youtube", label: "YouTube" },
  { value: "facebook", label: "Facebook" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "twitter", label: "X / Twitter" },
  { value: "email", label: "Email" },
  { value: "website", label: "Website" },
  { value: "telegram", label: "Telegram" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "other", label: "Other" },
];

export default function ContactLinksPage() {
  const [items, setItems] = useState<ContactLink[]>([]);

  const [platform, setPlatform] = useState("instagram");
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [sortOrder, setSortOrder] = useState("0");

  const [editingId, setEditingId] = useState<number | null>(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadItems() {
    setLoading(true);

    const { data, error } = await supabase
      .from("contact_links")
      .select(
        "id, platform, label, url, published, sort_order"
      )
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      setMessage("Failed to load contact links.");
    } else {
      setItems(data || []);
    }

    setLoading(false);
  }

  useEffect(() => {
    loadItems();
  }, []);

  function resetForm() {
    setPlatform("instagram");
    setLabel("");
    setUrl("");
    setSortOrder("0");
    setEditingId(null);
  }

  function startEdit(item: ContactLink) {
    setEditingId(item.id);
    setPlatform(item.platform);
    setLabel(item.label);
    setUrl(item.url);
    setSortOrder(String(item.sort_order));

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function saveLink() {
    if (!label.trim()) {
      setMessage("Please enter a label.");
      return;
    }

    if (!url.trim()) {
      setMessage("Please enter a link.");
      return;
    }

    setSaving(true);
    setMessage("");

    const payload = {
      platform,
      label: label.trim(),
      url: url.trim(),
      sort_order: Number(sortOrder) || 0,
      updated_at: new Date().toISOString(),
    };

    if (editingId) {
      const { error } = await supabase
        .from("contact_links")
        .update(payload)
        .eq("id", editingId);

      if (error) {
        console.error(error);
        setMessage("Failed to update contact link.");
      } else {
        setMessage("Contact link updated successfully.");
        resetForm();
        await loadItems();
      }
    } else {
      const { error } = await supabase
        .from("contact_links")
        .insert({
          ...payload,
          published: true,
        });

      if (error) {
        console.error(error);
        setMessage("Failed to add contact link.");
      } else {
        setMessage("Contact link added successfully.");
        resetForm();
        await loadItems();
      }
    }

    setSaving(false);
  }

  async function togglePublished(
    id: number,
    currentStatus: boolean
  ) {
    const { error } = await supabase
      .from("contact_links")
      .update({
        published: !currentStatus,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage("Failed to update visibility.");
      return;
    }

    await loadItems();
  }

  async function deleteLink(id: number) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this contact link?"
    );

    if (!confirmed) return;

    const { error } = await supabase
      .from("contact_links")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);
      setMessage("Failed to delete contact link.");
      return;
    }

    setMessage("Contact link deleted.");
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
            Contact Links
          </h1>

          <p className="mt-4 max-w-2xl text-black/55">
            Manage the social media, email and other contact
            links shown on the homepage.
          </p>
        </div>
      </section>

      {/* FORM */}
      <section className="mx-auto max-w-7xl px-6 py-10">
        <div className="rounded-3xl border border-black/10 bg-white p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">
                {editingId
                  ? "Edit Contact Link"
                  : "Add Contact Link"}
              </h2>

              <p className="mt-2 text-sm text-black/50">
                Choose a platform and add the link you want
                visitors to see.
              </p>
            </div>

            {editingId && (
              <button
                onClick={resetForm}
                className="rounded-xl border border-black/10 px-4 py-2 text-sm font-semibold transition hover:bg-black hover:text-white"
              >
                Cancel Edit
              </button>
            )}
          </div>

          <div className="mt-7 grid gap-5 md:grid-cols-2">
            {/* PLATFORM */}
            <div>
              <label className="text-sm font-semibold">
                Platform
              </label>

              <select
                value={platform}
                onChange={(e) =>
                  setPlatform(e.target.value)
                }
                className="mt-2 w-full rounded-xl border border-black/10 bg-[#f8f8f6] px-4 py-3 outline-none focus:border-blue-500"
              >
                {platformOptions.map((option) => (
                  <option
                    key={option.value}
                    value={option.value}
                  >
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* LABEL */}
            <div>
              <label className="text-sm font-semibold">
                Display Name
              </label>

              <input
                type="text"
                value={label}
                onChange={(e) =>
                  setLabel(e.target.value)
                }
                placeholder="Instagram"
                className="mt-2 w-full rounded-xl border border-black/10 bg-[#f8f8f6] px-4 py-3 outline-none focus:border-blue-500"
              />
            </div>

            {/* URL */}
            <div className="md:col-span-2">
              <label className="text-sm font-semibold">
                Link / URL
              </label>

              <input
                type="text"
                value={url}
                onChange={(e) =>
                  setUrl(e.target.value)
                }
                placeholder="https://instagram.com/yourusername"
                className="mt-2 w-full rounded-xl border border-black/10 bg-[#f8f8f6] px-4 py-3 outline-none focus:border-blue-500"
              />

              <p className="mt-2 text-xs text-black/40">
                For email you can use:
                mailto:you@example.com
              </p>
            </div>

            {/* ORDER */}
            <div>
              <label className="text-sm font-semibold">
                Display Order
              </label>

              <input
                type="number"
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(e.target.value)
                }
                placeholder="0"
                className="mt-2 w-full rounded-xl border border-black/10 bg-[#f8f8f6] px-4 py-3 outline-none focus:border-blue-500"
              />

              <p className="mt-2 text-xs text-black/40">
                Lower numbers appear first.
              </p>
            </div>
          </div>

          <div className="mt-7 flex gap-3">
            <button
              onClick={saveLink}
              disabled={saving}
              className="rounded-xl bg-black px-6 py-3 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
            >
              {saving
                ? "Saving..."
                : editingId
                  ? "Update Link"
                  : "Add Link"}
            </button>

            {!editingId && (
              <button
                onClick={resetForm}
                className="rounded-xl border border-black/10 px-6 py-3 text-sm font-semibold transition hover:bg-black hover:text-white"
              >
                Clear
              </button>
            )}
          </div>

          {message && (
            <p className="mt-4 text-sm font-medium text-blue-600">
              {message}
            </p>
          )}
        </div>

        {/* LIST */}
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                Your Contact Links
              </h2>

              <p className="mt-2 text-sm text-black/50">
                These links will appear in the homepage Contact
                section when published.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="mt-6 text-black/50">
              Loading...
            </p>
          ) : items.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-dashed border-black/20 bg-white p-10 text-center">
              <p className="font-semibold">
                No contact links added yet.
              </p>

              <p className="mt-2 text-sm text-black/50">
                Add your first social media or contact link
                above.
              </p>
            </div>
          ) : (
            <div className="mt-6 grid gap-5 md:grid-cols-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-black/10 bg-white p-6"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-[0.15em] text-blue-600">
                        {item.platform}
                      </p>

                      <h3 className="mt-2 text-xl font-bold">
                        {item.label}
                      </h3>

                      <p className="mt-2 break-all text-sm text-black/50">
                        {item.url}
                      </p>
                    </div>

                    <span
                      className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                        item.published
                          ? "bg-green-100 text-green-700"
                          : "bg-black/10 text-black/50"
                      }`}
                    >
                      {item.published
                        ? "Visible"
                        : "Hidden"}
                    </span>
                  </div>

                  <div className="mt-5 flex items-center justify-between gap-3">
                    <span className="text-xs text-black/40">
                      Order: {item.sort_order}
                    </span>

                    <div className="flex gap-2">
                      <button
                        onClick={() =>
                          togglePublished(
                            item.id,
                            item.published
                          )
                        }
                        className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold transition hover:bg-black hover:text-white"
                      >
                        {item.published
                          ? "Hide"
                          : "Show"}
                      </button>

                      <button
                        onClick={() =>
                          startEdit(item)
                        }
                        className="rounded-lg border border-black/10 px-3 py-2 text-xs font-semibold transition hover:bg-blue-600 hover:text-white"
                      >
                        Edit
                      </button>

                      <button
                        onClick={() =>
                          deleteLink(item.id)
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