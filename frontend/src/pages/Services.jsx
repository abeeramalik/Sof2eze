import { LayoutGrid, Smartphone, Cloud, PenTool, Sparkles } from "lucide-react";
import { cms } from "../api/cmsClient";
import { useFetch } from "../hooks/useFetch";
import { PageHeader, LoadingBlock, ErrorBlock } from "../components/ui";

const ICONS = { "layout-grid": LayoutGrid, smartphone: Smartphone, cloud: Cloud, "pen-tool": PenTool, sparkles: Sparkles };

export default function Services() {
  const { data: services, error, loading } = useFetch(cms.getServices, []);

  return (
    <div>
      <PageHeader
        eyebrow="Services"
        title="What we do"
        description="From first prototype to the system that runs your business, we work across the whole lifecycle."
      />

      <section className="mx-auto max-w-6xl px-5 py-16">
        {loading && <LoadingBlock label="Loading services…" />}
        {error && <ErrorBlock message="We couldn't load our services right now. Please refresh." />}

        {services && (
          <div className="grid gap-6 sm:grid-cols-2">
            {services.map((service) => {
              const Icon = ICONS[service.icon] || LayoutGrid;
              return (
                <div key={service.id} className="rounded-xl border border-fog-200 bg-mustard-50 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-mustard-300 hover:shadow-lg">
                  <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-mustard-500/10 text-mustard-600">
                    <Icon size={22} />
                  </div>
                  <h2 className="mt-5 font-display text-xl font-semibold text-ink-900">{service.title}</h2>
                  <p className="mt-2 leading-relaxed text-fog-600">{service.description}</p>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
