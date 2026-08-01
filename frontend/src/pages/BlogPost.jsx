import { useCallback } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { cms } from "../api/cmsClient";
import { useFetch } from "../hooks/useFetch";
import { LoadingBlock, ErrorBlock } from "../components/ui";

function formatDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { year: "numeric", month: "long", day: "numeric" });
}

export default function BlogPost() {
  const { id } = useParams();
  const fetcher = useCallback(() => cms.getBlogPost(id), [id]);
  const { data: post, error, loading } = useFetch(fetcher, [id]);

  if (loading) return <LoadingBlock label="Loading post…" />;
  if (error) return <ErrorBlock message="We couldn't find that post." />;

  return (
    <article className="mx-auto max-w-3xl px-5 py-16">
      <Link to="/blog" className="inline-flex items-center gap-1 text-sm font-medium text-mustard-600 hover:text-mustard-700">
        <ArrowLeft size={14} /> Back to blog
      </Link>
      <p className="mt-6 text-xs font-medium uppercase tracking-wide text-fog-400">{formatDate(post.publishedAt)}</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink-900 sm:text-4xl">{post.title}</h1>
      <div className="prose mt-8 max-w-none text-lg leading-relaxed text-fog-600">
        <p>{post.body}</p>
      </div>
    </article>
  );
}
