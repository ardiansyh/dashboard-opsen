import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatsCardProps {
  title: string
  value: string | number
  icon: LucideIcon
  trend?: {
    value: number
    label: string
  }
  className?: string
  variant?: "default" | "primary" | "info" | "success" | "warning" | "error"
}

const variantStyles = {
  default: {
    icon: "bg-secondary text-secondary-foreground",
  },
  primary: {
    icon: "bg-primary/20 text-primary",
  },
  info: {
    icon: "bg-info/20 text-info",
  },
  success: {
    icon: "bg-success/20 text-success",
  },
  warning: {
    icon: "bg-warning/20 text-warning",
  },
  error: {
    icon: "bg-error/20 text-error",
  },
}

export function StatsCard({ title, value, icon: Icon, trend, className, variant = "default" }: StatsCardProps) {
  const styles = variantStyles[variant]

  return (
    <Card className={cn("border-border bg-card", className)}>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-semibold">{value}</p>
            {trend && (
              <p className={cn("text-xs", trend.value >= 0 ? "text-success" : "text-error")}>
                {trend.value >= 0 ? "+" : ""}
                {trend.value}% {trend.label}
              </p>
            )}
          </div>
          <div className={cn("flex h-12 w-12 items-center justify-center rounded-lg", styles.icon)}>
            <Icon className="h-6 w-6" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
