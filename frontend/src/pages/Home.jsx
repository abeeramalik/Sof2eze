import { useCallback } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, LayoutGrid, Smartphone, Cloud, PenTool, Sparkles } from "lucide-react";
import { cms } from "../api/cmsClient";
import { useFetch } from "../hooks/useFetch";
import { LoadingBlock, ErrorBlock, PrimaryButton, SecondaryButton } from "../components/ui";
import Reveal from "../components/Reveal";

const ICONS = { "layout-grid": LayoutGrid, smartphone: Smartphone, cloud: Cloud, "pen-tool": PenTool, sparkles: Sparkles };

export default function Home() {
  const fetchAll = useCallback(
    () =>
      Promise.all([cms.getSiteContent(), cms.getServices(), cms.getTestimonials()]).then(
        ([siteContent, services, testimonials]) => ({ siteContent, services, testimonials })
      ),
    []
  );
  const { data, error, loading } = useFetch(fetchAll, []);

  if (loading) return <LoadingBlock label="Loading the homepage…" />;
  if (error) return <ErrorBlock message="We couldn't load the homepage content. Please refresh." />;

  const { siteContent, services, testimonials } = data;

  return (
    <div>
      <section className="bg-ink-950">
        <div className="mx-auto max-w-6xl px-5 py-24 sm:py-28">
          <div className="flex items-center gap-3">
            <p className="font-display text-sm font-semibold uppercase tracking-wide text-mustard-400">
              Sof2eze
            </p>
            <span className="rule-mustard" />
          </div>
          <Reveal direction="down">
            <h1 className="mt-3 max-w-3xl font-display text-4xl font-semibold leading-tight text-white sm:text-6xl">
              {siteContent.home.heroTitle}
            </h1>
            <p className="mt-6 max-w-xl text-lg text-white/60">{siteContent.home.heroSubtitle}</p>
          </Reveal>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/contact">
              <PrimaryButton className="bg-mustard-500 text-ink-950 hover:bg-mustard-400 hover:text-ink-950">
                Start a project <ArrowRight size={16} />
              </PrimaryButton>
            </Link>
            <Link to="/services">
              <SecondaryButton className="border-ink-600 bg-mustard-500 text-ink-950 hover:border-mustard-400 hover:bg-mustard-400 hover:text-white">
                See our services
              </SecondaryButton>
            </Link>
          </div>

          <dl className="mt-16 grid grid-cols-1 gap-8 border-t border-ink-700 pt-10 sm:grid-cols-3">
            {siteContent.home.highlights.map((h, i) => (
              <Reveal key={h.label} direction="up" delay={i * 100}>
                <dt className="text-sm text-white/40">{h.label}</dt>
                <dd className="mt-1 font-display text-3xl font-semibold text-white">{h.value}</dd>
              </Reveal>
            ))}
          </dl>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="flex items-end justify-between">
          <h2 className="font-display text-3xl font-semibold text-ink-900">What we do</h2>
          <Link to="/services" className="hidden text-sm font-medium text-mustard-600 hover:text-mustard-700 sm:flex sm:items-center sm:gap-1">
            All services <ArrowRight size={14} />
          </Link>
        </div>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.slice(0, 4).map((service, i) => {
            const Icon = ICONS[service.icon] || LayoutGrid;
            return (
              <Reveal key={service.id} direction="up" delay={i * 100} className="rounded-xl border border-fog-200 bg-mustard-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-mustard-300 hover:shadow-lg">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-mustard-500/10 text-mustard-600">
                  <Icon size={20} />
                </div>
                <h3 className="mt-4 font-display text-lg font-semibold text-ink-900">{service.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-fog-600">{service.description}</p>
              </Reveal>
            );
          })}
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="bg-mustard-100 py-20">
          <div className="mx-auto max-w-6xl px-5">
            <h2 className="font-display text-3xl font-semibold text-ink-900">What clients say</h2>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {testimonials.map((t, i) => (
                <Reveal key={t.id} direction="up" delay={i * 100} className="rounded-xl border border-fog-200 bg-mustard-50 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-mustard-300 hover:shadow-lg">
                  <p className="text-lg leading-relaxed text-ink-900">"{t.quote}"</p>
                  <footer className="mt-4 text-sm text-fog-600">
                    <span className="font-medium text-ink-900">{t.clientName}</span>, {t.clientTitle}
                  </footer>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-6xl px-5 py-20">
        <div className="rounded-2xl bg-ink-950 px-8 py-14 text-center sm:px-16">
          <h2 className="font-display text-3xl font-semibold text-white">Have a project in mind?</h2>
          <p className="mx-auto mt-3 max-w-md text-white/60">
            Tell us what you're building. We'll get back to you within a couple of days.
          </p>
          <Link to="/contact" className="mt-7 inline-block">
            <PrimaryButton className="bg-mustard-500 text-ink-950 hover:bg-mustard-400">
              Get in touch <ArrowRight size={16} />
            </PrimaryButton>
          </Link>
        </div>
      </section>
    </div>
  );
}
