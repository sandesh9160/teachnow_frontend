"use client";

import { Clock } from "lucide-react";
import Link from "next/link";

interface BlogCardProps {
  title: string;
  excerpt: string;
  category: string;
  readTime: string;
  date: string;
  slug?: string;
  image?: string;
}

const BlogCard = ({ title, excerpt, category, readTime, date, slug, image }: BlogCardProps) => {
  return (
    <Link
      href={slug ? `/blogs/${slug}` : "/blogs"}
      className="group flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-card transition-all duration-300 hover:shadow-card-hover hover:border-primary/20 hover:-translate-y-0.5"
    >
      <div className="h-40 overflow-hidden">
        {image ? (
          <img src={image} alt={title} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="h-full gradient-primary opacity-80 group-hover:opacity-100 transition-opacity" />
        )}
      </div>
      <div className="flex flex-1 flex-col p-5">
        <span className="mb-2 inline-block w-fit rounded-md bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">{category}</span>
        <h3 className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2">{title}</h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">{excerpt}</p>
        <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
          <span>{date}</span>
          <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{readTime}</span>
        </div>
      </div>
    </Link>
  );
};

export default BlogCard;
