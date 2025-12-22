"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { LayoutDashboard, FolderKanban, ClipboardList, FileCheck, Bell, Settings, CalendarDays } from "lucide-react"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"

const menuItems = [
  {
    label: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Daftar Kegiatan",
    href: "/kegiatan",
    icon: FolderKanban,
  },
  {
    label: "Jadwal Kegiatan",
    href: "/jadwal",
    icon: CalendarDays,
  },
  {
    label: "Pengajuan Data",
    href: "/pengajuan",
    icon: ClipboardList,
  },
  {
    label: "Validasi",
    href: "/validasi",
    icon: FileCheck,
  },
  {
    label: "Notifikasi",
    href: "/notifikasi",
    icon: Bell,
  },
  {
    label: "Pengaturan",
    href: "/pengaturan",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-border bg-card">
      <div className="flex h-16 items-center justify-between border-b border-border px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <span className="text-sm font-bold text-primary-foreground">O</span>
          </div>
          <span className="text-lg font-semibold">Dashboard Opsen</span>
        </div>
        <ThemeToggle />
      </div>
      <nav className="flex flex-col gap-1 p-4">
        {menuItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                isActive
                  ? "bg-secondary text-foreground"
                  : "text-muted-foreground hover:bg-secondary hover:text-foreground",
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          )
        })}
      </nav>
      <div className="absolute bottom-0 left-0 right-0 border-t border-border p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary">
            <span className="text-sm font-medium">AP</span>
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium">Admin Provinsi</span>
            <span className="text-xs text-muted-foreground">Jawa Barat</span>
          </div>
        </div>
      </div>
    </aside>
  )
}
