import Breadcrumb from "@/shared/ui/Breadcrumb/Breadcrumb";
import Link from "next/link";
export const dynamic = "force-dynamic";
import { getBlogs } from "@/hooks/useBlogs";
import { Search, Clock } from "lucide-react";
import { formatDate } from "@/lib/utils";

export default async function BlogPage() {
  const blogPosts = await getBlogs();
  const blogCategories = Array.from(new Set(blogPosts.map(p => p.category)));

  const popular = blogPosts.slice(0, 3);

  const breadcrumbItems = [{ label: "Blog", isCurrent: true }];

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-border bg-white/80 backdrop-blur-md sticky top-16 z-40">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Header */}
      <section className="border-b border-slate-100 bg-white py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold text-slate-900 md:text-4xl tracking-tight">Teaching Career Resources</h1>
            <p className="mt-4 text-base text-slate-500 font-medium leading-relaxed">
              Career advice, interview tips, and insights for teachers, tutors, and academic professionals.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Blog Grid */}
          <div className="lg:col-span-2">
            <div className="grid gap-6 sm:grid-cols-2">
              {blogPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blogs/${post.slug}`}
                  className="group rounded-xl border border-border bg-card shadow-card overflow-hidden transition-all hover:shadow-card-hover hover:-translate-y-1"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-5">
                    <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                      {post.category}
                    </span>
                    <h3 className="mt-2.5 font-display text-base font-semibold text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="mt-1.5 text-xs text-slate-500 font-medium leading-relaxed">{"Read more about this article on our blog."}</p>
                    <div className="mt-3 flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>By Admin</span>
                      <div className="flex items-center gap-3">
                        <span>{formatDate(post.created_at || Date.now())}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />5 min</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {blogPosts.length === 0 && (
              <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
                <p className="text-muted-foreground">No articles found.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Search */}
            <div className="group relative rounded-xl border border-slate-200 bg-white p-5 transition-all duration-300 hover:shadow-xl hover:shadow-slate-200/50">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
                  Search Articles
                </h3>
              </div>
              <div className="relative flex items-center transition-all duration-300 focus-within:ring-2 focus-within:ring-primary/20 rounded-lg overflow-hidden bg-slate-50 border border-slate-100 focus-within:bg-white focus-within:border-primary/30 group/input">
                <div className="pl-3.5 pr-2 py-3 text-slate-400 group-focus-within/input:text-primary transition-colors">
                  <Search className="h-4 w-4" />
                </div>
                <input
                  type="text"
                  placeholder="Type to search..."
                  className="w-full bg-transparent py-3 pr-4 text-sm font-medium text-slate-700 placeholder:text-slate-400 focus:outline-none"
                />
              </div>
            </div>



            {/* Categories */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <h3 className="text-sm font-semibold text-foreground mb-3">Categories</h3>
              <div className="space-y-1">
                {["All", ...blogCategories].map((cat) => (
                  <button
                    key={cat}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors text-muted-foreground hover:bg-muted hover:text-foreground`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Articles */}
            <div className="rounded-xl border border-border bg-card p-4 shadow-card">
              <h3 className="text-sm font-semibold text-foreground mb-3">Popular Articles</h3>
              <div className="space-y-3">
                {popular.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blogs/${p.slug}`}
                    className="group flex items-start gap-3"
                  >
                    <img src={p.image} alt={p.title} className="h-12 w-16 shrink-0 rounded-lg object-cover" loading="lazy" />
                    <div>
                      <p className="text-xs font-medium text-foreground leading-snug group-hover:text-primary transition-colors line-clamp-2">
                        {p.title}
                      </p>
                      <p className="mt-0.5 text-[10px] text-muted-foreground">{formatDate(p.created_at || Date.now())}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
