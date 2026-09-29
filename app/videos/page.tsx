import { supabase } from "@/src/lib/supabase";

type Video = {
  id: number;
  title: string;
  slug: string;
  description: string | null;
  category: string | null;
  video_url: string | null;
  thumbnail_url: string | null;
};

function getYouTubeEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("youtube.com")) {
      const videoId = parsed.searchParams.get("v");

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }

      if (parsed.pathname.startsWith("/shorts/")) {
        const videoId = parsed.pathname.split("/shorts/")[1]?.split("/")[0];

        if (videoId) {
          return `https://www.youtube.com/embed/${videoId}`;
        }
      }

      if (parsed.pathname.startsWith("/embed/")) {
        return url;
      }
    }

    if (parsed.hostname === "youtu.be") {
      const videoId = parsed.pathname.replace("/", "").split("/")[0];

      if (videoId) {
        return `https://www.youtube.com/embed/${videoId}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function getVimeoEmbedUrl(url: string) {
  try {
    const parsed = new URL(url);

    if (parsed.hostname.includes("vimeo.com")) {
      const parts = parsed.pathname.split("/").filter(Boolean);
      const videoId = parts[parts.length - 1];

      if (videoId && /^\d+$/.test(videoId)) {
        return `https://player.vimeo.com/video/${videoId}`;
      }
    }
  } catch {
    return null;
  }

  return null;
}

function isDirectVideoUrl(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url);
}

function VideoPlayer({
  videoUrl,
  thumbnailUrl,
}: {
  videoUrl: string;
  thumbnailUrl: string | null;
}) {
  const youtubeUrl = getYouTubeEmbedUrl(videoUrl);

  if (youtubeUrl) {
    return (
      <div className="aspect-video w-full bg-black">
        <iframe
          src={youtubeUrl}
          title="YouTube video player"
          className="h-full w-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  const vimeoUrl = getVimeoEmbedUrl(videoUrl);

  if (vimeoUrl) {
    return (
      <div className="aspect-video w-full bg-black">
        <iframe
          src={vimeoUrl}
          title="Vimeo video player"
          className="h-full w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  if (isDirectVideoUrl(videoUrl)) {
    return (
      <video
        src={videoUrl}
        controls
        poster={thumbnailUrl || undefined}
        className="aspect-video w-full bg-black object-cover"
      />
    );
  }

  return (
    <video
      src={videoUrl}
      controls
      poster={thumbnailUrl || undefined}
      className="aspect-video w-full bg-black object-cover"
    />
  );
}

export default async function VideosPage() {
  const { data: videos, error } = await supabase
    .from("videos")
    .select(
      "id, title, slug, description, category, video_url, thumbnail_url"
    )
    .eq("published", true)
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="min-h-screen p-10">
        <h1 className="text-3xl font-bold">
          Videos
        </h1>

        <p className="mt-4 text-red-600">
          Unable to load videos.
        </p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f8f8f6] px-6 py-16">
      <div className="mx-auto max-w-6xl">

        {/* HEADER */}

        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-blue-600">
            Career Videos
          </p>

          <h1 className="mt-3 text-4xl font-bold tracking-tight md:text-5xl">
            Learn through video
          </h1>

          <p className="mt-5 text-lg leading-8 text-black/60">
            Watch practical videos, career guidance and useful
            insights to help you move forward.
          </p>
        </div>

        {/* VIDEOS */}

        {videos && videos.length > 0 ? (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">

            {videos.map((video) => (
              <article
                key={video.id}
                className="overflow-hidden rounded-2xl border bg-white shadow-sm"
              >

                {/* VIDEO */}

                {video.video_url ? (
                  <VideoPlayer
                    videoUrl={video.video_url}
                    thumbnailUrl={video.thumbnail_url}
                  />
                ) : (
                  <div className="flex aspect-video items-center justify-center bg-black text-5xl">
                    🎥
                  </div>
                )}

                {/* CONTENT */}

                <div className="p-6">

                  {/* CATEGORY */}

                  {video.category && (
                    <span className="inline-block rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                      {video.category}
                    </span>
                  )}

                  {/* TITLE */}

                  <h2 className="mt-4 text-xl font-bold">
                    {video.title}
                  </h2>

                  {/* DESCRIPTION */}

                  {video.description && (
                    <p className="mt-3 line-clamp-3 text-sm leading-6 text-black/60">
                      {video.description}
                    </p>
                  )}

                </div>
              </article>
            ))}

          </div>
        ) : (
          <div className="mt-12 rounded-2xl border bg-white p-10 text-center">

            <div className="text-5xl">
              🎥
            </div>

            <h2 className="mt-4 text-xl font-bold">
              No videos available yet
            </h2>

            <p className="mt-2 text-black/50">
              New videos will appear here soon.
            </p>

          </div>
        )}

      </div>
    </main>
  );
}