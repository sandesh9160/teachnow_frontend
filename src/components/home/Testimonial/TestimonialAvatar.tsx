"use client";

import { useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { normalizeMediaUrl } from "@/services/api/client";

export const TestimonialAvatar = ({ src, name }: { src?: string | null, name: string }) => {
  const [error, setError] = useState(false);
  const fullUrl = normalizeMediaUrl(src);

  if (!src || error || src.includes('/tmp/')) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-[#ecf2ff] text-[#1e3a8a] font-bold text-sm">
        {name ? name[0].toUpperCase() : <User className="w-5 h-5" />}
      </div>
    );
  }

  return (
    <Image
      src={fullUrl}
      alt={name || "Author"}
      fill
      sizes="40px"
      className="object-cover"
      onError={() => setError(true)}
    />
  );
};

export default TestimonialAvatar;
