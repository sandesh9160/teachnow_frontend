import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/hooks/useBlogs";
import { ChevronRight, Clock, Search, Calendar } from "lucide-react";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function BlogArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  // Fetch rich data on the server
  const { blog: blogData, related } = await getBlogBySlug(slug);

  if (!blogData) {
    notFound();
  }

  // Content cleanup and image normalization logic
  let processedContent = blogData.content || "";

  // Extract body if it's a full document
  if (processedContent.includes("<body")) {
    const bodyMatch = processedContent.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    if (bodyMatch && bodyMatch[1]) {
      processedContent = bodyMatch[1];
    }
  }

  // Clean redundant tags
  processedContent = processedContent.replace(/<(article|footer)[^>]*>|<\/(article|footer)>/gi, "");

  // NORMALIZE IMAGE PATHS: Prepend IMAGE_BASE_URL to relative paths like 'storage/'
  const IMAGE_BASE_URL = process.env.NEXT_PUBLIC_IMAGE_URL || "http://teachnowbackend.jobsvedika.in:8080";
  const cleanBaseUrl = IMAGE_BASE_URL.endsWith("/") ? IMAGE_BASE_URL.slice(0, -1) : IMAGE_BASE_URL;

  // Regex to find src="storage/..." or src="/storage/..."
  processedContent = processedContent.replace(
    /src=(["'])(?:\/)?(storage\/[^"']+)\1/gi,
    (_match, quote, path) => `src=${quote}${cleanBaseUrl}/${path}${quote}`
  );

  return (
    <div className="min-h-screen bg-white pb-16 font-sans">
      {/* breadcrumb */}
      <div className="border-b border-slate-100 bg-white sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-2.5 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-[12px] text-slate-400 font-medium">
            <Link href="/" className="hover:text-blue-600 transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blogs" className="hover:text-blue-600 transition-colors">Blog</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-slate-900 font-semibold line-clamp-1">{blogData.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          {/* Main Content */}
          <article className="lg:col-span-8">
            <header className="mb-8">
              <span className="inline-flex items-center px-3 py-1 rounded-lg bg-blue-50 text-blue-600 text-[11px] font-bold tracking-wide capitalize">
                {blogData.category || "Education"}
              </span>
              <h1 className="mt-4 text-[28px] md:text-[36px] font-bold text-[#111827] leading-tight">
                {blogData.title}
              </h1>
              <div className="mt-6 flex flex-wrap items-center gap-6 text-[13px] text-slate-500 border-y border-slate-100 py-4 mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="h-9 w-9 rounded-full bg-slate-100 flex items-center justify-center text-blue-600 font-bold shadow-sm">
                    {blogData.author ? blogData.author[0] : "T"}
                  </div>
                  <div className="flex flex-col">
                     <span className="text-[10px] font-bold text-slate-400 leading-none mb-1">Author</span>
                     <span className="font-bold text-[#111827] leading-none">{blogData.author || "TeachNow Team"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-300" />
                  <span className="font-semibold text-slate-600">{formatDate(blogData.created_at || "2026-03-01")}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-300" />
                  <span className="font-semibold text-slate-600">{blogData.readTime || "5 min read"}</span>
                </div>
              </div>
            </header>

            {/* Featured Image */}
            {blogData.image && (
              <div className="mb-10 overflow-hidden rounded-2xl aspect-21/9 border border-slate-100 shadow-sm relative group">
                <img 
                  src={blogData.image} 
                  alt={blogData.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
              </div>
            )}

            {/* Content Body - Styled for Tiptap/ProseMirror Rendering */}
            <div className="blog-content prose prose-slate max-w-none tiptap-content">
                <style dangerouslySetInnerHTML={{ __html: `
                  .blog-content { font-size: 1.125rem; line-height: 1.8; }
                  .blog-content h2 { font-size: 1.875rem; font-weight: 700; margin-top: 3rem; margin-bottom: 1.5rem; border-bottom: 2px solid #f1f5f9; padding-bottom: 0.75rem; }
                  .blog-content h3 { font-size: 1.5rem; font-weight: 700; margin-top: 2.5rem; margin-bottom: 1.25rem; }
                  .blog-content p { margin-bottom: 1.5rem; text-align: justify; }
                  
                  /* Tiptap List Styles */
                  .blog-content ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-bottom: 1.5rem !important; }
                  .blog-content ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-bottom: 1.5rem !important; }
                  .blog-content li { margin-bottom: 0.5rem !important; padding-left: 0.25rem; }
                  .blog-content li > p { margin-bottom: 0.25rem !important; }

                  /* Tiptap Blockquote Styles */
                  .blog-content blockquote { 
                    border-left: 4px solid #3b82f6; 
                    background-color: #f8faff; 
                    padding: 1.5rem 2rem; 
                    margin: 2rem 0; 
                    border-radius: 0 0.75rem 0.75rem 0; 
                    font-style: italic; 
                    font-size: 1.1rem;
                  }
                  
                  /* Tiptap Mark Styles */
                  .blog-content strong { font-weight: 700; }
                  .blog-content em { font-style: italic; }
                  .blog-content u { text-decoration: underline; }
                  .blog-content s { text-decoration: line-through; }
                  
                  /* Tiptap Image/Media Styles */
                  .blog-content img { 
                    border-radius: 12px; 
                    margin: 2.5rem auto; 
                    max-width: 100%; 
                    height: auto; 
                    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1); 
                    display: block;
                  }
                  
                  /* Tiptap Link Styles */
                  .blog-content a { text-decoration: underline; text-underline-offset: 4px; font-weight: 600; }

                  /* Tiptap Code Styles */
                  .blog-content code { 
                    background-color: #f1f5f9; 
                    padding: 0.2rem 0.4rem; 
                    border-radius: 0.25rem; 
                    font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
                    font-size: 0.9em;
                  }
                `}} />
                <div dangerouslySetInnerHTML={{ __html: processedContent }} />
            </div>


          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-8 lg:sticky lg:top-24 h-fit">
            {/* Search */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h4 className="text-[16px] font-semibold text-slate-800 mb-5">Search Articles</h4>
              <div className="relative group">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-300 group-focus-within:text-blue-600 transition-colors" />
                <input 
                  type="text" 
                  placeholder="Search..." 
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 pl-10 pr-4 py-2.5 text-sm font-medium focus:outline-blue-600 focus:bg-white transition-all shadow-none"
                  suppressHydrationWarning
                />
              </div>
            </div>

            {/* Related */}
            <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
              <h4 className="text-[16px] font-semibold text-slate-800  mb-6">Related Articles</h4>
              <div className="space-y-6">
                {related.map((r) => (
                  <Link key={r.id} href={`/blogs/${r.slug || r.id}`} className="group flex gap-4">
                    <div className="h-16 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-50 border border-slate-100">
                      {r.image ? (
                        <img src={r.image} alt={r.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-slate-300 italic">No Preview</div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-[10px] font-semibold text-primary/80 mb-1">{r.category || "Insight"}</span>
                      <h5 className="text-[13px] font-semibold text-[#111827] group-hover:text-blue-600 transition-colors line-clamp-2">
                        {r.title}
                      </h5>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/blogs" className="mt-8 block text-center text-[11px] font-semibold text-slate-800 hover:text-blue-600  transition-colors pt-5 border-t border-slate-50">
                View All Resources
              </Link>
            </div>

          </aside>
        </div>
      </div>
    </div>
  );
}
