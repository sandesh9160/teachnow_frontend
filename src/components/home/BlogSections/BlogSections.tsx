"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/shared/ui/Buttons/Buttons";
import BlogCard from "@/shared/cards/BlogCard/BlogCard";
import { BlogSectionsProps } from "@/types/components";
import { formatDate } from "@/lib/utils";

export const BlogSections = ({ blogs }: BlogSectionsProps) => {
  const blogPreview = Array.isArray(blogs) ? blogs.slice(0, 3) : [];

  if (blogPreview.length === 0) return null;

  return (
    <section className="py-12 md:py-16 bg-card border-t border-border">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 pl-2 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-slate-900 md:text-4xl">
              Latest from the <span className="text-primary/80">Blog</span>
            </h2>
            <p className="mt-2 text-lg text-slate-500 font-medium tracking-wide">
              Resources and guides for your teaching career
            </p>
          </div>
          <Button asChild variant="ghost" className="sm:flex gap-1 text-primary hover:text-primary transition-colors self-start md:self-auto">
            <Link href="/blogs">
              View All Posts <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {blogPreview.map((post) => (
            <BlogCard 
              key={post.id || post.slug} 
              title={post.title}
              slug={post.slug}
              image={post.image}
              date={post.created_at ? formatDate(post.created_at) : "Recently"}
              category="Education"
              readTime="5 min read"
              excerpt="Read more about this article on our blog."
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default BlogSections;
