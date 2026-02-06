"use client"

import { useMemo } from "react"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
} from "recharts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { jenisKegiatanList, kabupatenKotaList, type Kegiatan, type RealisasiOutput } from "@/lib/mock-data"
import { TrendingUp, TrendingDown, Minus, TableIcon, Target, MapPin } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"

interface RekapKegiatanProps {
  kegiatan: Kegiatan[]
  realisasiData: RealisasiOutput[]
}

// Colors for charts - using explicit hex values for Recharts compatibility
const CHART_COLORS = [
  "#3b82f6", // blue
  "#ef4444", // red
  "#f59e0b", // amber
  "#10b981", // emerald
  "#8b5cf6", // purple
  "#6b7280", // gray
]

const SHORT_KEGIATAN_NAMES: Record<string, string> = {
  "Penelusuran dan Penagihan Tunggakan PKB": "Penelusuran PKB",
  "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus": "Penegakan Hukum",
  "Pemberitahuan atau Penagihan PKB secara Digital": "Penagihan Digital",
  "Pendataan Potensi PKB dan BBNKB serta Sinkronisasi Data": "Pendataan & Sinkronisasi",
  "Sosialisasi dan Edukasi Wajib Pajak": "Sosialisasi",
  "Kegiatan Pendukung Optimalisasi Penerimaan PKB dan BBNKB": "Kegiatan Pendukung",
}

export function RekapKegiatan({ kegiatan, realisasiData }: RekapKegiatanProps) {
  const [selectedJenisKegiatan, setSelectedJenisKegiatan] = useState<string>("all")
  const [selectedKabKota, setSelectedKabKota] = useState<string>("all")

  const rekapData = useMemo(() => {
    const totalAnggaranGlobal = kegiatan.reduce((sum, k) => sum + k.paguAnggaran, 0)
    const totalRealisasiGlobal = realisasiData.reduce((sum, r) => sum + (r.realisasiAnggaran || 0), 0)

    // Group by jenis kegiatan with target output
    const byJenisKegiatan = jenisKegiatanList.map((jenis, index) => {
      const kegiatanList = kegiatan.filter((k) => k.jenisKegiatan === jenis.nama)
      const totalAnggaran = kegiatanList.reduce((sum, k) => sum + k.paguAnggaran, 0)
      const totalRealisasi = kegiatanList.reduce((sum, k) => {
        const realisasi = realisasiData.filter((r) => r.kegiatanId === k.id)
        return sum + realisasi.reduce((s, r) => s + (r.realisasiAnggaran || 0), 0)
      }, 0)
      const totalOutputRealisasi = kegiatanList.reduce((sum, k) => {
        const realisasi = realisasiData.filter((r) => r.kegiatanId === k.id)
        return sum + realisasi.reduce((s, r) => s + (r.realisasiOutput || 0), 0)
      }, 0)

      // Calculate target output from targetMingguan
      const targetOutputData = kegiatanList.reduce((acc, k) => {
        if (k.targetMingguan && k.targetMingguan.length > 0) {
          const satuan = k.targetMingguan[0].satuan
          const totalTarget = k.targetMingguan.reduce((sum, t) => sum + t.target, 0)
          if (!acc[satuan]) {
            acc[satuan] = { target: 0, realisasi: 0 }
          }
          acc[satuan].target += totalTarget
          // Get realisasi for this kegiatan
          const kegiatanRealisasi = realisasiData.filter((r) => r.kegiatanId === k.id)
          acc[satuan].realisasi += kegiatanRealisasi.reduce((sum, r) => sum + (r.realisasiOutput || 0), 0)
        }
        return acc
      }, {} as Record<string, { target: number; realisasi: number }>)

      const persentaseRealisasi = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0
      const persentaseTerhadapTotal = totalAnggaranGlobal > 0 ? (totalAnggaran / totalAnggaranGlobal) * 100 : 0

      return {
        id: jenis.id,
        nama: jenis.nama,
        namaShort: SHORT_KEGIATAN_NAMES[jenis.nama] || jenis.nama,
        kategori: jenis.kategori,
        jumlahKegiatan: kegiatanList.length,
        jumlahValidasi: kegiatanList.filter((k) => k.status === "divalidasi").length,
        totalAnggaran,
        totalRealisasi,
        totalOutputRealisasi,
        targetOutputData,
        persentaseRealisasi,
        persentaseTerhadapTotal,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }
    })

    // Group by status
    const byStatus = [
      { status: "divalidasi", label: "Tervalidasi", count: kegiatan.filter((k) => k.status === "divalidasi").length },
      { status: "diajukan", label: "Diajukan", count: kegiatan.filter((k) => k.status === "diajukan").length },
      { status: "draft", label: "Draft", count: kegiatan.filter((k) => k.status === "draft").length },
      { status: "ditolak", label: "Ditolak", count: kegiatan.filter((k) => k.status === "ditolak").length },
    ]

    // Group by kabupaten/kota with target output
    const kabKotaMap = new Map<string, { 
      anggaran: number; 
      realisasi: number; 
      count: number;
      targetOutput: Record<string, { target: number; realisasi: number }>;
    }>()
    kegiatan.forEach((k) => {
      const existing = kabKotaMap.get(k.kabupatenKota) || { 
        anggaran: 0, 
        realisasi: 0, 
        count: 0,
        targetOutput: {}
      }
      const realisasiAnggaran = realisasiData
        .filter((r) => r.kegiatanId === k.id)
        .reduce((sum, r) => sum + (r.realisasiAnggaran || 0), 0)
      
      // Calculate target output
      const targetOutput = { ...existing.targetOutput }
      if (k.targetMingguan && k.targetMingguan.length > 0) {
        const satuan = k.targetMingguan[0].satuan
        const totalTarget = k.targetMingguan.reduce((sum, t) => sum + t.target, 0)
        if (!targetOutput[satuan]) {
          targetOutput[satuan] = { target: 0, realisasi: 0 }
        }
        targetOutput[satuan].target += totalTarget
        const kegiatanRealisasi = realisasiData.filter((r) => r.kegiatanId === k.id)
        targetOutput[satuan].realisasi += kegiatanRealisasi.reduce((sum, r) => sum + (r.realisasiOutput || 0), 0)
      }

      kabKotaMap.set(k.kabupatenKota, {
        anggaran: existing.anggaran + k.paguAnggaran,
        realisasi: existing.realisasi + realisasiAnggaran,
        count: existing.count + 1,
        targetOutput,
      })
    })

    const byKabKota = Array.from(kabKotaMap.entries())
      .map(([nama, data]) => ({
        nama,
        ...data,
        persentase: data.anggaran > 0 ? (data.realisasi / data.anggaran) * 100 : 0,
      }))
      .sort((a, b) => b.anggaran - a.anggaran)

    return {
      totalAnggaranGlobal,
      totalRealisasiGlobal,
      persentaseRealisasiGlobal: totalAnggaranGlobal > 0 ? (totalRealisasiGlobal / totalAnggaranGlobal) * 100 : 0,
      byJenisKegiatan,
      byStatus,
      byKabKota,
    }
  }, [kegiatan, realisasiData])

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) {
      return `Rp ${(value / 1000000000).toFixed(1)} M`
    } else if (value >= 1000000) {
      return `Rp ${(value / 1000000).toFixed(0)} Jt`
    }
    return `Rp ${value.toLocaleString("id-ID")}`
  }

  const getPersentaseBadge = (persentase: number) => {
    if (persentase >= 80) {
      return <Badge className="bg-success/20 text-success border-success/30">{persentase.toFixed(1)}%</Badge>
    } else if (persentase >= 50) {
      return <Badge className="bg-warning/20 text-warning border-warning/30">{persentase.toFixed(1)}%</Badge>
    } else if (persentase > 0) {
      return <Badge className="bg-info/20 text-info border-info/30">{persentase.toFixed(1)}%</Badge>
    }
    return <Badge variant="outline">{persentase.toFixed(1)}%</Badge>
  }

  const getTrendIcon = (persentase: number) => {
    if (persentase >= 80) return <TrendingUp className="h-4 w-4 text-success" />
    if (persentase >= 50) return <Minus className="h-4 w-4 text-warning" />
    return <TrendingDown className="h-4 w-4 text-error" />
  }

  // Prepare data for pie chart
  const pieData = rekapData.byJenisKegiatan
    .filter((d) => d.totalAnggaran > 0)
    .map((d) => ({
      name: d.namaShort,
      value: d.totalAnggaran,
      color: d.color,
    }))

  // Prepare data for bar chart
  const barData = rekapData.byJenisKegiatan.map((d) => ({
    name: d.namaShort,
    anggaran: d.totalAnggaran / 1000000, // Convert to millions
    realisasi: d.totalRealisasi / 1000000,
    color: d.color,
  }))

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Pagu Anggaran</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(rekapData.totalAnggaranGlobal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Dari {kegiatan.length} kegiatan rolesharing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Realisasi Anggaran</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(rekapData.totalRealisasiGlobal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getTrendIcon(rekapData.persentaseRealisasiGlobal)}
              {getPersentaseBadge(rekapData.persentaseRealisasiGlobal)}
              <span className="text-xs text-muted-foreground">dari total anggaran</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kegiatan Tervalidasi</CardDescription>
            <CardTitle className="text-2xl">
              {kegiatan.filter((k) => k.status === "divalidasi").length} / {kegiatan.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {((kegiatan.filter((k) => k.status === "divalidasi").length / kegiatan.length) * 100).toFixed(1)}% kegiatan
              sudah divalidasi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content with Tabs */}
      <Tabs defaultValue="table" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="table" className="gap-2">
            <TableIcon className="h-4 w-4" />
            Anggaran
          </TabsTrigger>
          <TabsTrigger value="target" className="gap-2">
            <Target className="h-4 w-4" />
            Target Output
          </TabsTrigger>
        </TabsList>

        {/* Table View */}
        <TabsContent value="table" className="space-y-4">
          {/* Tabel Rekapitulasi */}
          <Card>
            <CardHeader>
              <CardTitle>Rekapitulasi per Jenis Kegiatan</CardTitle>
              <CardDescription>Ringkasan anggaran dan realisasi berdasarkan jenis kegiatan rolesharing</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[40px]">No</TableHead>
                      <TableHead>Jenis Kegiatan</TableHead>
                      <TableHead className="text-center">Jumlah</TableHead>
                      <TableHead className="text-center">Validasi</TableHead>
                      <TableHead className="text-right">Pagu Anggaran</TableHead>
                      <TableHead className="text-right">Realisasi</TableHead>
                      <TableHead className="text-center">% Realisasi</TableHead>
                      <TableHead className="text-center">% Total</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rekapData.byJenisKegiatan.map((item, index) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">{index + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                            <div>
                              <p className="font-medium text-sm">{item.namaShort}</p>
                              <p className="text-xs text-muted-foreground capitalize">{item.kategori}</p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-center">{item.jumlahKegiatan}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={item.jumlahValidasi > 0 ? "default" : "outline"}>{item.jumlahValidasi}</Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(item.totalAnggaran)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(item.totalRealisasi)}</TableCell>
                        <TableCell className="text-center">{getPersentaseBadge(item.persentaseRealisasi)}</TableCell>
                        <TableCell className="text-center">
                          <span className="text-sm font-medium">{item.persentaseTerhadapTotal.toFixed(1)}%</span>
                        </TableCell>
                      </TableRow>
                    ))}
                    {/* Total Row */}
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={2}>Total</TableCell>
                      <TableCell className="text-center">{kegiatan.length}</TableCell>
                      <TableCell className="text-center">
                        {kegiatan.filter((k) => k.status === "divalidasi").length}
                      </TableCell>
                      <TableCell className="text-right">{formatCurrency(rekapData.totalAnggaranGlobal)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(rekapData.totalRealisasiGlobal)}</TableCell>
                      <TableCell className="text-center">
                        {getPersentaseBadge(rekapData.persentaseRealisasiGlobal)}
                      </TableCell>
                      <TableCell className="text-center">100%</TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          {/* Grafik Perbandingan Anggaran + Distribusi */}
          <div className="grid gap-4 lg:grid-cols-3">
            {/* Bar Chart - 2 cols */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Perbandingan Anggaran vs Realisasi</CardTitle>
                <CardDescription>Pagu anggaran dan realisasi per jenis kegiatan (jutaan Rupiah)</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={{
                    anggaran: {
                      label: "Pagu Anggaran",
                      color: "#2563eb",
                    },
                    realisasi: {
                      label: "Realisasi",
                      color: "#16a34a",
                    },
                  }}
                  className="h-[340px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={barData}
                      layout="vertical"
                      margin={{ top: 4, right: 16, left: 4, bottom: 4 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} className="stroke-border" />
                      <XAxis
                        type="number"
                        tick={{ fontSize: 11 }}
                        className="fill-muted-foreground"
                        tickFormatter={(value) => `${value} Jt`}
                      />
                      <YAxis
                        type="category"
                        dataKey="name"
                        width={120}
                        tick={{ fontSize: 11 }}
                        className="fill-muted-foreground"
                      />
                      <ChartTooltip
                        content={<ChartTooltipContent />}
                        formatter={(value: number) => `Rp ${value.toFixed(0)} Juta`}
                      />
                      <Legend
                        verticalAlign="top"
                        align="right"
                        height={32}
                        iconType="circle"
                        iconSize={8}
                        formatter={(value) => <span className="text-xs text-foreground">{value}</span>}
                      />
                      <Bar dataKey="anggaran" fill="#2563eb" name="Pagu Anggaran" radius={[0, 4, 4, 0]} barSize={12} />
                      <Bar dataKey="realisasi" fill="#16a34a" name="Realisasi" radius={[0, 4, 4, 0]} barSize={12} />
                    </BarChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            {/* Pie Chart - 1 col */}
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Anggaran</CardTitle>
                <CardDescription>Proporsi per jenis kegiatan</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <ChartContainer
                  config={Object.fromEntries(
                    pieData.map((d) => [d.name, { label: d.name, color: d.color }])
                  )}
                  className="h-[220px] w-full"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={85}
                        paddingAngle={3}
                        dataKey="value"
                        strokeWidth={2}
                        stroke="hsl(var(--background))"
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value: number) => formatCurrency(value)}
                        contentStyle={{
                          borderRadius: "8px",
                          border: "1px solid hsl(var(--border))",
                          background: "hsl(var(--card))",
                          fontSize: "12px",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 w-full">
                  {pieData.map((entry) => {
                    const total = pieData.reduce((s, e) => s + e.value, 0)
                    const pct = total > 0 ? ((entry.value / total) * 100).toFixed(0) : "0"
                    return (
                      <div key={entry.name} className="flex items-center gap-2">
                        <div className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ backgroundColor: entry.color }} />
                        <div className="flex-1 min-w-0">
                          <span className="text-xs text-muted-foreground truncate block">{entry.name}</span>
                        </div>
                        <span className="text-xs font-medium tabular-nums shrink-0">{pct}%</span>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Top Kabupaten/Kota */}
          <Card>
            <CardHeader>
              <CardTitle>Alokasi Anggaran per Kabupaten/Kota</CardTitle>
              <CardDescription>Peringkat berdasarkan total pagu anggaran dan persentase realisasi</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead className="w-[40px]">No</TableHead>
                      <TableHead>Kabupaten/Kota</TableHead>
                      <TableHead className="text-center">Kegiatan</TableHead>
                      <TableHead className="text-right">Pagu Anggaran</TableHead>
                      <TableHead className="text-right">Realisasi</TableHead>
                      <TableHead className="w-[200px]">Progres</TableHead>
                      <TableHead className="text-center">% Realisasi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rekapData.byKabKota.slice(0, 10).map((item, index) => {
                      const maxAnggaran = rekapData.byKabKota[0]?.anggaran || 1
                      const barWidth = (item.anggaran / maxAnggaran) * 100
                      return (
                        <TableRow key={item.nama}>
                          <TableCell className="font-medium">{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                              <span className="font-medium text-sm">{item.nama}</span>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">{item.count}</TableCell>
                          <TableCell className="text-right font-medium tabular-nums">
                            {formatCurrency(item.anggaran)}
                          </TableCell>
                          <TableCell className="text-right tabular-nums">
                            {formatCurrency(item.realisasi)}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <div className="h-2 flex-1 rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    item.persentase >= 80
                                      ? "bg-green-500"
                                      : item.persentase >= 50
                                        ? "bg-yellow-500"
                                        : item.persentase > 0
                                          ? "bg-orange-500"
                                          : "bg-muted-foreground"
                                  }`}
                                  style={{ width: `${Math.min(item.persentase, 100)}%` }}
                                />
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="text-center">
                            {getPersentaseBadge(item.persentase)}
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Target Output View */}
        <TabsContent value="target">
          <div className="space-y-6">
            {/* Filter Controls */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base">Filter Target Output</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <Select value={selectedJenisKegiatan} onValueChange={setSelectedJenisKegiatan}>
                      <SelectTrigger className="w-[280px]">
                        <SelectValue placeholder="Pilih Jenis Kegiatan" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Jenis Kegiatan</SelectItem>
                        {jenisKegiatanList.filter(j => j.kategori === "prioritas").map((jenis) => (
                          <SelectItem key={jenis.id} value={jenis.nama}>
                            {SHORT_KEGIATAN_NAMES[jenis.nama] || jenis.nama}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <Select value={selectedKabKota} onValueChange={setSelectedKabKota}>
                      <SelectTrigger className="w-[220px]">
                        <SelectValue placeholder="Pilih Kabupaten/Kota" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Semua Kabupaten/Kota</SelectItem>
                        {kabupatenKotaList.map((kk) => (
                          <SelectItem key={kk} value={kk}>{kk}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Target by Jenis Kegiatan */}
            {(selectedJenisKegiatan === "all" && selectedKabKota === "all") && (
              <Card>
                <CardHeader>
                  <CardTitle>Target Output per Jenis Kegiatan</CardTitle>
                  <CardDescription>Rekapitulasi target dan realisasi output berdasarkan jenis kegiatan prioritas</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[40px]">No</TableHead>
                          <TableHead>Jenis Kegiatan</TableHead>
                          <TableHead className="text-center">Jumlah</TableHead>
                          <TableHead>Target Output</TableHead>
                          <TableHead className="text-right">Target</TableHead>
                          <TableHead className="text-right">Realisasi</TableHead>
                          <TableHead className="text-center">% Capaian</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rekapData.byJenisKegiatan
                          .filter(item => item.kategori === "prioritas")
                          .map((item, index) => (
                          <TableRow key={item.id}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }} />
                                <span className="font-medium text-sm">{item.namaShort}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{item.jumlahKegiatan}</TableCell>
                            <TableCell>
                              {Object.keys(item.targetOutputData).length > 0 ? (
                                <div className="space-y-1">
                                  {Object.entries(item.targetOutputData).map(([satuan, data]) => (
                                    <Badge key={satuan} variant="outline" className="text-xs">
                                      {satuan}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {Object.keys(item.targetOutputData).length > 0 ? (
                                <div className="space-y-1">
                                  {Object.entries(item.targetOutputData).map(([satuan, data]) => (
                                    <div key={satuan} className="text-sm font-medium">
                                      {data.target.toLocaleString("id-ID")}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right">
                              {Object.keys(item.targetOutputData).length > 0 ? (
                                <div className="space-y-1">
                                  {Object.entries(item.targetOutputData).map(([satuan, data]) => (
                                    <div key={satuan} className="text-sm">
                                      {data.realisasi.toLocaleString("id-ID")}
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              {Object.keys(item.targetOutputData).length > 0 ? (
                                <div className="space-y-1">
                                  {Object.entries(item.targetOutputData).map(([satuan, data]) => {
                                    const persen = data.target > 0 ? (data.realisasi / data.target) * 100 : 0
                                    return (
                                      <div key={satuan}>
                                        {getPersentaseBadge(persen)}
                                      </div>
                                    )
                                  })}
                                </div>
                              ) : (
                                <span className="text-muted-foreground">-</span>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Target by Kabupaten/Kota */}
            {(selectedJenisKegiatan === "all" && selectedKabKota === "all") && (
              <Card>
                <CardHeader>
                  <CardTitle>Target Output per Kabupaten/Kota</CardTitle>
                  <CardDescription>Rekapitulasi target dan realisasi output berdasarkan wilayah</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[40px]">No</TableHead>
                          <TableHead>Kabupaten/Kota</TableHead>
                          <TableHead className="text-center">Kegiatan</TableHead>
                          <TableHead>Target Output</TableHead>
                          <TableHead className="text-right">Pagu Anggaran</TableHead>
                          <TableHead className="text-center">% Realisasi</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {rekapData.byKabKota.slice(0, 15).map((item, index) => (
                          <TableRow key={item.nama}>
                            <TableCell className="font-medium">{index + 1}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <MapPin className="h-3.5 w-3.5 text-primary" />
                                <span className="font-medium text-sm">{item.nama}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-center">{item.count}</TableCell>
                            <TableCell>
                              {Object.keys(item.targetOutput).length > 0 ? (
                                <div className="flex flex-wrap gap-1">
                                  {Object.entries(item.targetOutput).map(([satuan, data]) => (
                                    <Badge key={satuan} variant="secondary" className="text-xs">
                                      {data.target.toLocaleString("id-ID")} {satuan}
                                    </Badge>
                                  ))}
                                </div>
                              ) : (
                                <span className="text-muted-foreground text-xs">Belum ada target</span>
                              )}
                            </TableCell>
                            <TableCell className="text-right font-medium">{formatCurrency(item.anggaran)}</TableCell>
                            <TableCell className="text-center">{getPersentaseBadge(item.persentase)}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filtered View - by Jenis Kegiatan */}
            {selectedJenisKegiatan !== "all" && (
              <Card>
                <CardHeader>
                  <CardTitle>Target Output: {SHORT_KEGIATAN_NAMES[selectedJenisKegiatan] || selectedJenisKegiatan}</CardTitle>
                  <CardDescription>Detail target output per kabupaten/kota untuk jenis kegiatan terpilih</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[40px]">No</TableHead>
                          <TableHead>Kabupaten/Kota</TableHead>
                          <TableHead>Nama Kegiatan</TableHead>
                          <TableHead className="text-right">Target</TableHead>
                          <TableHead className="text-right">Realisasi</TableHead>
                          <TableHead className="text-center">% Capaian</TableHead>
                          <TableHead className="text-right">Anggaran</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kegiatan
                          .filter(k => k.jenisKegiatan === selectedJenisKegiatan)
                          .filter(k => selectedKabKota === "all" || k.kabupatenKota === selectedKabKota)
                          .map((k, index) => {
                            const totalTarget = k.targetMingguan?.reduce((sum, t) => sum + t.target, 0) || 0
                            const satuan = k.targetMingguan?.[0]?.satuan || "-"
                            const realisasiOutput = realisasiData
                              .filter(r => r.kegiatanId === k.id)
                              .reduce((sum, r) => sum + (r.realisasiOutput || 0), 0)
                            const persen = totalTarget > 0 ? (realisasiOutput / totalTarget) * 100 : 0
                            return (
                              <TableRow key={k.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>
                                  <div className="flex items-center gap-2">
                                    <MapPin className="h-3.5 w-3.5 text-primary" />
                                    <span className="text-sm">{k.kabupatenKota}</span>
                                  </div>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate text-sm">{k.namaKegiatan}</TableCell>
                                <TableCell className="text-right">
                                  <span className="font-medium">{totalTarget.toLocaleString("id-ID")}</span>
                                  <span className="text-xs text-muted-foreground ml-1">{satuan}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                  {realisasiOutput.toLocaleString("id-ID")}
                                </TableCell>
                                <TableCell className="text-center">{getPersentaseBadge(persen)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(k.paguAnggaran)}</TableCell>
                              </TableRow>
                            )
                          })}
                        {kegiatan.filter(k => k.jenisKegiatan === selectedJenisKegiatan).filter(k => selectedKabKota === "all" || k.kabupatenKota === selectedKabKota).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              Tidak ada data kegiatan
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Filtered View - by Kabupaten/Kota only */}
            {selectedJenisKegiatan === "all" && selectedKabKota !== "all" && (
              <Card>
                <CardHeader>
                  <CardTitle>Target Output: {selectedKabKota}</CardTitle>
                  <CardDescription>Detail target output per jenis kegiatan untuk wilayah terpilih</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-muted/50">
                          <TableHead className="w-[40px]">No</TableHead>
                          <TableHead>Jenis Kegiatan</TableHead>
                          <TableHead>Nama Kegiatan</TableHead>
                          <TableHead className="text-right">Target</TableHead>
                          <TableHead className="text-right">Realisasi</TableHead>
                          <TableHead className="text-center">% Capaian</TableHead>
                          <TableHead className="text-right">Anggaran</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {kegiatan
                          .filter(k => k.kabupatenKota === selectedKabKota)
                          .map((k, index) => {
                            const totalTarget = k.targetMingguan?.reduce((sum, t) => sum + t.target, 0) || 0
                            const satuan = k.targetMingguan?.[0]?.satuan || "-"
                            const realisasiOutput = realisasiData
                              .filter(r => r.kegiatanId === k.id)
                              .reduce((sum, r) => sum + (r.realisasiOutput || 0), 0)
                            const persen = totalTarget > 0 ? (realisasiOutput / totalTarget) * 100 : 0
                            return (
                              <TableRow key={k.id}>
                                <TableCell className="font-medium">{index + 1}</TableCell>
                                <TableCell>
                                  <Badge variant="outline" className="text-xs">
                                    {SHORT_KEGIATAN_NAMES[k.jenisKegiatan] || k.jenisKegiatan}
                                  </Badge>
                                </TableCell>
                                <TableCell className="max-w-[200px] truncate text-sm">{k.namaKegiatan}</TableCell>
                                <TableCell className="text-right">
                                  <span className="font-medium">{totalTarget.toLocaleString("id-ID")}</span>
                                  <span className="text-xs text-muted-foreground ml-1">{satuan}</span>
                                </TableCell>
                                <TableCell className="text-right">
                                  {realisasiOutput.toLocaleString("id-ID")}
                                </TableCell>
                                <TableCell className="text-center">{getPersentaseBadge(persen)}</TableCell>
                                <TableCell className="text-right">{formatCurrency(k.paguAnggaran)}</TableCell>
                              </TableRow>
                            )
                          })}
                        {kegiatan.filter(k => k.kabupatenKota === selectedKabKota).length === 0 && (
                          <TableRow>
                            <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                              Tidak ada data kegiatan
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>


      </Tabs>
    </div>
  )
}
