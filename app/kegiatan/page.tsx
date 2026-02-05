"use client"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"
import { KegiatanTable } from "@/components/kegiatan-table"
import { KegiatanForm } from "@/components/kegiatan-form"
import { Button } from "@/components/ui/button"
import { mockKegiatan, mockRealisasiOutput, type Kegiatan, type RealisasiOutput } from "@/lib/mock-data"
import { RekapKegiatan } from "@/components/rekap-kegiatan"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, BarChart3, List, FileText, FolderKanban, CheckCircle, Clock, XCircle } from "lucide-react"

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
        <div className="border-b border-border bg-card/50">
          <div className="flex h-16 items-center justify-between px-6">
            <div>
              <h1 className="text-xl font-semibold">Manajemen Kegiatan Rolesharing</h1>
              <p className="text-sm text-muted-foreground">Rekapitulasi dan pengelolaan kegiatan opsen PKB/BBNKB</p>
            </div>
            <Button onClick={handleAddNew}>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Kegiatan
            </Button>
          </div>
        </div>

        <div className="p-6">
          <Tabs defaultValue="rekap" className="w-full">
            <div className="mb-6 flex items-center justify-between">
              <TabsList>
                <TabsTrigger value="rekap" className="gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Rekapitulasi
                </TabsTrigger>
                <TabsTrigger value="list" className="gap-2">
                  <List className="h-4 w-4" />
                  Daftar Kegiatan
                </TabsTrigger>
              </TabsList>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>Total {kegiatan.length} kegiatan terdaftar</span>
              </div>
            </div>

            <TabsContent value="rekap" className="mt-0">
              <RekapKegiatan kegiatan={kegiatan} realisasiData={realisasiData} />
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <div className="rounded-lg border border-border bg-card">
                <div className="border-b border-border px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-lg font-semibold">Daftar Kegiatan Rolesharing</h2>
                      <p className="text-sm text-muted-foreground">
                        Kelola dan pantau status kegiatan per kabupaten/kota
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5 rounded-md bg-success/10 px-3 py-1.5">
                        <div className="h-2 w-2 rounded-full bg-success" />
                        <span className="text-xs font-medium text-success">{stats.divalidasi} Tervalidasi</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-md bg-info/10 px-3 py-1.5">
                        <div className="h-2 w-2 rounded-full bg-info" />
                        <span className="text-xs font-medium text-info">{stats.diajukan} Diajukan</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5">
                        <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                        <span className="text-xs font-medium text-muted-foreground">{kegiatan.filter(k => k.status === 'draft').length} Draft</span>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-md bg-error/10 px-3 py-1.5">
                        <div className="h-2 w-2 rounded-full bg-error" />
                        <span className="text-xs font-medium text-error">{stats.ditolak} Ditolak</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="p-6">
                  <KegiatanTable data={kegiatan} onView={handleView} onEdit={handleEdit} realisasiData={realisasiData} />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <KegiatanForm open={formOpen} onOpenChange={setFormOpen} kegiatan={editingKegiatan} onSubmit={handleFormSubmit} />
    </div>
  )
}
