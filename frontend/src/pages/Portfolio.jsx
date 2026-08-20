import { cms } from "../api/cmsClient";
import { useFetch } from "../hooks/useFetch";
import { PageHeader, LoadingBlock, ErrorBlock, Badge } from "../components/ui";
import Reveal from "../components/Reveal";

export default function Portfolio() {
  const { data: projects, error, loading } = useFetch(cms.getPortfolio, []);

  return (
    <div>
      <PageHeader
        eyebrow="Portfolio"
        title="Work we're proud of"
        description="A sample of projects we've shipped for clients. The ones we can talk about, anyway."
      />

      <section className="mx-auto max-w-6xl px-5 py-16">
        {loading && <LoadingBlock label="Loading portfolio…" />}
        {error && <ErrorBlock message="We couldn't load the portfolio right now. Please refresh." />}

        {projects && projects.length === 0 && (
          <p className="text-fog-600">Case studies coming soon.</p>
        )}

        {projects && projects.length > 0 && (
          <div className="grid gap-6 sm:grid-cols-2">
            {projects.map((project, i) => (
              <Reveal
                key={project.id}
                direction="up"
                delay={i * 100}
                className="group relative overflow-hidden rounded-xl border border-fog-200 bg-mustard-50 transition-all duration-300 hover:-translate-y-1 hover:border-mustard-300 hover:shadow-lg"
              >
                <span className="absolute right-0 top-0 h-10 w-10 bg-mustard-500 [clip-path:polygon(100%_0,0_0,100%_100%)]" />
                <div className="mx-4 mt-4 flex h-24 items-center justify-center rounded-lg bg-ink-950 font-display text-sm font-medium text-white/70">
                  {project.client}
                </div>
                <div className="p-6">
                  <div className="flex flex-wrap gap-1.5">
                    {project.tags.map((tag) => (
                      <Badge key={tag} tone="mustard">{tag}</Badge>
                    ))}
                  </div>
                  <h2 className="mt-3 font-display text-lg font-semibold text-ink-900">{project.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-fog-600">{project.summary}</p>
                </div>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
