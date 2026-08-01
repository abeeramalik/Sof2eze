import { useState } from "react";
import { Link } from "react-router-dom";
import { Search, ArrowRight } from "lucide-react";
import { cms } from "../api/cmsClient";
import { backend } from "../api/backendClient";
import { useFetch } from "../hooks/useFetch";
import { PageHeader, LoadingBlock, ErrorBlock } from "../components/ui";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function Blog() {
  const { data: posts, error, loading } = useFetch(cms.getBlogPosts, []);

  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) {
      setSearchResults(null);
      return;
    }
    setSearching(true);
    setSearchError(null);
    try {
      const res = await backend.search(query);
      setSearchResults(res.results);
    } catch (err) {
      setSearchError(err.message);
    } finally {
      setSearching(false);
    }
  }

  return (
    <div>
      <PageHeader eyebrow="Blog" title="Notes from the team" description="Thoughts on architecture, process, and the decisions behind what we build." />

      <section className="mx-auto max-w-4xl px-5 py-16">
        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-fog-400" size={18} />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search blog posts and services…"
              className="w-full rounded-md border border-fog-200 py-2.5 pl-10 pr-3 text-sm focus:border-mustard-500"
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-ink-950 px-5 py-2.5 text-sm font-semibold text-white hover:bg-mustard-500 hover:text-ink-950"
          >
            Search
          </button>
        </form>

        {searching && <LoadingBlock label="Searching…" />}
        {searchError && <ErrorBlock message={searchError} />}

        {searchResults && !searching && (
          <div className="mt-8">
            <h2 className="font-display text-lg font-semibold text-ink-900">
              {searchResults.length} result{searchResults.length === 1 ? "" : "s"} for “{query}”
            </h2>
            <ul className="mt-4 space-y-3">
              {searchResults.map((r) => (
                <li key={`${r.type}-${r.id}`} className="rounded-lg border border-fog-200 bg-mustard-50 p-4 transition-all duration-300 hover:-translate-y-1 hover:border-mustard-300 hover:shadow-lg">
                  <span className="text-xs font-medium uppercase tracking-wide text-mustard-600">{r.type}</span>
                  <h3 className="font-display font-semibold text-ink-900">
                    {r.type === "blog" ? (
                      <Link to={`/blog/${r.id}`} className="hover:text-mustard-600">{r.title}</Link>
                    ) : (
                      r.title
                    )}
                  </h3>
                  <p className="mt-1 text-sm text-fog-600">{r.excerpt}</p>
                </li>
              ))}
              {searchResults.length === 0 && (
                <p className="text-sm text-fog-600">No matches. Try a different search term.</p>
              )}
            </ul>
          </div>
        )}
      </section>

      {!searchResults && (
        <section className="mx-auto max-w-4xl px-5 pb-20">
          {loading && <LoadingBlock label="Loading posts…" />}
          {error && <ErrorBlock message="We couldn't load the blog right now. Please refresh." />}

          {posts && (
            <div className="space-y-6">
              {posts.map((post) => (
                <Link
                  key={post.id}
                  to={`/blog/${post.id}`}
                  className="block rounded-xl border border-fog-200 bg-mustard-50 p-7 transition-all duration-300 hover:-translate-y-1 hover:border-mustard-300 hover:shadow-lg"
                >
                  <p className="text-xs font-medium uppercase tracking-wide text-fog-400">
                    {formatDate(post.publishedAt)}
                  </p>
                  <h2 className="mt-2 font-display text-xl font-semibold text-ink-900">{post.title}</h2>
                  <p className="mt-2 line-clamp-2 text-fog-600">{post.body}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-mustard-600">
                    Read more <ArrowRight size={14} />
                  </span>
                </Link>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
