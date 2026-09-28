export default function Home() {
  return (
    <main className="min-h-screen bg-[#f7f7f5] text-[#111]">

      {/* Navbar */}
      <nav className="border-b border-black/10 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5">
          <div className="text-xl font-bold tracking-tight">
            Career<span className="text-blue-600">Unfiltered</span>
          </div>

          <div className="hidden gap-8 text-sm font-medium md:flex">
            <a href="#" className="hover:text-blue-600">Home</a>
            <a href="#" className="hover:text-blue-600">Vlogs</a>
            <a href="#" className="hover:text-blue-600">Career</a>
            <a href="#" className="hover:text-blue-600">Resources</a>
          </div>

          <button className="rounded-full bg-black px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-600">
            Login
          </button>
        </div>
      </nav>

      {/* Hero */}
      <section className="mx-auto max-w-7xl px-6 py-20 md:py-28">
        <div className="max-w-4xl">
          <p className="mb-5 text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Career • Skills • Real Talk
          </p>

          <h1 className="text-5xl font-bold leading-tight tracking-tight md:text-7xl">
            Your career journey,
            <br />
            <span className="text-blue-600">without the filter.</span>
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-black/60">
            Practical career guidance, real experiences, useful resources
            and conversations that help you make better career decisions.
          </p>

          <div className="mt-9 flex flex-wrap gap-4">
            <button className="rounded-full bg-black px-7 py-3.5 font-medium text-white hover:bg-blue-600">
              Explore Vlogs
            </button>

            <button className="rounded-full border border-black/15 bg-white px-7 py-3.5 font-medium hover:bg-black hover:text-white">
              Explore Resources
            </button>
          </div>
        </div>
      </section>

      {/* Featured Content */}
      <section className="mx-auto max-w-7xl px-6 pb-20">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm font-semibold text-blue-600">
              FEATURED
            </p>
            <h2 className="mt-2 text-3xl font-bold">
              Latest from the creator
            </h2>
          </div>

          <button className="hidden text-sm font-medium md:block">
            View all →
          </button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">

          {/* Card 1 */}
          <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="h-56 bg-gradient-to-br from-blue-500 to-purple-600" />

            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Career
              </p>

              <h3 className="mt-3 text-xl font-bold">
                How to build a career that actually fits you
              </h3>

              <p className="mt-3 text-sm leading-6 text-black/55">
                Practical thoughts and experiences to help you think
                differently about your career.
              </p>

              <button className="mt-5 text-sm font-semibold">
                Read more →
              </button>
            </div>
          </article>

          {/* Card 2 */}
          <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="h-56 bg-gradient-to-br from-orange-400 to-red-500" />

            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
                Vlog
              </p>

              <h3 className="mt-3 text-xl font-bold">
                Things nobody tells you about starting your career
              </h3>

              <p className="mt-3 text-sm leading-6 text-black/55">
                Honest conversations, experiences and lessons from the
                real world.
              </p>

              <button className="mt-5 text-sm font-semibold">
                Watch vlog →
              </button>
            </div>
          </article>

          {/* Card 3 */}
          <article className="overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
            <div className="h-56 bg-gradient-to-br from-emerald-400 to-cyan-500" />

            <div className="p-6">
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-600">
                Resources
              </p>

              <h3 className="mt-3 text-xl font-bold">
                Useful resources for your next career move
              </h3>

              <p className="mt-3 text-sm leading-6 text-black/55">
                Curated resources, tools and information worth knowing.
              </p>

              <button className="mt-5 text-sm font-semibold">
                Explore →
              </button>
            </div>
          </article>

        </div>
      </section>

      {/* Categories */}
      <section className="border-y border-black/10 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <p className="text-sm font-semibold text-blue-600">
            EXPLORE
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Find what you need
          </h2>

          <div className="mt-8 flex flex-wrap gap-3">
            {[
              "Career",
              "Education",
              "Skills",
              "Business",
              "Finance",
              "Jobs",
              "Internships",
              "Personal Growth",
            ].map((category) => (
              <button
                key={category}
                className="rounded-full border border-black/10 px-5 py-3 text-sm font-medium hover:bg-black hover:text-white"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black px-6 py-10 text-white">
        <div className="mx-auto flex max-w-7xl flex-col justify-between gap-5 md:flex-row">
          <div>
            <p className="text-lg font-bold">CareerUnfiltered</p>
            <p className="mt-2 text-sm text-white/50">
              Career guidance without the filter.
            </p>
          </div>

          <p className="text-sm text-white/40">
            © 2026 CareerUnfiltered
          </p>
        </div>
      </footer>

    </main>
  );
}