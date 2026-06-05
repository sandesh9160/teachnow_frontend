import Link from "next/link";

/** Static header shell — paints immediately while navigation data streams */
export function HeaderShell() {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-gray-100 bg-white h-16">
      <div className="flex h-16 w-full items-center justify-between px-4 sm:px-6 lg:px-8 xl:px-12">
        <Link href="/" className="flex items-center gap-2 shrink-0">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e3a8a] text-white font-bold text-lg">
            T
          </span>
          <span className="text-xl font-extrabold text-gray-900 tracking-tight">
            Teach<span className="text-[#3b49df]">Now</span>
          </span>
        </Link>
      </div>
    </header>
  );
}
