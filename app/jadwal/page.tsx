import { Sidebar } from "@/components/sidebar"
import { JadwalTable } from "@/components/jadwal-table"
import { CalendarDays } from "lucide-react"

export default function JadwalPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="ml-64 flex-1 p-6">
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <CalendarDays className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Jadwal Kegiatan</h1>
              <p className="text-sm text-muted-foreground">
                Rencana jadwal kegiatan rolesharing Kabupaten/Kota Tahun 2025
              </p>
            </div>
          </div>
        </div>

        <JadwalTable />
      </main>
    </div>
  )
}
