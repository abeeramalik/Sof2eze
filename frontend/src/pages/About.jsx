import { cms } from "../api/cmsClient";
import { useFetch } from "../hooks/useFetch";
import { PageHeader, LoadingBlock, ErrorBlock } from "../components/ui";

export default function About() {
  const { data, error, loading } = useFetch(cms.getSiteContent, []);

  if (loading) return <LoadingBlock label="Loading…" />;
  if (error) return <ErrorBlock message="We couldn't load this page. Please refresh." />;

  const { about } = data;

  const cards = [
    { key: "history", label: "01", title: "Our history", body: about.history },
    { key: "mission", label: "02", title: "Our mission", body: about.mission },
    { key: "vision", label: "03", title: "Our vision", body: about.vision },
  ];

  return (
    <div>
      <PageHeader
        eyebrow="About us"
        title="Software built by people who maintain it too."
        description="A small studio that treats every client project like it's our own product."
      />

      <section className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {cards.map((card) => (
            <div
              key={card.key}
              className="relative flex flex-col rounded-xl border border-fog-200 bg-mustard-50 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-mustard-300 hover:shadow-lg"
            >
              <span className="font-display text-sm font-semibold text-mustard-500">{card.label}</span>
              <h2 className="mt-3 font-display text-xl font-semibold text-ink-900">{card.title}</h2>
              <span className="rule-mustard mt-3" />
              <p className="mt-4 text-base leading-relaxed text-fog-600">{card.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
