"use client"

import dynamic from "next/dynamic"

import { UI } from "@/lib/copy"

const GtaWorld = dynamic(
  () => import("@/components/gta-world").then((mod) => mod.GtaWorld),
  {
    ssr: false,
    loading: () => (
      <div className="flex flex-1 items-center justify-center bg-[#123322] text-white">
        <p className="font-heading text-xl">{UI.loading.he}</p>
      </div>
    ),
  }
)

export default function HomePage() {
  return <GtaWorld />
}
