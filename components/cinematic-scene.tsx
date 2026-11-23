import type { MissionScene } from "@/lib/types"
import { cn } from "@/lib/utils"

const SCENES: Record<
  MissionScene,
  { className: string; labelHe: string; ornament: string }
> = {
  airport: {
    className: "from-slate-900 via-sky-950 to-amber-900",
    labelHe: "נתב״ג",
    ornament: "✈",
  },
  taxi: {
    className: "from-zinc-950 via-yellow-950 to-orange-900",
    labelHe: "מונית",
    ornament: "●",
  },
  bank: {
    className: "from-slate-950 via-emerald-950 to-teal-900",
    labelHe: "בנק",
    ornament: "₪",
  },
  clinic: {
    className: "from-sky-950 via-cyan-950 to-white/10",
    labelHe: "קופת חולים",
    ornament: "+",
  },
  office: {
    className: "from-stone-950 via-amber-950 to-yellow-900",
    labelHe: "משרד",
    ornament: "▣",
  },
  ulpan: {
    className: "from-indigo-950 via-blue-950 to-orange-900",
    labelHe: "אולפן",
    ornament: "א",
  },
  grocery: {
    className: "from-lime-950 via-green-950 to-yellow-900",
    labelHe: "סופר",
    ornament: "▣",
  },
  park: {
    className: "from-emerald-950 via-green-900 to-lime-800",
    labelHe: "פארק",
    ornament: "❀",
  },
  rental: {
    className: "from-zinc-950 via-sky-950 to-cyan-800",
    labelHe: "השכרת רכב",
    ornament: "▣",
  },
  fuel: {
    className: "from-neutral-950 via-orange-950 to-amber-800",
    labelHe: "דלק",
    ornament: "95",
  },
  road: {
    className: "from-slate-950 via-blue-950 to-sky-800",
    labelHe: "כביש",
    ornament: "→",
  },
  parking: {
    className: "from-blue-950 via-sky-900 to-white/20",
    labelHe: "חניה",
    ornament: "P",
  },
  police: {
    className: "from-blue-950 via-slate-900 to-red-950",
    labelHe: "משטרה",
    ornament: "★",
  },
  crash: {
    className: "from-red-950 via-orange-950 to-amber-900",
    labelHe: "תאונה",
    ornament: "!",
  },
  cafe: {
    className: "from-stone-950 via-orange-950 to-amber-800",
    labelHe: "בית קפה",
    ornament: "☕",
  },
  shuk: {
    className: "from-red-950 via-orange-900 to-yellow-800",
    labelHe: "שוק",
    ornament: "◆",
  },
  bus: {
    className: "from-green-950 via-emerald-900 to-lime-800",
    labelHe: "תחנה",
    ornament: "▶",
  },
  beach: {
    className: "from-sky-950 via-cyan-800 to-amber-700",
    labelHe: "חוף",
    ornament: "≈",
  },
}

export function sceneMeta(scene?: MissionScene) {
  return SCENES[scene ?? "road"] ?? SCENES.road
}

export function CinematicScene({
  scene = "road",
  children,
  className,
  showChrome = true,
}: {
  scene?: MissionScene
  children: React.ReactNode
  className?: string
  showChrome?: boolean
}) {
  const palette = SCENES[scene] ?? SCENES.road
  return (
    <div
      className={cn(
        "relative isolate flex min-h-0 flex-1 flex-col overflow-hidden bg-linear-to-br",
        palette.className,
        className
      )}
    >
      <div className="pointer-events-none absolute inset-0 opacity-40">
        <div className="absolute -top-24 start-1/2 size-[28rem] -translate-x-1/2 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-20 -end-10 size-72 rounded-full bg-amber-400/20 blur-3xl" />
      </div>
      {showChrome ? (
        <>
          <div className="pointer-events-none absolute top-6 start-6 font-heading text-6xl text-white/15 md:text-8xl">
            {palette.ornament}
          </div>
          <p className="pointer-events-none absolute top-7 end-6 text-xs tracking-[0.2em] text-white/50 uppercase">
            {palette.labelHe}
          </p>
        </>
      ) : (
        <div className="pointer-events-none absolute -bottom-16 -start-10 font-heading text-[9rem] leading-none text-white/[0.07]">
          {palette.ornament}
        </div>
      )}
      <div className="relative z-10 flex min-h-0 flex-1 flex-col">{children}</div>
    </div>
  )
}
