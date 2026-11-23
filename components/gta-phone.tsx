"use client"

import { XIcon } from "lucide-react"

import { Dashboard } from "@/components/dashboard"
import { Button } from "@/components/ui/button"
import { UI } from "@/lib/copy"
import type { Mission } from "@/lib/types"

export function GtaPhone({
  open,
  onClose,
  onPlayMission,
}: {
  open: boolean
  onClose: () => void
  onPlayMission: (mission: Mission) => void
}) {
  if (!open) return null
  return (
    <div
      className="absolute inset-0 z-40 overflow-y-auto bg-black/80 p-3 backdrop-blur-sm md:p-6"
      data-testid="gta-phone-panel"
    >
      <div className="mx-auto w-full max-w-5xl">
        <div className="mb-3 flex items-center justify-between">
          <p className="font-heading text-lg text-white">{UI.phone.he}</p>
          <Button
            variant="secondary"
            size="sm"
            onClick={onClose}
            data-testid="gta-phone-close"
          >
            <XIcon data-icon="inline-start" />
            {UI.close.he}
          </Button>
        </div>
        <Dashboard embedded onPlayMission={onPlayMission} />
      </div>
    </div>
  )
}
