/** Programmatic mini-resume previews — no external images needed. */

const Bar = ({ w, className = "" }: { w: string; className?: string }) => (
  <div className={`h-[3px] rounded-full ${className}`} style={{ width: w }} />
);

const Lines = ({ count, className = "" }: { count: number; className?: string }) => (
  <div className="space-y-[3px]">
    {Array.from({ length: count }).map((_, i) => (
      <Bar key={i} w={i === count - 1 ? "60%" : "100%"} className={className} />
    ))}
  </div>
);

const SectionTitle = ({ children, className = "" }: { children: string; className?: string }) => (
  <div className={`text-[5px] font-bold uppercase tracking-[0.08em] mb-[3px] ${className}`}>{children}</div>
);

const Avatar = ({ accent }: { accent: string }) => (
  <div className={`w-5 h-5 rounded-full ${accent} shrink-0`} />
);

const SkillBar = ({ w, bg, fg }: { w: string; bg: string; fg: string }) => (
  <div className={`h-[3px] rounded-full ${bg} overflow-hidden`}>
    <div className={`h-full rounded-full ${fg}`} style={{ width: w }} />
  </div>
);

const SkillTag = ({ className }: { className: string }) => (
  <div className={`h-[6px] rounded-[2px] ${className}`} style={{ width: `${28 + Math.random() * 20}%` }} />
);

/* ──────────────────── Templates ──────────────────── */

const ModernProfessional = () => (
  <div className="flex h-full">
    {/* Sidebar */}
    <div className="w-[35%] bg-[hsl(224,76%,33%)] p-3 flex flex-col gap-2">
      <Avatar accent="bg-white/30" />
      <Bar w="70%" className="bg-white/60" />
      <Bar w="50%" className="bg-white/40" />
      <div className="mt-1 space-y-[3px]">
        <Bar w="80%" className="bg-white/20" />
        <Bar w="60%" className="bg-white/20" />
        <Bar w="70%" className="bg-white/20" />
      </div>
      <div className="mt-auto space-y-[3px]">
        <div className="text-[4px] font-bold text-white/50 uppercase tracking-widest">Skills</div>
        {[85, 70, 90, 60].map((w, i) => (
          <SkillBar key={i} w={`${w}%`} bg="bg-white/10" fg="bg-white/50" />
        ))}
      </div>
    </div>
    {/* Main */}
    <div className="flex-1 p-3 space-y-2 bg-white">
      <SectionTitle className="text-[hsl(224,76%,33%)]">Experience</SectionTitle>
      <Lines count={3} className="bg-gray-200" />
      <Lines count={2} className="bg-gray-200" />
      <SectionTitle className="text-[hsl(224,76%,33%)] mt-1">Education</SectionTitle>
      <Lines count={2} className="bg-gray-200" />
    </div>
  </div>
);

const MinimalClean = () => (
  <div className="h-full bg-white p-4 flex flex-col gap-2">
    <Bar w="55%" className="bg-gray-800 h-[5px]!" />
    <Bar w="35%" className="bg-gray-400 h-[3px]!" />
    <div className="border-t border-gray-200 my-1" />
    <Lines count={3} className="bg-gray-200" />
    <div className="border-t border-gray-200 my-1" />
    <Lines count={2} className="bg-gray-200" />
    <div className="border-t border-gray-200 my-1" />
    <Lines count={2} className="bg-gray-100" />
  </div>
);

const CreativeDesigner = () => (
  <div className="h-full bg-white flex flex-col">
    <div className="bg-linear-to-r from-[hsl(160,84%,39%)] to-[hsl(190,80%,45%)] p-3 flex items-center gap-2">
      <Avatar accent="bg-white/40" />
      <div className="space-y-[2px]">
        <Bar w="60%" className="bg-white/80 h-[4px]!" />
        <Bar w="40%" className="bg-white/50" />
      </div>
    </div>
    <div className="p-3 space-y-2 flex-1">
      <SectionTitle className="text-[hsl(160,84%,39%)]">Experience</SectionTitle>
      <Lines count={3} className="bg-gray-200" />
      <SectionTitle className="text-[hsl(160,84%,39%)]">Skills</SectionTitle>
      {[90, 75, 65, 80].map((w, i) => (
        <SkillBar key={i} w={`${w}%`} bg="bg-emerald-100" fg="bg-[hsl(160,84%,39%)]" />
      ))}
    </div>
  </div>
);

const CorporateExecutive = () => (
  <div className="h-full bg-white flex flex-col">
    <div className="bg-[hsl(222,47%,11%)] p-3">
      <Bar w="55%" className="bg-white/80 h-[4px]!" />
      <Bar w="35%" className="bg-white/40 mt-[3px]" />
    </div>
    <div className="flex flex-1 p-3 gap-3">
      <div className="flex-1 space-y-2">
        <SectionTitle className="text-gray-700">Experience</SectionTitle>
        <Lines count={3} className="bg-gray-200" />
        <Lines count={2} className="bg-gray-200" />
      </div>
      <div className="w-px bg-gray-200" />
      <div className="w-[35%] space-y-2">
        <SectionTitle className="text-gray-700">Skills</SectionTitle>
        <div className="space-y-[3px]">
          {[1, 2, 3, 4].map((i) => (
            <Bar key={i} w="90%" className="bg-gray-200" />
          ))}
        </div>
        <SectionTitle className="text-gray-700">Education</SectionTitle>
        <Lines count={2} className="bg-gray-100" />
      </div>
    </div>
  </div>
);

const ElegantProfessional = () => (
  <div className="h-full bg-white p-4 flex flex-col gap-2">
    <div className="text-center space-y-[2px]">
      <Bar w="45%" className="bg-gray-800 h-[5px]! mx-auto" />
      <Bar w="30%" className="bg-amber-400/60 mx-auto" />
    </div>
    <div className="border-t border-amber-300/40 my-1" />
    <SectionTitle className="text-gray-600 font-serif italic">Experience</SectionTitle>
    <Lines count={3} className="bg-gray-200" />
    <div className="border-t border-amber-300/40 my-1" />
    <SectionTitle className="text-gray-600 font-serif italic">Education</SectionTitle>
    <Lines count={2} className="bg-gray-200" />
    <div className="border-t border-amber-300/40 my-1" />
    <SectionTitle className="text-gray-600 font-serif italic">Skills</SectionTitle>
    <Lines count={2} className="bg-gray-100" />
  </div>
);

const DeveloperTech = () => (
  <div className="h-full flex">
    <div className="w-[35%] bg-[hsl(222,47%,11%)] p-3 flex flex-col gap-2">
      <Avatar accent="bg-emerald-500/40" />
      <Bar w="60%" className="bg-white/60 h-[4px]!" />
      <Bar w="45%" className="bg-emerald-400/40" />
      <div className="mt-1 flex flex-wrap gap-[2px]">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <SkillTag key={i} className="bg-emerald-500/20" />
        ))}
      </div>
      <div className="mt-auto">
        <div className="text-[4px] text-emerald-400/60 font-mono">github.com/dev</div>
      </div>
    </div>
    <div className="flex-1 p-3 space-y-2 bg-white">
      <SectionTitle className="text-[hsl(222,47%,11%)] font-mono">Experience</SectionTitle>
      <Lines count={3} className="bg-gray-200" />
      <Lines count={2} className="bg-gray-200" />
      <SectionTitle className="text-[hsl(222,47%,11%)] font-mono">Projects</SectionTitle>
      <Lines count={2} className="bg-gray-100" />
    </div>
  </div>
);

const MarketingSpecialist = () => (
  <div className="h-full bg-white flex flex-col">
    <div className="p-3 flex items-center gap-2">
      <Avatar accent="bg-rose-400/40" />
      <div className="space-y-[2px]">
        <Bar w="65%" className="bg-gray-800 h-[4px]!" />
        <Bar w="40%" className="bg-rose-400/50" />
      </div>
    </div>
    <div className="px-3 pb-3 space-y-2 flex-1">
      <SectionTitle className="text-rose-500">Achievements</SectionTitle>
      <div className="flex gap-1">
        {["bg-rose-100", "bg-amber-100", "bg-sky-100"].map((bg, i) => (
          <div key={i} className={`flex-1 rounded-[3px] h-5 ${bg}`} />
        ))}
      </div>
      <SectionTitle className="text-rose-500">Experience</SectionTitle>
      <Lines count={3} className="bg-gray-200" />
      <SectionTitle className="text-rose-500">Skills</SectionTitle>
      <div className="flex flex-wrap gap-[2px]">
        {[1, 2, 3, 4, 5].map((i) => (
          <SkillTag key={i} className="bg-rose-100" />
        ))}
      </div>
    </div>
  </div>
);

const SimpleATS = () => (
  <div className="h-full bg-white p-4 flex flex-col gap-[6px]">
    <Bar w="50%" className="bg-gray-900 h-[5px]!" />
    <Bar w="100%" className="bg-gray-300 h-px!" />
    <div className="flex gap-2">
      <Bar w="30%" className="bg-gray-300" />
      <Bar w="30%" className="bg-gray-300" />
      <Bar w="25%" className="bg-gray-300" />
    </div>
    <Bar w="100%" className="bg-gray-300 h-px!" />
    <SectionTitle className="text-gray-800">Professional Experience</SectionTitle>
    <Lines count={4} className="bg-gray-200" />
    <SectionTitle className="text-gray-800">Education</SectionTitle>
    <Lines count={2} className="bg-gray-200" />
    <SectionTitle className="text-gray-800">Skills</SectionTitle>
    <Lines count={2} className="bg-gray-100" />
  </div>
);

/* ──────────────────── Export map ──────────────────── */

export const templatePreviews: Record<string, () => React.ReactNode> = {
  "Modern Professional": ModernProfessional,
  "Minimal Clean": MinimalClean,
  "Creative Resume": CreativeDesigner,
  "Corporate Resume": CorporateExecutive,
  "Elegant Resume": ElegantProfessional,
  "Developer Resume": DeveloperTech,
  "Marketing Resume": MarketingSpecialist,
  "Simple ATS Resume": SimpleATS,
};

export default function ResumeTemplatePreview({ name }: { name: string }) {
  const Preview = templatePreviews[name] as any;
  if (!Preview) return null;
  return (
    <div className="aspect-3/4 w-full overflow-hidden rounded-md shadow-inner border border-border/30 bg-muted">
      <Preview />
    </div>
  );
}
