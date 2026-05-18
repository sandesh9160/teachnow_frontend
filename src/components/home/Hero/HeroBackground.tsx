import Image from "next/image";
import { getHeroCTAData } from "@/lib/globalLayout/getGlobalLayoutData";
import { normalizeMediaUrl } from "@/services/api/client";

export default async function HeroBackground() {
  const heroCTA = await getHeroCTAData();
  const imageUrl = heroCTA?.hero?.background_image
    ? normalizeMediaUrl(heroCTA.hero.background_image)
    : null;

  if (!imageUrl) return null;

  return (
    <div className="absolute inset-0 z-0 hidden sm:block">
      <Image
        src={imageUrl}
        alt=""
        fill
        sizes="(min-width: 640px) 100vw, 0px"
        className="object-cover object-center"
        quality={75}
      />
      <div className="absolute inset-0 bg-slate-50/20" aria-hidden />
    </div>
  );
}
