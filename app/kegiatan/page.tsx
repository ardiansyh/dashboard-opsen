"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { KegiatanTable } from "@/components/kegiatan-table"
import { KegiatanForm } from "@/components/kegiatan-form"
import { StatsCard } from "@/components/stats-card"
import { Button } from "@/components/ui/button"
import { mockKegiatan, mockRealisasiOutput, type Kegiatan, type RealisasiOutput } from "@/lib/mock-data"
import { Plus, FolderKanban, CheckCircle, Clock, XCircle } from "lucide-react"

export default function KegiatanPage() {
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>(mockKegiatan)
  const [realisasiData, setRealisasiData] = useState<RealisasiOutput[]>(mockRealisasiOutput)
  const [formOpen, setFormOpen] = useState(false)
  const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | null>(null)

  const stats = {
    total: kegiatan.length,
    divalidasi: kegiatan.filter((k) => k.status === "divalidasi").length,
    diajukan: kegiatan.filter((k) => k.status === "diajukan").length,
    ditolak: kegiatan.filter((k) => k.status === "ditolak").length,
  }

  const handleView = (item: Kegiatan) => {
    // Navigation handled in KegiatanTable component
  }

  const handleEdit = (item: Kegiatan) => {
    setEditingKegiatan(item)
    setFormOpen(true)
  }

  const handleAddNew = () => {
    setEditingKegiatan(null)
    setFormOpen(true)
  }

  const handleFormSubmit = (data: Partial<Kegiatan>) => {
    if (editingKegiatan) {
      setKegiatan((prev) => prev.map((k) => (k.id === editingKegiatan.id ? { ...k, ...data } : k)))
    } else {
      const newKegiatan: Kegiatan = {
        id: `KG${String(kegiatan.length + 1).padStart(3, "0")}`,
        namaKegiatan: data.namaKegiatan || "",
        jenisKegiatan: data.jenisKegiatan || "",
        kategori: data.kategori || "prioritas",
        kabupatenKota: data.kabupatenKota || "",
        paguAnggaran: data.paguAnggaran || 0,
        targetOutput: data.targetOutput || "",
        jadwalMulai: data.jadwalMulai || "",
        jadwalSelesai: data.jadwalSelesai || "",
        status: "draft",
        tanggalPengajuan: new Date().toISOString().split("T")[0],
        targetMingguan: data.targetMingguan || [],
      }
      setKegiatan((prev) => [...prev, newKegiatan])
    }
    setEditingKegiatan(null)
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64">
        <div className="border-b border-border">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-semibold">Daftar Kegiatan</h1>
              <p className="text-sm text-muted-foreground">Kelola kegiatan rolesharing opsen</p>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kegiatan
            </Button>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <StatsCard title="Total Kegiatan" value={stats.total} icon={FolderKanban} variant="primary" />
            <StatsCard title="Tervalidasi" value={stats.divalidasi} icon={CheckCircle} variant="success" />
            <StatsCard title="Menunggu Validasi" value={stats.diajukan} icon={Clock} variant="info" />
            <StatsCard title="Ditolak" value={stats.ditolak} icon={XCircle} variant="error" />
          </div>

          <div className="rounded-lg border border-border bg-card p-6">
            <KegiatanTable data={kegiatan} onView={handleView} onEdit={handleEdit} realisasiData={realisasiData} />
          </div>
        </div>
      </main>

      <KegiatanForm open={formOpen} onOpenChange={setFormOpen} kegiatan={editingKegiatan} onSubmit={handleFormSubmit} />
    </div>
  )
}
