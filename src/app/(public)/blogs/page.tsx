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
    <div className="min-h-screen bg-[#f8faff]">
      {/* Consistent Breadcrumb Bar */}
      <div className="border-b border-slate-100 bg-white sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:px-8">
          <Breadcrumb items={breadcrumbItems} />
        </div>
      </div>

      {/* Header */}
      <section className="border-b border-slate-50 bg-white py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center md:text-left">
          <div className="max-w-3xl">
            <h1 className="text-[28px] md:text-[36px] font-semibold text-[#111827] tracking-tight">Career blogs</h1>
            <p className="mt-2 text-[15px] md:text-[17px] text-slate-500 font-medium leading-relaxed">
              Career advice, interview tips, and insights for teachers, tutors, and academic professionals.
            </p>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-12">
          {/* Blog Grid */}
          <div className="lg:col-span-8">
            <div className="grid gap-5 sm:grid-cols-2">
              {blogPosts.map((post) => (
                <Link
                  key={post.slug}
                  href={`/blogs/${post.slug}`}
                  className="group rounded-xl border border-slate-200 bg-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-blue-200/50"
                >
                  <div className="aspect-video overflow-hidden">
                    <img
                      src={post.image}
                      alt={post.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="p-4">
                    <h3 className="text-base font-bold text-[#111827] leading-tight group-hover:text-blue-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="mt-2 text-[13px] text-slate-500 font-medium leading-relaxed line-clamp-2">{"Read more about this article on our blog."}</p>
                    <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-[11px] text-slate-400 font-bold uppercase tracking-wide">
                      <span>{formatDate(post.created_at || Date.now())}</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />5 min read</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {blogPosts.length === 0 && (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-12 text-center">
                <p className="text-slate-500 font-medium">No articles found.</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-6">
            {/* Search */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-[16px] font-semibold text-slate-800 mb-4">Search Articles</h3>
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input
                  type="text"
                  placeholder="Search..."
                  className="w-full rounded-lg border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-blue-600 focus:bg-white transition-all shadow-none"
                />
              </div>
            </div>

            {/* Categories */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-[16px] font-semibold text-slate-800 mb-4">Categories</h3>
              <div className="grid grid-cols-2 gap-2">
                {["All", ...blogCategories].map((cat, idx) => (
                  <button
                    key={`cat-${cat}-${idx}`}
                    className="rounded-lg px-3 py-1.5 text-left text-[13px] font-semibold text-slate-600 bg-slate-50 hover:bg-blue-50 hover:text-blue-600 transition-all"
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Popular Articles */}
            <div className="rounded-xl border border-slate-200 bg-white p-5">
              <h3 className="text-[16px] font-semibold text-slate-800 mb-4">Popular Insights</h3>
              <div className="space-y-4">
                {popular.map((p) => (
                  <Link
                    key={p.slug}
                    href={`/blogs/${p.slug}`}
                    className="group flex items-start gap-4"
                  >
                    <div className="h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-slate-50 border border-slate-100">
                      <img src={p.image} alt={p.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" loading="lazy" />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-[#111827] leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                        {p.title}
                      </p>
                      <p className="mt-0.5 text-[10px] font-bold text-slate-400">{formatDate(p.created_at || Date.now())}</p>
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
