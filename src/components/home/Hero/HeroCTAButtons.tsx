import Image from "next/image";
import Link from "next/link";
import { Button } from "@/shared/ui/Buttons/Buttons";
import { getGlobalLayoutData } from "@/lib/globalLayout/getGlobalLayoutData";

export default async function HeroCTAButtons() {
  const { heroCTA } = await getGlobalLayoutData();
  const ctaItems = (heroCTA?.cta ?? []).filter(
    (item: any) => item?.is_active === undefined || item.is_active === 1
  );

  if (ctaItems.length === 0) return null;

  return (
    <div className="mt-8 mb-4 flex flex-col sm:flex-row gap-4 justify-center">
      {ctaItems.map((item: any, index: number) => {
        const isBlue = index % 2 === 0;
        const btnIconUrl = item.background_image || null;

        return (
          <Button
            key={item.id ?? item.title ?? item.button_text}
            asChild
            variant={isBlue ? null : "outline"}
            className={
              isBlue
                ? "bg-[#3b49df] hover:bg-[#2e3fc7] hover:shadow-xl hover:shadow-indigo-200/50 text-white px-6 py-3 h-auto rounded-xl transition-all font-bold text-sm w-full sm:w-auto flex items-center justify-center gap-2.5 border-0 active:scale-95"
                : "border border-slate-300 bg-white hover:bg-slate-50 text-[#1a202c] px-6 py-2.5 h-auto rounded-xl shadow-sm hover:shadow-md transition-all font-bold text-sm w-full sm:w-auto flex items-center justify-center gap-2.5 active:scale-95"
            }
          >
            <Link href={item.button_link}>
              {btnIconUrl && (
                <Image
                  src={btnIconUrl}
                  alt=""
                  width={24}
                  height={24}
                  className="h-6 w-6 object-contain shrink-0"
                />
              )}
              <span>{item.button_text}</span>
            </Link>
          </Button>
        );
      })}
    </div>
  );
}
