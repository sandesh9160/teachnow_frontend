import Image from "next/image";
import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";

export default async function HeroBackground() {
  const { heroCTA } = await getGlobalLayoutData();
  const imageUrl = heroCTA?.hero?.background_image || null;

  if (!imageUrl) return null;

  return (
    <div className="absolute inset-0 z-0 hidden sm:block">
      <Image
        src={imageUrl}
        alt=""
        fill
        sizes="(min-width: 640px) 100vw, 0px"
        className="object-cover object-center opacity-100"
      />
    </div>
  );
}
