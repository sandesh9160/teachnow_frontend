import Link from "next/link";
import { notFound } from "next/navigation";
import { getBlogBySlug } from "@/hooks/useBlogs";
import { Button } from "@/shared/ui/Buttons/Buttons";
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
    <div className="min-h-screen bg-background pb-20 font-sans">
      {/* breadcrumb */}
      <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs text-muted-foreground font-medium">
            <Link href="/" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="h-3 w-3" />
            <Link href="/blogs" className="hover:text-primary transition-colors">Blog</Link>
            <ChevronRight className="h-3 w-3" />
            <span className="text-foreground font-semibold line-clamp-1">{blogData.title}</span>
          </nav>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          {/* Main Content */}
          <article className="lg:col-span-8">
            <header className="mb-10">
              <span className="rounded-full bg-primary/10 px-4 py-1.5 text-[10px] font-extrabold text-primary uppercase tracking-widest">{blogData.category || "Education"}</span>
              <h1 className="mt-6 font-display text-4xl font-extrabold text-foreground sm:text-5xl lg:text-5xl leading-tight">
                {blogData.title}
              </h1>
              <div className="mt-8 flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-y border-border py-5 mb-10">
                <div className="flex items-center gap-2.5">
                  <div className="h-10 w-10 rounded-full bg-linear-to-br from-primary/20 to-secondary/20 flex items-center justify-center text-primary font-bold shadow-sm">T</div>
                  <div className="flex flex-col">
                     <span className="text-[10px] uppercase font-bold text-muted-foreground/60 leading-none mb-1">Author</span>
                     <span className="font-bold text-foreground leading-none">{blogData.author || "TeachNow Team"}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary/60" />
                  <span className="font-medium text-foreground/80">{formatDate(blogData.created_at || Date.now())}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-primary/60" />
                  <span className="font-medium text-foreground/80">{blogData.readTime || "5 min read"}</span>
                </div>
              </div>
            </header>

            {/* RESTORED: Featured Image (from the card) */}
            {blogData.image && (
              <div className="mb-12 overflow-hidden rounded-3xl aspect-21/9 border border-border shadow-2xl relative group">
                <div className="absolute inset-0 bg-linear-to-t from-black/20 to-transparent z-10 transition-opacity opacity-0 group-hover:opacity-100"></div>
                <img 
                  src={blogData.image} 
                  alt={blogData.title} 
                  className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105" 
                />
              </div>
            )}

            {/* Content Body */}
            <div className="blog-content prose prose-lg prose-slate dark:prose-invert max-w-none">
                <style dangerouslySetInnerHTML={{ __html: `
                  .blog-content h2 { font-size: 1.875rem; font-weight: 700; margin-top: 3rem; margin-bottom: 1.5rem; border-bottom: 2px solid hsl(var(--border)); padding-bottom: 0.75rem; color: hsl(var(--foreground)); }
                  .blog-content h3 { font-size: 1.5rem; font-weight: 700; margin-top: 2rem; margin-bottom: 1rem; color: hsl(var(--foreground)); }
                  .blog-content p { font-size: 1.125rem; line-height: 1.8; margin-bottom: 1.5rem; color: hsl(var(--muted-foreground)); text-align: justify; }
                  .blog-content blockquote { border-left: 4px solid hsl(var(--primary)); background-color: hsl(var(--primary) / 0.05); padding: 2rem; margin: 2rem 0; border-radius: 0 1rem 1rem 0; font-style: italic; font-size: 1.25rem; color: hsl(var(--foreground)); }
                  .blog-content ul { list-style-type: disc; padding-left: 1.5rem; margin-bottom: 1.5rem; color: hsl(var(--muted-foreground)); padding-top: 0.5rem; padding-bottom: 0.5rem; }
                  .blog-content li { margin-bottom: 0.75rem; font-size: 1.125rem; }
                  .blog-content img { border-radius: 1.5rem; margin: 2.5rem 0; width: 100% !important; height: auto !important; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); }
                  .blog-content .highlight-box { border-left: 4px solid hsl(var(--primary)); background-color: hsl(var(--primary) / 0.05); padding: 2rem; margin: 2rem 0; border-radius: 0 1rem 1rem 0; font-style: italic; color: hsl(var(--foreground)); font-size: 1.125rem; }
                  .blog-content .subtitle { font-size: 1.25rem; color: hsl(var(--muted-foreground)); margin-bottom: 2rem; border-bottom: 1px solid hsl(var(--border)); padding-bottom: 1rem; font-weight: 500; }
                `}} />
                <div dangerouslySetInnerHTML={{ __html: processedContent }} />
            </div>

            {/* Subscribe CTA */}
            <div className="mt-20 p-10 rounded-3xl bg-linear-to-br from-primary/10 to-transparent border border-primary/10 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-primary/10 transition-colors"></div>
               <h3 className="text-2xl font-bold text-foreground mb-3 relative z-10">Stay Updated!</h3>
               <p className="text-muted-foreground mb-8 text-lg relative z-10">Join 10,000+ educators receiving our weekly newsletter on career growth.</p>
               <div className="flex flex-col sm:flex-row gap-4 max-w-lg relative z-10">
                 <input type="email" placeholder="Enter your email" className="flex-1 rounded-2xl border border-border bg-background px-6 py-4 text-sm font-medium focus:outline-primary transition-all shadow-sm" />
                 <Button variant="hero" className="py-4 shadow-lg shadow-primary/20">Subscribe</Button>
               </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-4 space-y-12 lg:sticky lg:top-28 h-fit">
            {/* Search */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-foreground/5 bg-linear-to-b from-card to-background">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">Search Knowledge</h4>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/60 group-focus-within:text-primary transition-colors" />
                <input type="text" placeholder="Topics, skills, guides..." className="w-full rounded-2xl border border-border bg-background pl-12 pr-4 py-3.5 text-sm font-medium focus:outline-primary focus:ring-4 focus:ring-primary/5 transition-all shadow-none" />
              </div>
            </div>

            {/* Related */}
            <div className="rounded-3xl border border-border bg-card p-8 shadow-xl shadow-foreground/5 bg-linear-to-b from-card to-background">
              <h4 className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-8">Related Intelligence</h4>
              <div className="space-y-8">
                {related.map((r) => (
                  <Link key={r.id} href={`/blogs/${r.slug || r.id}`} className="group flex gap-5">
                    <div className="h-20 w-24 shrink-0 overflow-hidden rounded-2xl bg-muted border border-border shadow-sm">
                      {r.image ? (
                        <img src={r.image} alt={r.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-[10px] text-muted-foreground italic">No Preview</div>
                      )}
                    </div>
                    <div className="flex flex-col justify-center">
                      <span className="text-[10px] font-bold text-primary/80 uppercase tracking-tighter mb-1">{r.category || "Insight"}</span>
                      <h5 className="text-sm font-bold text-foreground leading-tight group-hover:text-primary transition-colors line-clamp-2">
                        {r.title}
                      </h5>
                    </div>
                  </Link>
                ))}
              </div>
              <Link href="/blogs" className="mt-10 block text-center text-[10px] font-extrabold text-primary hover:text-secondary uppercase tracking-[0.2em] transition-colors pt-6 border-t border-border/60">
                Explore All Intelligence
              </Link>
            </div>

            {/* Hire Card */}
            <div className="rounded-3xl bg-linear-to-br from-primary to-secondary p-10 text-center text-primary-foreground relative overflow-hidden group shadow-2xl shadow-primary/30">
               <div className="absolute inset-0 opacity-20 bg-[radial-gradient(circle_at_center,white_1px,transparent_1px)] bg-size-[20px_20px] group-hover:scale-110 transition-transform duration-700"></div>
               <div className="relative z-10">
                 <h4 className="text-2xl font-bold mb-4 tracking-tight">Hire World-Class Educators</h4>
                 <p className="text-sm text-primary-foreground/90 mb-8 leading-relaxed">Instantly reach our verified network of 90,000+ top-tier academic professionals.</p>
                 <Link href="/auth/employer-login">
                    <Button variant="secondary" className="w-full py-6 font-bold text-primary rounded-2xl shadow-inner hover:bg-white transition-colors">Post a Vacancy</Button>
                 </Link>
               </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
