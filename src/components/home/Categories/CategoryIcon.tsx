"use client";

import { useState } from "react";
import Image from "next/image";
import { GraduationCap, BookOpen, Briefcase, Headphones, Atom, UserCheck } from "lucide-react";

const genericIcons = [GraduationCap, BookOpen, Briefcase, Headphones, Atom, UserCheck];

const getFullImageUrl = (path: string | null | undefined) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  const baseUrl = process.env.NEXT_PUBLIC_LARAVEL_API_URL || "https://teachnowbackend.jobsvedika.in";
  return `${baseUrl}/${path.startsWith('/') ? path.slice(1) : path}`;
};

export const CategoryIcon = ({ iconPath, id, name }: { iconPath: string | null | undefined, id: number, name: string }) => {
  const [error, setError] = useState(false);
  const fullUrl = getFullImageUrl(iconPath);

  // Try to match icon by name for better accuracy with the provided image
  const lowerName = name.toLowerCase();
  let FallbackIcon = genericIcons[id % genericIcons.length];

  if (lowerName.includes("physics") || lowerName.includes("chemistry") || lowerName.includes("science") || lowerName.includes("biology")) FallbackIcon = Atom;
  if (lowerName.includes("english") || lowerName.includes("language") || lowerName.includes("history") || lowerName.includes("social")) FallbackIcon = BookOpen;
  if (lowerName.includes("online") || lowerName.includes("tutor") || lowerName.includes("elearning")) FallbackIcon = Headphones;
  if (lowerName.includes("computer") || lowerName.includes("science") || lowerName.includes("coding") || lowerName.includes("it")) FallbackIcon = Briefcase;
  if (lowerName.includes("math") || lowerName.includes("algebra") || lowerName.includes("geometry") || lowerName.includes("mathematics")) FallbackIcon = GraduationCap;

  if (!fullUrl || error) {
    return (
      <div className="relative z-10 shrink-0 flex h-12 w-12 mb-3 items-center justify-center rounded-[16px] bg-[#ecf2ff] text-[#1e3a8a] transition-all duration-300 group-hover:bg-[#1e3a8a] group-hover:text-white overflow-hidden">
        <FallbackIcon className="h-7 w-7" />
      </div>
    );
  }

  return (
    <div className="relative z-10 shrink-0 flex h-12 w-12 mb-3 items-center justify-center rounded-[16px] transition-all duration-300 overflow-hidden">
      <Image
        src={fullUrl}
        alt={`${name} icon`}
        width={48}
        height={48}
        quality={80}
        sizes="48px"
        className="w-full h-full object-contain transition-all duration-300 group-hover:scale-110"
        onError={() => setError(true)}
      />
    </div>
  );
};

export default CategoryIcon;
