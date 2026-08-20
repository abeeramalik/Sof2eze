import { cms } from "../api/cmsClient";
import { useFetch } from "../hooks/useFetch";
import { PageHeader, LoadingBlock, ErrorBlock } from "../components/ui";
import Reveal from "../components/Reveal";

function initials(name) {
  return name.split(" ").map((p) => p[0]).join("").slice(0, 2).toUpperCase();
}

export default function Team() {
  const { data: team, error, loading } = useFetch(cms.getTeam, []);

  return (
    <div>
      <PageHeader
        eyebrow="Team"
        title="The people behind Sof2eze"
        description="Small team, direct access. You'll talk to the people actually building your project."
      />

      <section className="mx-auto max-w-6xl px-5 py-16">
        {loading && <LoadingBlock label="Loading the team…" />}
        {error && <ErrorBlock message="We couldn't load the team page right now. Please refresh." />}

        {team && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {team.map((member, i) => (
              <Reveal key={member.id} direction="up" delay={i * 100} className="rounded-xl border border-fog-200 bg-mustard-50 p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-mustard-300 hover:shadow-lg">
                <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-mustard-500 font-display text-xl font-semibold text-ink-950">
                  {initials(member.name)}
                </div>
                <h2 className="mt-4 font-display text-lg font-semibold text-ink-900">{member.name}</h2>
                <p className="text-sm font-medium text-mustard-600">{member.role}</p>
                <p className="mt-3 text-sm leading-relaxed text-fog-600">{member.bio}</p>
              </Reveal>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
