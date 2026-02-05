"use client"

import { useState, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { KegiatanTable } from "@/components/kegiatan-table"
import { KegiatanForm } from "@/components/kegiatan-form"
import { Button } from "@/components/ui/button"
import { mockKegiatan, mockRealisasiOutput, type Kegiatan, type RealisasiOutput } from "@/lib/mock-data"
import { RekapKegiatan } from "@/components/rekap-kegiatan"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus, BarChart3, List, FileText, Target, Wallet, Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function KegiatanPage() {
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>(mockKegiatan)
  const [realisasiData, setRealisasiData] = useState<RealisasiOutput[]>(mockRealisasiOutput)
  const [formOpen, setFormOpen] = useState(false)
  const [editingKegiatan, setEditingKegiatan] = useState<Kegiatan | null>(null)
  const [selectedYear, setSelectedYear] = useState<string>("all")

  // Get available years from kegiatan data
  const availableYears = useMemo(() => {
    const years = new Set<number>()
    kegiatan.forEach((k) => {
      if (k.jadwalMulai) {
        years.add(new Date(k.jadwalMulai).getFullYear())
      }
      if (k.jadwalSelesai) {
        years.add(new Date(k.jadwalSelesai).getFullYear())
      }
    })
    return Array.from(years).sort((a, b) => b - a)
  }, [kegiatan])

  // Filter kegiatan by year
  const filteredKegiatan = useMemo(() => {
    if (selectedYear === "all") return kegiatan
    const year = parseInt(selectedYear)
    return kegiatan.filter((k) => {
      const startYear = k.jadwalMulai ? new Date(k.jadwalMulai).getFullYear() : null
      const endYear = k.jadwalSelesai ? new Date(k.jadwalSelesai).getFullYear() : null
      return startYear === year || endYear === year || (startYear && endYear && startYear <= year && year <= endYear)
    })
  }, [kegiatan, selectedYear])

  // Filter realisasi by kegiatan ids
  const filteredRealisasi = useMemo(() => {
    const kegiatanIds = new Set(filteredKegiatan.map((k) => k.id))
    return realisasiData.filter((r) => kegiatanIds.has(r.kegiatanId))
  }, [filteredKegiatan, realisasiData])

  const stats = useMemo(() => ({
    total: filteredKegiatan.length,
    divalidasi: filteredKegiatan.filter((k) => k.status === "divalidasi").length,
    diajukan: filteredKegiatan.filter((k) => k.status === "diajukan").length,
    ditolak: filteredKegiatan.filter((k) => k.status === "ditolak").length,
    draft: filteredKegiatan.filter((k) => k.status === "draft").length,
  }), [filteredKegiatan])

  // Calculate total target output by satuan
  const targetOutputSummary = useMemo(() => filteredKegiatan.reduce((acc, k) => {
    if (k.targetMingguan && k.targetMingguan.length > 0) {
      const satuan = k.targetMingguan[0].satuan
      const totalTarget = k.targetMingguan.reduce((sum, t) => sum + t.target, 0)
      if (!acc[satuan]) {
        acc[satuan] = 0
      }
      acc[satuan] += totalTarget
    }
    return acc
  }, {} as Record<string, number>), [filteredKegiatan])

  // Calculate total anggaran
  const totalAnggaran = useMemo(() => filteredKegiatan.reduce((sum, k) => sum + k.paguAnggaran, 0), [filteredKegiatan])
  const totalRealisasi = useMemo(() => filteredRealisasi.reduce((sum, r) => sum + (r.realisasiAnggaran || 0), 0), [filteredRealisasi])

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
            <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-4">
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
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Select value={selectedYear} onValueChange={setSelectedYear}>
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Pilih Tahun" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Semua Tahun</SelectItem>
                      {availableYears.map((year) => (
                        <SelectItem key={year} value={year.toString()}>
                          Tahun {year}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <FileText className="h-4 w-4" />
                <span>
                  {selectedYear === "all" 
                    ? `Total ${filteredKegiatan.length} kegiatan terdaftar`
                    : `${filteredKegiatan.length} kegiatan tahun ${selectedYear}`}
                </span>
              </div>
            </div>

            <TabsContent value="rekap" className="mt-0">
              <RekapKegiatan kegiatan={filteredKegiatan} realisasiData={filteredRealisasi} />
            </TabsContent>

            <TabsContent value="list" className="mt-0">
              <div className="space-y-6">
                {/* Summary Cards */}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardDescription>Total Anggaran</CardDescription>
                      <Wallet className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {totalAnggaran >= 1000000000
                          ? `Rp ${(totalAnggaran / 1000000000).toFixed(1)} M`
                          : `Rp ${(totalAnggaran / 1000000).toFixed(0)} Jt`}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Realisasi: {totalRealisasi >= 1000000000
                          ? `Rp ${(totalRealisasi / 1000000000).toFixed(1)} M`
                          : `Rp ${(totalRealisasi / 1000000).toFixed(0)} Jt`} ({totalAnggaran > 0 ? ((totalRealisasi / totalAnggaran) * 100).toFixed(1) : 0}%)
                      </p>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardDescription>Target Output</CardDescription>
                      <Target className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {Object.entries(targetOutputSummary).slice(0, 3).map(([satuan, total]) => (
                          <div key={satuan} className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">{satuan}</span>
                            <span className="font-semibold">{total.toLocaleString("id-ID")}</span>
                          </div>
                        ))}
                        {Object.keys(targetOutputSummary).length === 0 && (
                          <p className="text-sm text-muted-foreground">Belum ada target</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardDescription>Status Kegiatan</CardDescription>
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-success" />
                          <span className="text-sm">{stats.divalidasi} Valid</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-info" />
                          <span className="text-sm">{stats.diajukan} Diajukan</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-muted-foreground" />
                          <span className="text-sm">{stats.draft} Draft</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="h-2 w-2 rounded-full bg-error" />
                          <span className="text-sm">{stats.ditolak} Ditolak</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                  <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                      <CardDescription>Wilayah Aktif</CardDescription>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">
                        {new Set(kegiatan.map(k => k.kabupatenKota)).size}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Kabupaten/Kota dengan kegiatan aktif
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Kegiatan Table */}
                <div className="rounded-lg border border-border bg-card">
                  <div className="border-b border-border px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h2 className="text-lg font-semibold">Daftar Kegiatan Rolesharing</h2>
                        <p className="text-sm text-muted-foreground">
                          Kelola dan pantau status kegiatan per kabupaten/kota
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <KegiatanTable data={filteredKegiatan} onView={handleView} onEdit={handleEdit} realisasiData={filteredRealisasi} />
                  </div>
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
