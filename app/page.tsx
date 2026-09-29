import { createSupabaseServerClient } from "@/src/lib/supabase-server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HomePage() {
  const supabase = await createSupabaseServerClient();

  // Fetch homepage career cards
  const { data: cards, error: cardsError } = await supabase
    .from("career_cards")
    .select(
      "id, category, title, description, image_url, wikipedia_url, youtube_url, useful_link, resource_url, button_text"
    )
    .eq("published", true)
    .order("id", { ascending: true });

  // Fetch latest published daily inspiration
  const { data: inspiration, error: inspirationError } =
    await supabase
      .from("daily_inspiration")
      .select("id, image_url")
      .eq("published", true)
      .order("id", { ascending: false })
      .limit(1)
      .maybeSingle();

  // Fetch visible contact links
  const { data: contactLinks, error: contactError } =
    await supabase
      .from("contact_links")
      .select(
        "id, platform, label, url, published, sort_order"
      )
      .eq("published", true)
      .order("sort_order", { ascending: true })
      .order("id", { ascending: true });

  if (cardsError) {
    console.error("Career cards error:", cardsError);
  }

  if (inspirationError) {
    console.error(
      "Daily inspiration error:",
      inspirationError
    );
  }

  if (contactError) {
    console.error(
      "Contact links error:",
      contactError
    );
  }

  function getPlatformIcon(platform: string) {
    switch (platform.toLowerCase()) {
      case "instagram":
        return "◎";

      case "youtube":
        return "▶";

      case "facebook":
        return "f";

      case "linkedin":
        return "in";

      case "twitter":
        return "𝕏";

      case "email":
        return "✉";

      case "website":
        return "🌐";

      case "telegram":
        return "➤";

      case "whatsapp":
        return "◉";

      default:
        return "↗";
    }
  }

  return (
    <main className="min-h-screen bg-[#f8f8f6] text-[#111]">

      {/* ================================================== */}
      {/* HERO */}
      {/* ================================================== */}

      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">
          Knowledge • Experience • Growth
        </p>

        <h1 className="mt-4 max-w-4xl text-5xl font-bold tracking-tight md:text-7xl">
          Ideas that help you
          <br />
          <span className="text-blue-600">
            move forward.
          </span>
        </h1>

        <p className="mt-7 max-w-2xl text-lg leading-8 text-black/55">
          Explore career advice, education, skills, jobs and
          practical resources from the creator.
        </p>
      </section>

      {/* ================================================== */}
      {/* CAREER CARDS */}
      {/* ================================================== */}

      <section className="border-t border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">

          <div className="mb-10">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-blue-600">
              Explore
            </p>

            <h2 className="mt-3 text-3xl font-bold tracking-tight md:text-4xl">
              Career & Growth
            </h2>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-black/50">
              Explore practical ideas, career paths, skills and
              resources to help you move forward.
            </p>
          </div>

          {cards && cards.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

              {cards.map((card, index) => (
                <article
                  key={card.id}
                  className="group overflow-hidden rounded-3xl border border-black/10 bg-[#f8f8f6] transition duration-300 hover:-translate-y-1 hover:shadow-xl"
                >

                  {/* CARD IMAGE */}

                  {card.image_url ? (
                    <img
                      src={card.image_url}
                      alt={card.title}
                      className="h-56 w-full object-cover"
                    />
                  ) : (
                    <div
                      className={`h-56 ${
                        index % 3 === 0
                          ? "bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-600"
                          : index % 3 === 1
                            ? "bg-gradient-to-br from-orange-400 via-red-500 to-pink-600"
                            : "bg-gradient-to-br from-emerald-400 via-cyan-500 to-blue-500"
                      }`}
                    />
                  )}

                  <div className="p-6">

                    {/* CATEGORY */}

                    <p className="text-xs font-bold uppercase tracking-wider text-blue-600">
                      {card.category || "Career"}
                    </p>

                    {/* TITLE */}

                    <h2 className="mt-3 text-xl font-bold leading-snug">
                      {card.title}
                    </h2>

                    {/* DESCRIPTION */}

                    <p className="mt-3 text-sm leading-6 text-black/50">
                      {card.description}
                    </p>

                    {/* EXTRA LINKS */}

                    <div className="mt-6 flex flex-wrap gap-2">

                      {card.wikipedia_url && (
                        <a
                          href={card.wikipedia_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold transition hover:bg-black hover:text-white"
                        >
                          Wikipedia
                        </a>
                      )}

                      {card.youtube_url && (
                        <a
                          href={card.youtube_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold transition hover:bg-red-600 hover:text-white"
                        >
                          YouTube
                        </a>
                      )}

                      {card.useful_link && (
                        <a
                          href={card.useful_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold transition hover:bg-blue-600 hover:text-white"
                        >
                          Useful Link
                        </a>
                      )}

                      {card.resource_url && (
                        <a
                          href={card.resource_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="rounded-lg border border-black/10 bg-white px-3 py-2 text-xs font-semibold transition hover:bg-green-600 hover:text-white"
                        >
                          Resource
                        </a>
                      )}

                    </div>

                    {/* MAIN BUTTON */}

                    <div className="mt-5">

                      {card.useful_link ||
                      card.wikipedia_url ||
                      card.youtube_url ||
                      card.resource_url ? (
                        <a
                          href={
                            card.useful_link ||
                            card.wikipedia_url ||
                            card.youtube_url ||
                            card.resource_url ||
                            "#"
                          }
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm font-semibold"
                        >
                          {card.button_text || "Explore"} →
                        </a>
                      ) : (
                        <span className="text-sm font-semibold text-black/40">
                          {card.button_text || "Explore"} →
                        </span>
                      )}

                    </div>

                  </div>
                </article>
              ))}

            </div>
          ) : (
            <div className="rounded-3xl border border-dashed border-black/20 p-10 text-center">
              <p className="font-semibold">
                No career cards are currently available.
              </p>
            </div>
          )}

        </div>
      </section>

      {/* ================================================== */}
      {/* DAILY INSPIRATION */}
      {/* ================================================== */}

      {inspiration && (
        <section className="border-t border-black/10 bg-[#f8f8f6] px-6 py-20 md:py-28">

          <div className="mx-auto max-w-5xl">

            <div className="mx-auto max-w-2xl text-center">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-600">
                Daily Inspiration
              </p>

              <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                A little something
                <br />
                <span className="text-blue-600">
                  for today.
                </span>
              </h2>

              <p className="mt-5 text-base leading-7 text-black/50">
                Take a moment, get inspired and keep moving
                forward.
              </p>

            </div>

            <div className="mt-12 overflow-hidden rounded-[2rem] border border-black/10 bg-white p-3 shadow-[0_20px_60px_rgba(0,0,0,0.08)] md:p-5">

              <div className="overflow-hidden rounded-[1.5rem] bg-black/5">

                <img
                  src={inspiration.image_url}
                  alt="Daily inspiration"
                  className="mx-auto max-h-[700px] w-full object-contain"
                />

              </div>

            </div>

            <p className="mt-6 text-center text-xs font-medium uppercase tracking-[0.18em] text-black/35">
              Come back tomorrow for a new thought
            </p>

          </div>

        </section>
      )}

      {/* ================================================== */}
      {/* CONTACT US */}
      {/* ================================================== */}

      {contactLinks && contactLinks.length > 0 && (
        <section className="border-t border-black/10 bg-[#111] px-6 py-20 text-white md:py-24">

          <div className="mx-auto max-w-7xl">

            <div className="mx-auto max-w-2xl text-center">

              <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
                Stay Connected
              </p>

              <h2 className="mt-4 text-4xl font-bold tracking-tight md:text-5xl">
                Let&apos;s stay
                <br />
                <span className="text-blue-400">
                  connected.
                </span>
              </h2>

              <p className="mt-5 text-base leading-7 text-white/50">
                Follow, connect or reach out through any of
                the platforms below.
              </p>

            </div>

            <div className="mx-auto mt-12 flex max-w-4xl flex-wrap justify-center gap-4">

              {contactLinks.map((link) => (
                <a
                  key={link.id}
                  href={link.url}
                  target={
                    link.platform === "email"
                      ? undefined
                      : "_blank"
                  }
                  rel={
                    link.platform === "email"
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="group flex min-w-[150px] items-center justify-center gap-3 rounded-2xl border border-white/10 bg-white/5 px-5 py-4 transition duration-300 hover:-translate-y-1 hover:border-blue-400/40 hover:bg-white/10 hover:shadow-[0_10px_40px_rgba(37,99,235,0.15)]"
                >

                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10 text-lg font-bold transition group-hover:bg-blue-600">
                    {getPlatformIcon(link.platform)}
                  </span>

                  <span className="text-sm font-semibold">
                    {link.label}
                  </span>

                </a>
              ))}

            </div>

            <div className="mt-14 border-t border-white/10 pt-8 text-center">

              <p className="text-xs uppercase tracking-[0.15em] text-white/30">
                Built with knowledge • experience • growth
              </p>

            </div>

          </div>

        </section>
      )}

    </main>
  );
}