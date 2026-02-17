"use client"

import { useParams, useRouter } from "next/navigation"
import { useState, useMemo } from "react"
import { Sidebar } from "@/components/sidebar"
import { StatusBadge } from "@/components/status-badge"
import { RealisasiForm } from "@/components/realisasi-form"
import { RealisasiList } from "@/components/realisasi-list"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { Progress } from "@/components/ui/progress"
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Target,
  Wallet,
  Send,
  FileText,
  ClipboardList,
  CalendarDays,
  TrendingUp,
} from "lucide-react"
import { mockKegiatan, mockRealisasiOutput, type RealisasiOutput, kegiatanHasTargetMingguan, kegiatanHasRealisasiOutput } from "@/lib/mock-data"

// Helper functions for ISO Week calculation
function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

function getISOWeekStart(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const weekStart = new Date(jan4)
  weekStart.setDate(jan4.getDate() - dayOfWeek + 1 + (week - 1) * 7)
  return weekStart
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
}

const namaBulan = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]

export default function KegiatanDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [realisasiData, setRealisasiData] = useState<RealisasiOutput[]>(mockRealisasiOutput)
  const [realisasiFormOpen, setRealisasiFormOpen] = useState(false)
  const [activeTab, setActiveTab] = useState("overview")
  const [selectedBulanFilter, setSelectedBulanFilter] = useState<number>(0) // 0 = Januari

  const kegiatan = mockKegiatan.find((k) => k.id === id)

  const tahunAnggaran = kegiatan?.jadwalMulai ? new Date(kegiatan.jadwalMulai).getFullYear() : new Date().getFullYear()

  const filteredTargetMingguan = useMemo(() => {
    if (!kegiatan?.targetMingguan) return []
    const filterMonth = `${tahunAnggaran}-${String(selectedBulanFilter + 1).padStart(2, "0")}`
    return kegiatan.targetMingguan.filter((t) => t.bulan === filterMonth)
  }, [kegiatan, selectedBulanFilter, tahunAnggaran])

  const kegiatanRealisasi = useMemo(() => {
    return realisasiData.filter((r) => r.kegiatanId === id)
  }, [realisasiData, id])

  // Calculate totals
  const totalRealisasiAnggaran = kegiatanRealisasi.reduce((sum, r) => sum + (r.realisasiAnggaran || 0), 0)
  const totalRealisasiOutput = kegiatanRealisasi.reduce((sum, r) => sum + (r.realisasiOutput || 0), 0)

  if (!kegiatan) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar />
        <main className="pl-64">
          <div className="flex h-screen items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-semibold">Kegiatan tidak ditemukan</h1>
              <p className="mt-2 text-muted-foreground">Kegiatan dengan ID {id} tidak ada dalam sistem.</p>
              <Button className="mt-4" onClick={() => router.push("/kegiatan")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Kembali ke Daftar Kegiatan
              </Button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const handleRealisasiSubmit = (data: Omit<RealisasiOutput, "id" | "tanggalLapor">) => {
    const newRealisasi: RealisasiOutput = {
      ...data,
      id: `RO${String(realisasiData.length + 1).padStart(3, "0")}`,
      tanggalLapor: new Date().toISOString().split("T")[0],
    }
    setRealisasiData((prev) => [...prev, newRealisasi])
  }

  const handleSubmitPengajuan = () => {
    // In real app, this would update the database
    router.push("/kegiatan")
  }

  // Calculate progress percentage
  const anggaranProgress = kegiatan.paguAnggaran > 0 ? (totalRealisasiAnggaran / kegiatan.paguAnggaran) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      <Sidebar />
      <main className="pl-64">
        {/* Header */}
        <div className="border-b border-border bg-card">
          <div className="px-6 py-4">
            <Button variant="ghost" size="sm" className="mb-4" onClick={() => router.push("/kegiatan")}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Kembali ke Daftar
            </Button>

            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm text-muted-foreground">{kegiatan.id}</span>
                  <StatusBadge status={kegiatan.status} />
                  <Badge variant={kegiatan.kategori === "prioritas" ? "default" : "secondary"}>
                    {kegiatan.kategori === "prioritas" ? "Prioritas" : "Pendukung"}
                  </Badge>
                </div>
                <h1 className="text-2xl font-semibold">{kegiatan.namaKegiatan}</h1>
                <p className="text-muted-foreground">{kegiatan.jenisKegiatan}</p>
              </div>

              <div className="flex gap-2">
                {kegiatan.status === "divalidasi" && (
                  <Button onClick={() => setRealisasiFormOpen(true)}>
                    <ClipboardList className="mr-2 h-4 w-4" />
                    Lapor Realisasi
                  </Button>
                )}
                {kegiatan.status === "draft" && (
                  <Button onClick={handleSubmitPengajuan}>
                    <Send className="mr-2 h-4 w-4" />
                    Ajukan untuk Validasi
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
            <TabsList>
              <TabsTrigger value="overview">Ringkasan</TabsTrigger>
              {kegiatanHasTargetMingguan(kegiatan.jenisKegiatan) && (
                <TabsTrigger value="target">Target Mingguan</TabsTrigger>
              )}
              {kegiatan.status === "divalidasi" && (
                <TabsTrigger value="realisasi">
                  Realisasi
                  {kegiatanRealisasi.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                      {kegiatanRealisasi.length}
                    </Badge>
                  )}
                </TabsTrigger>
              )}
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Pagu Anggaran</CardTitle>
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{formatCurrency(kegiatan.paguAnggaran)}</div>
                    {kegiatan.status === "divalidasi" && (
                      <div className="mt-2 space-y-1">
                        <Progress value={anggaranProgress} className="h-2" />
                        <p className="text-xs text-muted-foreground">
                          Realisasi: {formatCurrency(totalRealisasiAnggaran)} ({anggaranProgress.toFixed(1)}%)
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Target Output</CardTitle>
                    <Target className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kegiatan.targetOutput}</div>
                    {!kegiatanHasRealisasiOutput(kegiatan.jenisKegiatan) ? (
                      <p className="mt-2 text-xs text-muted-foreground italic">Hanya melaporkan realisasi anggaran</p>
                    ) : kegiatan.status === "divalidasi" && totalRealisasiOutput > 0 ? (
                      <p className="mt-2 text-xs text-muted-foreground">Realisasi: {totalRealisasiOutput}</p>
                    ) : null}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Kabupaten/Kota</CardTitle>
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{kegiatan.kabupatenKota}</div>
                    <p className="mt-2 text-xs text-muted-foreground">Provinsi Jawa Barat</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Periode Pelaksanaan</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-lg font-bold">
                      {new Date(kegiatan.jadwalMulai).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      s.d.{" "}
                      {new Date(kegiatan.jadwalSelesai).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Detail Information */}
              <div className="grid gap-6 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <FileText className="h-5 w-5" />
                      Informasi Kegiatan
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Jenis Kegiatan</p>
                      <p className="font-medium">{kegiatan.jenisKegiatan}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Kategori</p>
                      <p className="font-medium">{kegiatan.kategori === "prioritas" ? "Prioritas" : "Pendukung"}</p>
                    </div>
                    <Separator />
                    <div>
                      <p className="text-sm text-muted-foreground">Tanggal Pengajuan</p>
                      <p className="font-medium">{formatDate(kegiatan.tanggalPengajuan)}</p>
                    </div>
                    {kegiatan.keterangan && (
                      <>
                        <Separator />
                        <div>
                          <p className="text-sm text-muted-foreground">Keterangan</p>
                          <p className="font-medium text-destructive">{kegiatan.keterangan}</p>
                        </div>
                      </>
                    )}
                  </CardContent>
                </Card>

                {kegiatanHasTargetMingguan(kegiatan.jenisKegiatan) ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Ringkasan Target Mingguan
                      </CardTitle>
                      <CardDescription>
                        Total {kegiatan.targetMingguan?.length || 0} target mingguan terdaftar
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {kegiatan.targetMingguan && kegiatan.targetMingguan.length > 0 ? (
                        <div className="space-y-3">
                          {Array.from(new Set(kegiatan.targetMingguan.map((t) => t.bulan)))
                            .slice(0, 4)
                            .map((bulan) => {
                              const monthTargets = kegiatan.targetMingguan!.filter((t) => t.bulan === bulan)
                              const totalTarget = monthTargets.reduce((sum, t) => sum + t.target, 0)
                              const monthIndex = Number.parseInt(bulan.split("-")[1]) - 1
                              return (
                                <div key={bulan} className="flex items-center justify-between rounded-lg bg-muted/50 p-3">
                                  <div>
                                    <p className="font-medium">{namaBulan[monthIndex]}</p>
                                    <p className="text-xs text-muted-foreground">{monthTargets.length} minggu</p>
                                  </div>
                                  <div className="text-right">
                                    <p className="font-semibold">{totalTarget.toLocaleString("id-ID")}</p>
                                    <p className="text-xs text-muted-foreground">{monthTargets[0]?.satuan || "Unit"}</p>
                                  </div>
                                </div>
                              )
                            })}
                          {kegiatan.targetMingguan.length > 4 && (
                            <Button variant="ghost" className="w-full text-sm" onClick={() => setActiveTab("target")}>
                              Lihat semua target mingguan
                            </Button>
                          )}
                        </div>
                      ) : (
                        <p className="text-center text-muted-foreground py-8">Belum ada target mingguan</p>
                      )}
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <FileText className="h-5 w-5" />
                        Informasi Output
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {kegiatanHasRealisasiOutput(kegiatan.jenisKegiatan)
                          ? "Kegiatan ini memiliki target output deskriptif tanpa breakdown mingguan. Realisasi output dilaporkan secara bulanan."
                          : "Kegiatan ini hanya melaporkan realisasi anggaran tanpa target output terukur."}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            </TabsContent>

            {/* Target Mingguan Tab */}
            {kegiatanHasTargetMingguan(kegiatan.jenisKegiatan) && <TabsContent value="target" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CalendarDays className="h-5 w-5" />
                    Target Output Mingguan
                  </CardTitle>
                  <CardDescription>
                    Tahun Anggaran {tahunAnggaran} - Pilih bulan untuk melihat target mingguan
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Month Filter */}
                  <div className="flex flex-wrap gap-2">
                    {namaBulan.map((bulan, index) => (
                      <Button
                        key={index}
                        variant={selectedBulanFilter === index ? "default" : "outline"}
                        size="sm"
                        onClick={() => setSelectedBulanFilter(index)}
                      >
                        {bulan.slice(0, 3)}
                      </Button>
                    ))}
                  </div>

                  <Separator />

                  {/* Target List */}
                  <div>
                    <div className="mb-4 flex items-center justify-between">
                      <h4 className="font-medium">
                        Target Bulan {namaBulan[selectedBulanFilter]} {tahunAnggaran}
                      </h4>
                      <Badge variant="secondary">{filteredTargetMingguan.length} target</Badge>
                    </div>

                    {filteredTargetMingguan.length > 0 ? (
                      <div className="space-y-3">
                        {filteredTargetMingguan
                          .sort((a, b) => a.mingguKe - b.mingguKe)
                          .map((target, index) => {
                            const weekStart = getISOWeekStart(tahunAnggaran, target.mingguKe)
                            const weekEnd = new Date(weekStart)
                            weekEnd.setDate(weekEnd.getDate() + 6)

                            return (
                              <div
                                key={index}
                                className="flex items-center justify-between rounded-lg border border-border bg-card p-4"
                              >
                                <div className="flex items-center gap-4">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary font-semibold">
                                    W{target.mingguKe}
                                  </div>
                                  <div>
                                    <p className="font-medium">Minggu {target.mingguKe}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {formatShortDate(weekStart)} - {formatShortDate(weekEnd)}
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="text-2xl font-bold">{target.target.toLocaleString("id-ID")}</p>
                                  <p className="text-sm text-muted-foreground">{target.satuan}</p>
                                </div>
                              </div>
                            )
                          })}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-12">
                        <CalendarDays className="mb-4 h-12 w-12 text-muted-foreground/50" />
                        <p className="text-muted-foreground">
                          Tidak ada target untuk bulan {namaBulan[selectedBulanFilter]}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Summary */}
                  {kegiatan.targetMingguan && kegiatan.targetMingguan.length > 0 && (
                    <>
                      <Separator />
                      <div className="rounded-lg bg-muted/50 p-4">
                        <h4 className="mb-3 font-medium">Ringkasan Total Target</h4>
                        <div className="grid gap-4 md:grid-cols-3">
                          <div>
                            <p className="text-sm text-muted-foreground">Total Minggu</p>
                            <p className="text-xl font-semibold">{kegiatan.targetMingguan.length} minggu</p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Total Target</p>
                            <p className="text-xl font-semibold">
                              {kegiatan.targetMingguan.reduce((sum, t) => sum + t.target, 0).toLocaleString("id-ID")}
                            </p>
                          </div>
                          <div>
                            <p className="text-sm text-muted-foreground">Rata-rata per Minggu</p>
                            <p className="text-xl font-semibold">
                              {Math.round(
                                kegiatan.targetMingguan.reduce((sum, t) => sum + t.target, 0) /
                                  kegiatan.targetMingguan.length,
                              ).toLocaleString("id-ID")}
                            </p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>}

            {/* Realisasi Tab */}
            {kegiatan.status === "divalidasi" && (
              <TabsContent value="realisasi" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="flex items-center gap-2">
                          <ClipboardList className="h-5 w-5" />
                          Realisasi Kegiatan
                        </CardTitle>
                        <CardDescription>Laporan realisasi anggaran dan output kegiatan</CardDescription>
                      </div>
                      <Button onClick={() => setRealisasiFormOpen(true)}>
                        <ClipboardList className="mr-2 h-4 w-4" />
                        Lapor Realisasi
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <RealisasiList
                      realisasi={kegiatanRealisasi}
                      paguAnggaran={kegiatan.paguAnggaran}
                      targetOutput={kegiatan.targetOutput}
                    />
                  </CardContent>
                </Card>
              </TabsContent>
            )}
          </Tabs>
        </div>
      </main>

      <RealisasiForm
        open={realisasiFormOpen}
        onOpenChange={setRealisasiFormOpen}
        kegiatan={kegiatan}
        onSubmit={handleRealisasiSubmit}
      />
    </div>
  )
}
