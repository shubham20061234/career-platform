"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { supabase } from "@/src/lib/supabase";

type CareerCard = {
  id: number;
  category: string | null;
  title: string;
  description: string | null;
  image_url: string | null;
  wikipedia_url: string | null;
  youtube_url: string | null;
  useful_link: string | null;
  resource_url: string | null;
  button_text: string | null;
};

type Blog = {
  id: number;
  title: string;
  slug: string | null;
  description: string | null;
  category: string | null;
  cover_image_url: string | null;
  created_at: string;
};

type ContactLink = {
  id: number;
  platform: string;
  label: string;
  url: string;
  published: boolean;
  sort_order: number;
};

type Props = {
  cards: CareerCard[];
  blogs: Blog[];
  contactLinks: ContactLink[];
};

export default function HomepageClient({
  cards,
  blogs,
  contactLinks,
}: Props) {
  const [activeSection, setActiveSection] = useState("home");
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  // Start with server-provided blogs.
  // If the server returns none, we fetch published blogs directly
  // so the homepage still updates reliably.
  const [blogFeed, setBlogFeed] = useState<Blog[]>(blogs);

  useEffect(() => {
    if (blogs.length > 0) {
      setBlogFeed(blogs);
      return;
    }

    let cancelled = false;

    const loadBlogs = async () => {
      const { data, error } = await supabase
        .from("blogs")
        .select("*")
        .eq("published", true)
        .order("created_at", { ascending: false })
        .limit(3);

      if (error) {
        console.error("Homepage blog fallback error:", error);
        return;
      }

      if (!cancelled) {
        setBlogFeed(data || []);
      }
    };

    loadBlogs();

    return () => {
      cancelled = true;
    };
  }, [blogs]);

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMouse({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  useEffect(() => {
    const sections = document.querySelectorAll("section[id]");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: "-35% 0px -55% 0px",
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({
      behavior: "smooth",
    });
  };

  const getIcon = (platform: string) => {
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
        return "↗";
      case "telegram":
        return "➤";
      case "whatsapp":
        return "◉";
      default:
        return "↗";
    }
  };

  return (
    <main className="min-h-screen overflow-hidden bg-[#f5f5f2] text-[#111]">
      {/* =====================================================
          FLOATING NAV
      ===================================================== */}

      <div className="pointer-events-none fixed left-1/2 top-[76px] z-50 hidden -translate-x-1/2 md:block">
        <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-black/10 bg-white/75 p-1.5 shadow-[0_15px_50px_rgba(0,0,0,0.10)] backdrop-blur-xl">
          {[
            ["home", "Home"],
            ["career", "Explore"],
            ["blogs", "Blogs"],
            ["contact", "Connect"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => scrollTo(id)}
              className={`relative rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 ${
                activeSection === id
                  ? "bg-black text-white shadow-lg"
                  : "text-black/50 hover:bg-black/5 hover:text-black"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* =====================================================
          HERO
      ===================================================== */}

      <section
        id="home"
        className="relative flex min-h-[calc(100vh-64px)] items-center overflow-hidden border-b border-black/10"
      >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              "linear-gradient(#111 1px, transparent 1px), linear-gradient(90deg, #111 1px, transparent 1px)",
            backgroundSize: "70px 70px",
          }}
        />

        <div
          className="pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-blue-500/15 blur-[110px] transition-transform duration-700"
          style={{
            left: `calc(50% + ${
              (mouse.x - window.innerWidth / 2) * 0.04
            }px)`,
            top: `calc(40% + ${
              (mouse.y - window.innerHeight / 2) * 0.04
            }px)`,
          }}
        />

        <div
          className="pointer-events-none absolute h-[350px] w-[350px] rounded-full bg-violet-500/10 blur-[100px]"
          style={{
            right: "-100px",
            bottom: "5%",
          }}
        />

        <div className="relative mx-auto w-full max-w-7xl px-6 py-28 md:py-36">
          <div className="max-w-6xl">
            <div className="hero-fade flex items-center gap-3">
              <span className="h-px w-10 bg-blue-600" />

              <span className="text-xs font-bold uppercase tracking-[0.28em] text-blue-600">
                Knowledge • Experience • Growth
              </span>
            </div>

            <h1 className="hero-fade hero-delay-1 mt-8 max-w-5xl text-[clamp(3.8rem,9vw,8.5rem)] font-semibold leading-[0.88] tracking-[-0.075em]">
              Build a career
              <br />
              <span className="relative">
                that moves
                <span className="relative ml-3 inline-block text-blue-600">
                  you.
                  <span className="absolute -bottom-1 left-0 h-1 w-full bg-blue-600/20 md:-bottom-3 md:h-2" />
                </span>
              </span>
            </h1>

            <div className="hero-fade hero-delay-2 mt-10 flex max-w-3xl flex-col justify-between gap-8 md:flex-row md:items-end">
              <p className="max-w-xl text-base leading-7 text-black/50 md:text-lg md:leading-8">
                Practical ideas, career guidance and useful resources designed
                to help you make better decisions and keep moving forward.
              </p>

              <button
                onClick={() => scrollTo("career")}
                className="group flex w-fit items-center gap-4 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-black hover:shadow-xl"
              >
                Explore

                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-black text-white transition-all duration-300 group-hover:translate-x-1 group-hover:bg-blue-600">
                  →
                </span>
              </button>
            </div>
          </div>

          <div className="hero-fade hero-delay-3 absolute bottom-8 left-6 right-6 hidden items-center justify-between text-[10px] font-bold uppercase tracking-[0.2em] text-black/25 md:flex">
            <span>Career Platform</span>
            <span>Scroll to explore ↓</span>
          </div>
        </div>
      </section>

      {/* =====================================================
          CAREER / EXPLORE
      ===================================================== */}

      <section
        id="career"
        className="relative overflow-hidden border-b border-black/10 bg-[#f5f5f2]"
      >
        <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
          <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                  01 / Explore
                </span>

                <span className="h-px w-16 bg-blue-600/30" />
              </div>

              <h2 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] md:text-7xl">
                Find your
                <br />
                <span className="text-black/20">next direction.</span>
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-6 text-black/45">
              Explore education, skills, work and personal growth.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {cards.map((card, index) => (
              <CareerCardItem
                key={card.id}
                card={card}
                index={index}
              />
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
          BLOGS
      ===================================================== */}

      <section
        id="blogs"
        className="relative overflow-hidden border-b border-black/10 bg-[#111]"
      >
        {/* Background */}
        <div className="absolute inset-0">
          <div className="absolute left-[10%] top-[20%] h-72 w-72 rounded-full bg-blue-600/10 blur-[100px]" />

          <div className="absolute bottom-[10%] right-[10%] h-80 w-80 rounded-full bg-purple-600/10 blur-[110px]" />

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
              backgroundSize: "60px 60px",
            }}
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6 py-24 md:py-32">
          {/* HEADER */}
          <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
            <div>
              <div className="mb-5 flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-400">
                  02 / Blogs
                </span>

                <span className="h-px w-16 bg-blue-400/30" />
              </div>

              <h2 className="text-5xl font-semibold tracking-[-0.05em] text-white md:text-7xl">
                Ideas worth
                <br />
                <span className="text-white/25">
                  coming back to.
                </span>
              </h2>
            </div>

            <p className="max-w-sm text-sm leading-6 text-white/40">
              Thoughts, lessons and practical ideas about education, careers,
              skills and personal growth.
            </p>
          </div>

          {/* BLOG FEED */}
          {blogFeed.length === 0 ? (
            <div className="mx-auto max-w-3xl rounded-[2rem] border border-white/10 bg-white/[0.04] p-12 text-center backdrop-blur-xl">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-white/10 bg-white/5 text-xl text-white/50">
                ✦
              </div>

              <h3 className="mt-5 text-2xl font-semibold text-white">
                No blogs yet.
              </h3>

              <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
                Published articles will automatically appear here.
              </p>

              <Link
                href="/blogs"
                className="mt-6 inline-flex rounded-full border border-white/10 bg-white/5 px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-white hover:text-black"
              >
                Open Blogs →
              </Link>
            </div>
          ) : (
            <div className="relative mx-auto max-w-4xl">
              {/* EDITORIAL NOTE */}
              <div className="pointer-events-none absolute -left-40 top-24 hidden w-28 lg:block">
                <p className="rotate-[-6deg] text-[9px] font-bold uppercase tracking-[0.2em] text-white/25">
                  Keep learning.
                </p>

                <div className="mt-4 h-px w-20 rotate-[-12deg] bg-blue-400/30" />

                <p className="mt-3 text-[8px] font-semibold uppercase tracking-[0.18em] text-white/15">
                  read • think • grow
                </p>
              </div>

              <div className="space-y-6">
                {blogFeed.map((blog, index) => (
                  <BlogPost
                    key={blog.id}
                    blog={blog}
                    index={index}
                  />
                ))}
              </div>

              {/* FOOTER */}
              <div className="mt-10 flex items-center justify-between border-t border-white/10 pt-5 text-[9px] font-bold uppercase tracking-[0.2em] text-white/20">
                <span>
                  {blogFeed.length} latest{" "}
                  {blogFeed.length === 1 ? "article" : "articles"}
                </span>

                <Link
                  href="/blogs"
                  className="transition-colors hover:text-blue-400"
                >
                  View all blogs →
                </Link>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
          CONTACT
      ===================================================== */}

      {contactLinks.length > 0 && (
        <section
          id="contact"
          className="relative overflow-hidden bg-[#f5f5f2]"
        >
          <div className="mx-auto max-w-7xl px-6 py-24 md:py-32">
            <div className="mb-14">
              <div className="mb-5 flex items-center gap-3">
                <span className="text-xs font-bold uppercase tracking-[0.25em] text-blue-600">
                  03 / Connect
                </span>

                <span className="h-px w-16 bg-blue-600/30" />
              </div>

              <h2 className="max-w-4xl text-5xl font-semibold tracking-[-0.06em] md:text-8xl">
                Let&apos;s stay
                <br />
                <span className="text-black/20">
                  connected.
                </span>
              </h2>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {contactLinks.map((link, index) => (
                <a
                  key={link.id}
                  href={link.url}
                  target={
                    link.platform.toLowerCase() === "email"
                      ? undefined
                      : "_blank"
                  }
                  rel={
                    link.platform.toLowerCase() === "email"
                      ? undefined
                      : "noopener noreferrer"
                  }
                  className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white p-5 transition-all duration-500 hover:-translate-y-1 hover:border-black hover:shadow-[0_20px_50px_rgba(0,0,0,0.10)]"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#f1f1ee] text-lg font-bold transition-all duration-500 group-hover:rotate-3 group-hover:bg-black group-hover:text-white">
                        {getIcon(link.platform)}
                      </div>

                      <div>
                        <p className="text-sm font-bold">
                          {link.label}
                        </p>

                        <p className="mt-1 text-[10px] font-semibold uppercase tracking-wider text-black/30">
                          {link.platform}
                        </p>
                      </div>
                    </div>

                    <span className="text-xl text-black/20 transition-all duration-500 group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-blue-600">
                      ↗
                    </span>
                  </div>

                  <div className="absolute bottom-0 left-0 h-0.5 w-0 bg-blue-600 transition-all duration-500 group-hover:w-full" />

                  <span className="absolute -right-8 -top-8 h-20 w-20 rounded-full bg-blue-600/5 transition-transform duration-500 group-hover:scale-[2]" />

                  <span className="absolute right-5 top-5 text-[10px] font-bold text-black/10">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                </a>
              ))}
            </div>

            <div className="mt-20 flex flex-col justify-between gap-4 border-t border-black/10 pt-6 text-[10px] font-bold uppercase tracking-[0.2em] text-black/25 md:flex-row">
              <span>Knowledge • Experience • Growth</span>

              <span>© Career Platform</span>
            </div>
          </div>
        </section>
      )}

      {/* =====================================================
          GLOBAL STYLES
      ===================================================== */}

      <style jsx global>{`
        html {
          scroll-behavior: smooth;
        }

        @keyframes heroFade {
          from {
            opacity: 0;
            transform: translateY(25px);
          }

          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .hero-fade {
          animation: heroFade 0.9s cubic-bezier(0.22, 1, 0.36, 1) both;
        }

        .hero-delay-1 {
          animation-delay: 0.12s;
        }

        .hero-delay-2 {
          animation-delay: 0.24s;
        }

        .hero-delay-3 {
          animation-delay: 0.45s;
        }

        @media (prefers-reduced-motion: reduce) {
          html {
            scroll-behavior: auto;
          }

          *,
          *::before,
          *::after {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        @media (max-width: 767px) {
          .career-card-image {
            transform: none !important;
          }
        }
      `}</style>
    </main>
  );
}

/* =========================================================
   BLOG POST
   GitHub-profile/feed inspired layout
========================================================= */

function BlogPost({
  blog,
  index,
}: {
  blog: Blog;
  index: number;
}) {
  const cardRef = useRef<HTMLAnchorElement | null>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const glowRef = useRef<HTMLDivElement | null>(null);

  const [hovered, setHovered] = useState(false);

  const formattedDate = new Date(blog.created_at).toLocaleDateString(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    }
  );

  const movePost = (
    event: React.MouseEvent<HTMLAnchorElement>
  ) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const normalizedX = (x / rect.width - 0.5) * 2;
    const normalizedY = (y / rect.height - 0.5) * 2;

    element.style.transform = `
      perspective(1400px)
      rotateX(${normalizedY * -0.8}deg)
      rotateY(${normalizedX * 0.8}deg)
      translateY(-4px)
    `;

    if (imageRef.current) {
      imageRef.current.style.transform = `
        scale(1.025)
        translate3d(${normalizedX * 5}px, ${normalizedY * 5}px, 0)
      `;
    }

    if (glowRef.current) {
      glowRef.current.style.left = `${(x / rect.width) * 100}%`;
      glowRef.current.style.top = `${(y / rect.height) * 100}%`;
      glowRef.current.style.opacity = "1";
    }
  };

  const resetPost = () => {
    if (cardRef.current) {
      cardRef.current.style.transform = "";
    }

    if (imageRef.current) {
      imageRef.current.style.transform = "scale(1)";
    }

    if (glowRef.current) {
      glowRef.current.style.opacity = "0";
    }
  };

  return (
    <Link
      ref={cardRef}
      href={blog.slug ? `/blogs/${blog.slug}` : "/blogs"}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => {
        setHovered(false);
        resetPost();
      }}
      onMouseMove={movePost}
      className="group relative block overflow-hidden rounded-[2rem] border border-white/10 bg-[#171717] shadow-[0_25px_80px_rgba(0,0,0,0.25)] transition-all duration-500 will-change-transform"
    >
      {/* Cursor glow */}
      <div
        ref={glowRef}
        className="pointer-events-none absolute z-0 h-56 w-56 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-500/10 opacity-0 blur-3xl transition-opacity duration-300"
      />

      <div className="relative z-10">
        {/* PROFILE / HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 px-5 py-5 md:px-7">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-white/10 bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white">
              {blog.cover_image_url ? (
                <img
                  src={blog.cover_image_url}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                "CP"
              )}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-white">
                  Career Platform
                </span>

                <span className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-500 text-[9px] font-bold text-white">
                  ✓
                </span>
              </div>

              <p className="text-[11px] text-white/35">
                @careerplatform
              </p>
            </div>
          </div>

          <div className="text-right">
            <p className="text-[10px] font-medium text-white/25">
              {formattedDate}
            </p>

            <p className="mt-1 text-[9px] font-bold uppercase tracking-[0.15em] text-white/15">
              #{String(index + 1).padStart(2, "0")}
            </p>
          </div>
        </div>

        {/* CONTENT */}
        <div className="px-5 py-6 md:px-7 md:py-7">
          <div className="flex items-center gap-3">
            <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.16em] text-blue-400">
              {blog.category || "Career"}
            </span>

            <span className="text-[9px] font-semibold uppercase tracking-[0.15em] text-white/20">
              Article
            </span>
          </div>

          <h3 className="mt-5 max-w-3xl text-2xl font-semibold leading-tight tracking-[-0.04em] text-white transition-colors duration-300 group-hover:text-blue-100 md:text-4xl">
            {blog.title}
          </h3>

          {blog.description && (
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/45 md:text-[15px]">
              {blog.description}
            </p>
          )}

          {/* IMAGE */}
          {blog.cover_image_url && (
            <div className="relative mt-7 overflow-hidden rounded-2xl border border-white/10 bg-black">
              <img
                ref={imageRef}
                src={blog.cover_image_url}
                alt={blog.title}
                className="max-h-[430px] w-full object-cover transition-transform duration-700 ease-out"
              />

              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

              <div className="pointer-events-none absolute left-4 top-4 h-7 w-7 border-l border-t border-white/20" />

              <div className="pointer-events-none absolute bottom-4 right-4 h-7 w-7 border-b border-r border-white/20" />
            </div>
          )}

          {/* FOOTER */}
          <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
            <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-[0.15em] text-white/25">
              <span>Knowledge</span>
              <span className="text-white/10">•</span>
              <span>Growth</span>
            </div>

            <span
              className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.16em] text-blue-400 transition-all duration-300 ${
                hovered ? "translate-x-1" : ""
              }`}
            >
              Read article
              <span className="text-sm">→</span>
            </span>
          </div>
        </div>
      </div>

      {/* Accent */}
      <div
        className={`absolute bottom-0 left-0 h-0.5 bg-blue-500 transition-all duration-700 ${
          hovered ? "w-full" : "w-0"
        }`}
      />
    </Link>
  );
}

/* =========================================================
   CAREER CARD
========================================================= */

function CareerCardItem({
  card,
  index,
}: {
  card: CareerCard;
  index: number;
}) {
  const [hovered, setHovered] = useState(false);

  const imageRef = useRef<HTMLImageElement | null>(null);
  const graphicGlowRef = useRef<HTMLDivElement | null>(null);

  const localImages = [
    "/career.jpeg",
    "/career-advice.jpeg",
    "/education.jpeg",
    "/skills.jpeg",
    "/jobs.jpeg",
    "/personal-growth.jpeg",
  ];

  const localImage = localImages[index % localImages.length];

  const primaryLink =
    card.useful_link ||
    card.wikipedia_url ||
    card.youtube_url ||
    card.resource_url;

  const moveCard = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    const element = event.currentTarget;
    const rect = element.getBoundingClientRect();

    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    const normalizedX = (x / rect.width - 0.5) * 2;
    const normalizedY = (y / rect.height - 0.5) * 2;

    element.style.transform = `
      perspective(1200px)
      rotateX(${normalizedY * -2}deg)
      rotateY(${normalizedX * 2}deg)
      translateY(-6px)
    `;

    if (imageRef.current) {
      imageRef.current.style.transform = `
        scale(1.09)
        translate3d(${normalizedX * 12}px, ${normalizedY * 10}px, 0)
      `;
    }

    if (graphicGlowRef.current) {
      graphicGlowRef.current.style.left = `${(x / rect.width) * 100}%`;
      graphicGlowRef.current.style.top = `${(y / rect.height) * 100}%`;
      graphicGlowRef.current.style.opacity = "1";
    }
  };

  const resetCard = (
    event: React.MouseEvent<HTMLDivElement>
  ) => {
    event.currentTarget.style.transform = "";

    if (imageRef.current) {
      imageRef.current.style.transform = "scale(1)";
    }

    if (graphicGlowRef.current) {
      graphicGlowRef.current.style.opacity = "0";
    }
  };

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={(event) => {
        setHovered(false);
        resetCard(event);
      }}
      onMouseMove={moveCard}
      className="group relative min-h-[430px] overflow-hidden rounded-[1.6rem] border border-black/10 bg-[#f2f2ef] transition-all duration-500 will-change-transform md:min-h-[440px]"
    >
      <div className="absolute inset-0 overflow-hidden">
        <img
          ref={imageRef}
          src={localImage}
          alt={card.title}
          className="career-card-image h-full w-full object-cover transition-transform duration-700 ease-out will-change-transform"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent opacity-75 transition duration-500 group-hover:opacity-90" />

        <div
          ref={graphicGlowRef}
          className="pointer-events-none absolute h-40 w-40 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/20 opacity-0 blur-3xl transition-opacity duration-300"
        />

        <div
          className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-20"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.25) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.25) 1px, transparent 1px)",
            backgroundSize: "38px 38px",
          }}
        />

        <div
          className={`pointer-events-none absolute left-0 top-1/2 h-px bg-white/60 transition-all duration-700 ${
            hovered ? "w-full" : "w-0"
          }`}
        />
      </div>

      <div className="absolute left-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/20 text-[11px] font-bold text-white backdrop-blur-md">
        {String(index + 1).padStart(2, "0")}
      </div>

      <div className="absolute right-5 top-5 rounded-full border border-white/20 bg-black/20 px-3 py-1.5 text-[9px] font-bold uppercase tracking-[0.18em] text-white backdrop-blur-md">
        {card.category || "Career"}
      </div>

      <div className="absolute inset-x-0 bottom-0 p-5 md:p-6">
        <div
          className={`transition-all duration-500 ${
            hovered ? "translate-y-[-6px]" : "translate-y-0"
          }`}
        >
          <h3 className="max-w-sm text-xl font-semibold leading-tight tracking-[-0.03em] text-white drop-shadow-[0_0_3px_rgba(0,0,0,0.8)] md:text-2xl">
            {card.title}
          </h3>

          <p
            className={`mt-3 max-w-md text-xs leading-5 text-white transition-all duration-500 ${
              hovered
                ? "max-h-24 opacity-100"
                : "max-h-0 overflow-hidden opacity-0"
            }`}
          >
            {card.description}
          </p>

          <div
            className={`mt-4 flex flex-wrap gap-2 transition-all duration-500 ${
              hovered
                ? "translate-y-0 opacity-100"
                : "translate-y-3 opacity-0"
            }`}
          >
            {card.wikipedia_url && (
              <a
                href={card.wikipedia_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-black"
              >
                Wikipedia
              </a>
            )}

            {card.youtube_url && (
              <a
                href={card.youtube_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-black"
              >
                YouTube
              </a>
            )}

            {card.useful_link && (
              <a
                href={card.useful_link}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-black"
              >
                Useful
              </a>
            )}

            {card.resource_url && (
              <a
                href={card.resource_url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="rounded-full border border-white/15 bg-black/20 px-3 py-1.5 text-[10px] font-semibold text-white backdrop-blur-md transition hover:bg-white hover:text-black"
              >
                Resource
              </a>
            )}
          </div>

          {primaryLink && (
            <a
              href={primaryLink}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="mt-5 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.15em] text-white drop-shadow-[0_0_3px_rgba(0,0,0,0.8)] transition-all duration-300 hover:text-white/70"
            >
              {card.button_text || "Explore"}

              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-black text-white shadow-[0_0_8px_rgba(255,255,255,0.18)] transition-all duration-300 group-hover:translate-x-1">
                →
              </span>
            </a>
          )}
        </div>
      </div>

      <div
        className={`absolute bottom-0 left-0 h-1 bg-blue-500 transition-all duration-700 ${
          hovered ? "w-full" : "w-0"
        }`}
      />
    </div>
  );
}