
import { supabase } from "@/src/lib/supabase";

type Resource = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  file_url: string | null;
  thumbnail_url: string | null;
};

export default async function ResourcesPage() {
  const { data: resources, error } = await supabase
    .from("resources")
    .select(
      "id, title, slug, description, category, file_url, thumbnail_url"
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen p-10">
        <h1 className="text-3xl font-bold">
          Resources
        </h1>

        <p className="mt-4 text-red-600">
          Unable to load resources.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f8f6] px-6 py-16">
      <div className="mx-auto max-w-6xl">

        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Learning Resources
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Resources for your career journey
          </h1>

          <p className="mt-5 text-lg leading-8 text-black/60">
            Explore guides, documents and useful resources
            designed to help you learn and grow.
          </p>
        </div>

        {resources && resources.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {resources.map((resource) => {
              const pdfUrl = resource.file_url
                ? resource.file_url.startsWith("http")
                  ? resource.file_url
                  : supabase.storage
                      .from("documents")
                      .getPublicUrl(resource.file_url).data.publicUrl
                : null;

              const thumbnailUrl = resource.thumbnail_url
                ? resource.thumbnail_url.startsWith("http")
                  ? resource.thumbnail_url
                  : supabase.storage
                      .from("thumbnails")
                      .getPublicUrl(resource.thumbnail_url).data.publicUrl
                : null;

              return (
                <article
                  key={resource.id}
                  className="group overflow-hidden rounded-2xl border bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >

                  {thumbnailUrl ? (
                    <img
                      src={thumbnailUrl}
                      alt={resource.title}
                      className="h-52 w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                    />
                  ) : (
                    <div className="flex h-52 items-center justify-center bg-black/5">
                      <span className="text-5xl">📄</span>
                    </div>
                  )}

                  <div className="p-6">

                    {resource.category && (
                      <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                        {resource.category}
                      </span>
                    )}

                    <h2 className="mt-4 text-xl font-bold">
                      {resource.title}
                    </h2>

                    {resource.description && (
                      <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/60">
                        {resource.description}
                      </p>
                    )}

                    {pdfUrl && (
                      <a
                        href={pdfUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-6 inline-flex w-full items-center justify-center rounded-xl bg-black px-5 py-3 text-sm font-semibold text-white transition hover:bg-black/80"
                      >
                        View PDF →
                      </a>
                    )}

                  </div>
                </article>
              );
            })}

          </div>
        ) : (
          <div className="mt-12 rounded-2xl border bg-white p-10 text-center">
            <div className="text-5xl">📚</div>

            <h2 className="mt-4 text-xl font-bold">
              No resources available yet
            </h2>

            <p className="mt-2 text-black/50">
              New resources will appear here soon.
            </p>
          </div>
        )}

      </div>
    </main>
  );
}
