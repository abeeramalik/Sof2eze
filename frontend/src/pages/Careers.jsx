import { Link } from "react-router-dom";
import { ArrowRight, Briefcase } from "lucide-react";
import { cms } from "../api/cmsClient";
import { useFetch } from "../hooks/useFetch";
import { PageHeader, LoadingBlock, ErrorBlock, Badge } from "../components/ui";

export default function Careers() {
  const { data: jobs, error, loading } = useFetch(cms.getJobs, []);

  return (
    <div>
      <PageHeader
        eyebrow="Careers"
        title="Open positions"
        description="We're a small team, so every hire matters. Here's what we're currently looking for."
      />

      <section className="mx-auto max-w-4xl px-5 py-16">
        {loading && <LoadingBlock label="Loading open positions…" />}
        {error && <ErrorBlock message="We couldn't load job listings right now. Please refresh." />}

        {jobs && jobs.length === 0 && (
          <p className="text-fog-600">No open positions right now. Check back soon.</p>
        )}

        {jobs && jobs.length > 0 && (
          <div className="space-y-4">
            {jobs.map((job) => (
              <Link
                key={job.id}
                to={`/careers/${job.id}`}
                className="flex items-center justify-between gap-4 rounded-xl border border-fog-200 bg-mustard-50 p-6 transition-all duration-300 hover:-translate-y-1 hover:border-mustard-300 hover:shadow-lg"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-mustard-600" />
                    <Badge tone="mustard">{job.department}</Badge>
                  </div>
                  <h2 className="mt-2 font-display text-lg font-semibold text-ink-900">{job.title}</h2>
                  <p className="mt-1 line-clamp-1 text-sm text-fog-600">{job.description}</p>
                </div>
                <ArrowRight className="shrink-0 text-fog-400" size={18} />
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
