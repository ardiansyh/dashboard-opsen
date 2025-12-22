import { cn } from "@/lib/utils"
import type { KegiatanStatus } from "@/lib/mock-data"

const statusConfig: Record<KegiatanStatus, { label: string; className: string }> = {
  draft: {
    label: "Draft",
    className: "bg-secondary text-secondary-foreground",
  },
  diajukan: {
    label: "Diajukan",
    className: "bg-info/20 text-info",
  },
  divalidasi: {
    label: "Divalidasi",
    className: "bg-success/20 text-success",
  },
  ditolak: {
    label: "Ditolak",
    className: "bg-error/20 text-error",
  },
}

export function StatusBadge({ status }: { status: KegiatanStatus }) {
  const config = statusConfig[status]
  return (
    <span className={cn("inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium", config.className)}>
      {config.label}
    </span>
  )
}
