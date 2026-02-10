"use client"

import { useMemo, useState } from "react"
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
import { jenisKegiatanList, kabupatenKotaList, type Kegiatan, type RealisasiOutput } from "@/lib/mock-data"
import { TrendingUp, TrendingDown, Minus, MapPin, Filter, X } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface RekapKegiatanProps {
  kegiatan: Kegiatan[]
  realisasiData: RealisasiOutput[]
}

const CHART_COLORS = [
  "#3b82f6",
  "#ef4444",
  "#f59e0b",
  "#10b981",
  "#8b5cf6",
  "#6b7280",
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
  const [selectedWilayah, setSelectedWilayah] = useState<string>("all")

  const filteredKegiatan = useMemo(() => {
    if (selectedWilayah === "all") return kegiatan
    return kegiatan.filter((k) => k.kabupatenKota === selectedWilayah)
  }, [kegiatan, selectedWilayah])

  const filteredRealisasi = useMemo(() => {
    if (selectedWilayah === "all") return realisasiData
    const ids = new Set(filteredKegiatan.map((k) => k.id))
    return realisasiData.filter((r) => ids.has(r.kegiatanId))
  }, [realisasiData, filteredKegiatan, selectedWilayah])

  const rekapData = useMemo(() => {
    const totalAnggaranGlobal = filteredKegiatan.reduce((sum, k) => sum + k.paguAnggaran, 0)
    const totalRealisasiGlobal = filteredRealisasi.reduce((sum, r) => sum + (r.realisasiAnggaran || 0), 0)

    // Compute global totals for target output
    let totalTargetOutputGlobal = 0
    let totalRealisasiOutputGlobal = 0
    filteredKegiatan.forEach((k) => {
      const target = k.targetMingguan?.reduce((sum, t) => sum + t.target, 0) || 0
      totalTargetOutputGlobal += target
      const rOutput = filteredRealisasi
        .filter((r) => r.kegiatanId === k.id)
        .reduce((sum, r) => sum + (r.realisasiOutput || 0), 0)
      totalRealisasiOutputGlobal += rOutput
    })

    const byJenisKegiatan = jenisKegiatanList.map((jenis, index) => {
      const kegiatanList = filteredKegiatan.filter((k) => k.jenisKegiatan === jenis.nama)
      const totalAnggaran = kegiatanList.reduce((sum, k) => sum + k.paguAnggaran, 0)
      const totalRealisasi = kegiatanList.reduce((sum, k) => {
        const realisasi = filteredRealisasi.filter((r) => r.kegiatanId === k.id)
        return sum + realisasi.reduce((s, r) => s + (r.realisasiAnggaran || 0), 0)
      }, 0)

      // Aggregate target output
      let targetOutput = 0
      let realisasiOutput = 0
      let satuan = ""
      kegiatanList.forEach((k) => {
        if (k.targetMingguan && k.targetMingguan.length > 0) {
          satuan = k.targetMingguan[0].satuan
          targetOutput += k.targetMingguan.reduce((sum, t) => sum + t.target, 0)
        }
        const kRealisasi = filteredRealisasi.filter((r) => r.kegiatanId === k.id)
        realisasiOutput += kRealisasi.reduce((sum, r) => sum + (r.realisasiOutput || 0), 0)
      })

      const persentaseRealisasiAnggaran = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0
      const persentaseRealisasiOutput = targetOutput > 0 ? (realisasiOutput / targetOutput) * 100 : 0
      const persentaseTerhadapTotal = totalAnggaranGlobal > 0 ? (totalAnggaran / totalAnggaranGlobal) * 100 : 0

      return {
        id: jenis.id,
        nama: jenis.nama,
        namaShort: SHORT_KEGIATAN_NAMES[jenis.nama] || jenis.nama,
        kategori: jenis.kategori,
        jumlahKegiatan: kegiatanList.length,
        totalAnggaran,
        totalRealisasi,
        targetOutput,
        realisasiOutput,
        satuan,
        persentaseRealisasiAnggaran,
        persentaseRealisasiOutput,
        persentaseTerhadapTotal,
        color: CHART_COLORS[index % CHART_COLORS.length],
      }
    })

    // Group by kabupaten/kota
    const kabKotaMap = new Map<
      string,
      { anggaran: number; realisasi: number; count: number; targetOutput: number; realisasiOutput: number }
    >()
    filteredKegiatan.forEach((k) => {
      const existing = kabKotaMap.get(k.kabupatenKota) || {
        anggaran: 0,
        realisasi: 0,
        count: 0,
        targetOutput: 0,
        realisasiOutput: 0,
      }
      const rAnggaran = filteredRealisasi
        .filter((r) => r.kegiatanId === k.id)
        .reduce((sum, r) => sum + (r.realisasiAnggaran || 0), 0)
      const rOutput = filteredRealisasi
        .filter((r) => r.kegiatanId === k.id)
        .reduce((sum, r) => sum + (r.realisasiOutput || 0), 0)
      const tOutput = k.targetMingguan?.reduce((sum, t) => sum + t.target, 0) || 0

      kabKotaMap.set(k.kabupatenKota, {
        anggaran: existing.anggaran + k.paguAnggaran,
        realisasi: existing.realisasi + rAnggaran,
        count: existing.count + 1,
        targetOutput: existing.targetOutput + tOutput,
        realisasiOutput: existing.realisasiOutput + rOutput,
      })
    })

    const byKabKota = Array.from(kabKotaMap.entries())
      .map(([nama, data]) => ({
        nama,
        ...data,
        persentaseAnggaran: data.anggaran > 0 ? (data.realisasi / data.anggaran) * 100 : 0,
        persentaseOutput: data.targetOutput > 0 ? (data.realisasiOutput / data.targetOutput) * 100 : 0,
      }))
      .sort((a, b) => b.anggaran - a.anggaran)

    return {
      totalAnggaranGlobal,
      totalRealisasiGlobal,
      totalTargetOutputGlobal,
      totalRealisasiOutputGlobal,
      persentaseRealisasiGlobal: totalAnggaranGlobal > 0 ? (totalRealisasiGlobal / totalAnggaranGlobal) * 100 : 0,
      persentaseOutputGlobal: totalTargetOutputGlobal > 0 ? (totalRealisasiOutputGlobal / totalTargetOutputGlobal) * 100 : 0,
      byJenisKegiatan,
      byKabKota,
    }
  }, [filteredKegiatan, filteredRealisasi])

  const formatCurrency = (value: number) => {
    if (value >= 1000000000) return `Rp ${(value / 1000000000).toFixed(1)} M`
    if (value >= 1000000) return `Rp ${(value / 1000000).toFixed(0)} Jt`
    return `Rp ${value.toLocaleString("id-ID")}`
  }

  const formatNumber = (value: number) => value.toLocaleString("id-ID")

  const getPersentaseBadge = (persentase: number) => {
    if (persentase >= 80)
      return <Badge className="bg-success/20 text-success border-success/30">{persentase.toFixed(1)}%</Badge>
    if (persentase >= 50)
      return <Badge className="bg-warning/20 text-warning border-warning/30">{persentase.toFixed(1)}%</Badge>
    if (persentase > 0)
      return <Badge className="bg-info/20 text-info border-info/30">{persentase.toFixed(1)}%</Badge>
    return <Badge variant="outline">{persentase.toFixed(1)}%</Badge>
  }

  const getTrendIcon = (persentase: number) => {
    if (persentase >= 80) return <TrendingUp className="h-4 w-4 text-success" />
    if (persentase >= 50) return <Minus className="h-4 w-4 text-warning" />
    return <TrendingDown className="h-4 w-4 text-error" />
  }

  const pieData = rekapData.byJenisKegiatan
    .filter((d) => d.totalAnggaran > 0)
    .map((d) => ({
      name: d.namaShort,
      value: d.totalAnggaran,
      color: d.color,
    }))

  const barData = rekapData.byJenisKegiatan.map((d) => ({
    name: d.namaShort,
    anggaran: d.totalAnggaran / 1000000,
    realisasi: d.totalRealisasi / 1000000,
    color: d.color,
  }))

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Pagu Anggaran</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(rekapData.totalAnggaranGlobal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Dari {filteredKegiatan.length} kegiatan
              {selectedWilayah !== "all" ? ` di ${selectedWilayah}` : " rolesharing"}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Realisasi Anggaran</CardDescription>
            <CardTitle className="text-2xl">{formatCurrency(rekapData.totalRealisasiGlobal)}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getTrendIcon(rekapData.persentaseRealisasiGlobal)}
              {getPersentaseBadge(rekapData.persentaseRealisasiGlobal)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Realisasi Output</CardDescription>
            <CardTitle className="text-2xl">
              {formatNumber(rekapData.totalRealisasiOutputGlobal)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              {getTrendIcon(rekapData.persentaseOutputGlobal)}
              {getPersentaseBadge(rekapData.persentaseOutputGlobal)}
              <span className="text-xs text-muted-foreground">dari target</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Kegiatan Tervalidasi</CardDescription>
            <CardTitle className="text-2xl">
              {filteredKegiatan.filter((k) => k.status === "divalidasi").length} / {filteredKegiatan.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {filteredKegiatan.length > 0
                ? (
                    (filteredKegiatan.filter((k) => k.status === "divalidasi").length / filteredKegiatan.length) *
                    100
                  ).toFixed(1)
                : "0.0"}
              % sudah divalidasi
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {selectedWilayah !== "all" && (
          <div className="flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/5 px-3 py-1.5">
            <MapPin className="h-3.5 w-3.5 text-primary" />
            <span className="text-sm font-medium text-primary">{selectedWilayah}</span>
            <span className="text-xs text-muted-foreground">({filteredKegiatan.length} kegiatan)</span>
          </div>
        )}
        <div className="ml-auto flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedWilayah} onValueChange={setSelectedWilayah}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Filter Wilayah" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Wilayah</SelectItem>
              {kabupatenKotaList.map((kk) => (
                <SelectItem key={kk} value={kk}>
                  {kk}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {selectedWilayah !== "all" && (
            <button
              type="button"
              onClick={() => setSelectedWilayah("all")}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
              aria-label="Reset filter wilayah"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Tabel Rekapitulasi Gabungan */}
      <Card>
        <CardHeader>
          <CardTitle>Rekapitulasi per Jenis Kegiatan</CardTitle>
          <CardDescription>
            {selectedWilayah !== "all"
              ? `Ringkasan anggaran, target output, dan realisasi di ${selectedWilayah}`
              : "Ringkasan anggaran, target output, dan realisasi berdasarkan jenis kegiatan"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                {/* Group header row */}
                <TableRow className="bg-muted/50 border-b-0">
                  <TableHead rowSpan={2} className="w-[40px] align-middle border-r border-border">No</TableHead>
                  <TableHead rowSpan={2} className="min-w-[160px] align-middle border-r border-border">Jenis Kegiatan</TableHead>
                  <TableHead colSpan={4} className="text-center border-r border-border font-semibold">Anggaran</TableHead>
                  <TableHead colSpan={3} className="text-center font-semibold">Output</TableHead>
                </TableRow>
                {/* Sub header row */}
                <TableRow className="bg-muted/50">
                  <TableHead className="text-right min-w-[110px]">Pagu</TableHead>
                  <TableHead className="text-center min-w-[80px]">% Total</TableHead>
                  <TableHead className="text-right min-w-[110px]">Realisasi</TableHead>
                  <TableHead className="text-center min-w-[80px] border-r border-border">% Realisasi</TableHead>
                  <TableHead className="text-right min-w-[100px]">Target</TableHead>
                  <TableHead className="text-right min-w-[100px]">Realisasi</TableHead>
                  <TableHead className="text-center min-w-[80px]">% Realisasi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rekapData.byJenisKegiatan.map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium border-r border-border">{index + 1}</TableCell>
                    <TableCell className="border-r border-border">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                        <div>
                          <p className="font-medium text-sm">{item.namaShort}</p>
                          <p className="text-xs text-muted-foreground capitalize">{item.kategori}</p>
                        </div>
                      </div>
                    </TableCell>
                    {/* Anggaran group */}
                    <TableCell className="text-right font-medium tabular-nums">
                      {formatCurrency(item.totalAnggaran)}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="text-sm tabular-nums">{item.persentaseTerhadapTotal.toFixed(1)}%</span>
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {formatCurrency(item.totalRealisasi)}
                    </TableCell>
                    <TableCell className="text-center border-r border-border">
                      {getPersentaseBadge(item.persentaseRealisasiAnggaran)}
                    </TableCell>
                    {/* Output group */}
                    <TableCell className="text-right tabular-nums">
                      {item.targetOutput > 0 ? (
                        <span>
                          {formatNumber(item.targetOutput)}
                          {item.satuan && (
                            <span className="text-xs text-muted-foreground ml-1">{item.satuan}</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {item.realisasiOutput > 0 ? (
                        <span>
                          {formatNumber(item.realisasiOutput)}
                          {item.satuan && (
                            <span className="text-xs text-muted-foreground ml-1">{item.satuan}</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      {item.targetOutput > 0 ? (
                        getPersentaseBadge(item.persentaseRealisasiOutput)
                      ) : (
                        <span className="text-muted-foreground text-xs">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {/* Total Row */}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell colSpan={2} className="border-r border-border">Total</TableCell>
                  <TableCell className="text-right">{formatCurrency(rekapData.totalAnggaranGlobal)}</TableCell>
                  <TableCell className="text-center">100%</TableCell>
                  <TableCell className="text-right">{formatCurrency(rekapData.totalRealisasiGlobal)}</TableCell>
                  <TableCell className="text-center border-r border-border">
                    {getPersentaseBadge(rekapData.persentaseRealisasiGlobal)}
                  </TableCell>
                  <TableCell className="text-right">{formatNumber(rekapData.totalTargetOutputGlobal)}</TableCell>
                  <TableCell className="text-right">{formatNumber(rekapData.totalRealisasiOutputGlobal)}</TableCell>
                  <TableCell className="text-center">
                    {getPersentaseBadge(rekapData.persentaseOutputGlobal)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Grafik Perbandingan + Distribusi */}
      <div className="grid gap-4 lg:grid-cols-3">
        {/* Bar Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Perbandingan Anggaran vs Realisasi</CardTitle>
            <CardDescription>
              {selectedWilayah !== "all"
                ? `Per jenis kegiatan di ${selectedWilayah} (jutaan Rupiah)`
                : "Per jenis kegiatan (jutaan Rupiah)"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer
              config={{
                anggaran: { label: "Pagu Anggaran", color: "#2563eb" },
                realisasi: { label: "Realisasi", color: "#16a34a" },
              }}
              className="h-[340px]"
            >
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 4 }}>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    className="stroke-border"
                  />
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
                  <Bar
                    dataKey="anggaran"
                    fill="#2563eb"
                    name="Pagu Anggaran"
                    radius={[0, 4, 4, 0]}
                    barSize={12}
                  />
                  <Bar dataKey="realisasi" fill="#16a34a" name="Realisasi" radius={[0, 4, 4, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Anggaran</CardTitle>
            <CardDescription>Proporsi per jenis kegiatan</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <ChartContainer
              config={Object.fromEntries(pieData.map((d) => [d.name, { label: d.name, color: d.color }]))}
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
                    <div
                      className="h-2.5 w-2.5 shrink-0 rounded-sm"
                      style={{ backgroundColor: entry.color }}
                    />
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

      {/* Kab/Kota table or per-kegiatan detail */}
      {selectedWilayah === "all" ? (
        <Card>
          <CardHeader>
            <CardTitle>Alokasi per Kabupaten/Kota</CardTitle>
            <CardDescription>Peringkat berdasarkan total pagu anggaran, realisasi anggaran, dan output</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 border-b-0">
                    <TableHead rowSpan={2} className="w-[40px] align-middle border-r border-border">No</TableHead>
                    <TableHead rowSpan={2} className="min-w-[140px] align-middle border-r border-border">Kabupaten/Kota</TableHead>
                    <TableHead rowSpan={2} className="text-center align-middle min-w-[60px] border-r border-border">Kegiatan</TableHead>
                    <TableHead colSpan={3} className="text-center border-r border-border font-semibold">Anggaran</TableHead>
                    <TableHead colSpan={3} className="text-center border-r border-border font-semibold">Output</TableHead>
                    <TableHead rowSpan={2} className="min-w-[200px] w-[220px] align-middle text-center">Progres</TableHead>
                  </TableRow>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-right min-w-[100px]">Pagu</TableHead>
                    <TableHead className="text-right min-w-[100px]">Realisasi</TableHead>
                    <TableHead className="text-center min-w-[70px] border-r border-border">%</TableHead>
                    <TableHead className="text-right min-w-[80px]">Target</TableHead>
                    <TableHead className="text-right min-w-[80px]">Realisasi</TableHead>
                    <TableHead className="text-center min-w-[70px] border-r border-border">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rekapData.byKabKota.slice(0, 10).map((item, index) => {
                    const avgPersen = (item.persentaseAnggaran + item.persentaseOutput) / 2
                    return (
                      <TableRow key={item.nama}>
                        <TableCell className="font-medium border-r border-border">{index + 1}</TableCell>
                        <TableCell className="border-r border-border">
                          <div className="flex items-center gap-2">
                            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
                            <span className="font-medium text-sm">{item.nama}</span>
                          </div>
                        </TableCell>
                        <TableCell className="text-center border-r border-border">{item.count}</TableCell>
                        {/* Anggaran */}
                        <TableCell className="text-right font-medium tabular-nums">{formatCurrency(item.anggaran)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(item.realisasi)}</TableCell>
                        <TableCell className="text-center border-r border-border">{getPersentaseBadge(item.persentaseAnggaran)}</TableCell>
                        {/* Output */}
                        <TableCell className="text-right tabular-nums">
                          {item.targetOutput > 0 ? formatNumber(item.targetOutput) : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {item.realisasiOutput > 0 ? formatNumber(item.realisasiOutput) : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-center border-r border-border">
                          {item.targetOutput > 0 ? getPersentaseBadge(item.persentaseOutput) : <span className="text-muted-foreground text-xs">-</span>}
                        </TableCell>
                        {/* Progres bar */}
                        <TableCell className="py-2.5">
                          <div className="space-y-2">
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] text-muted-foreground">Anggaran</span>
                                <span className="text-[11px] font-medium tabular-nums">{item.persentaseAnggaran.toFixed(0)}%</span>
                              </div>
                              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    item.persentaseAnggaran >= 80 ? "bg-green-500" : item.persentaseAnggaran >= 50 ? "bg-yellow-500" : item.persentaseAnggaran > 0 ? "bg-orange-500" : "bg-muted-foreground"
                                  }`}
                                  style={{ width: `${Math.min(item.persentaseAnggaran, 100)}%` }}
                                />
                              </div>
                            </div>
                            <div>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-[11px] text-muted-foreground">Output</span>
                                <span className="text-[11px] font-medium tabular-nums">{item.persentaseOutput.toFixed(0)}%</span>
                              </div>
                              <div className="h-2.5 w-full rounded-full bg-muted overflow-hidden">
                                <div
                                  className={`h-full rounded-full transition-all ${
                                    item.persentaseOutput >= 80 ? "bg-green-500" : item.persentaseOutput >= 50 ? "bg-yellow-500" : item.persentaseOutput > 0 ? "bg-blue-500" : "bg-muted-foreground"
                                  }`}
                                  style={{ width: `${Math.min(item.persentaseOutput, 100)}%` }}
                                />
                              </div>
                            </div>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Detail Kegiatan - {selectedWilayah}
            </CardTitle>
            <CardDescription>Daftar seluruh kegiatan beserta anggaran, output, dan realisasi di wilayah ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 border-b-0">
                    <TableHead rowSpan={2} className="w-[40px] align-middle border-r border-border">No</TableHead>
                    <TableHead rowSpan={2} className="align-middle border-r border-border">Jenis Kegiatan</TableHead>
                    <TableHead rowSpan={2} className="min-w-[160px] align-middle border-r border-border">Nama Kegiatan</TableHead>
                    <TableHead colSpan={3} className="text-center border-r border-border font-semibold">Anggaran</TableHead>
                    <TableHead colSpan={3} className="text-center border-r border-border font-semibold">Output</TableHead>
                    <TableHead rowSpan={2} className="text-center align-middle">Status</TableHead>
                  </TableRow>
                  <TableRow className="bg-muted/50">
                    <TableHead className="text-right min-w-[100px]">Pagu</TableHead>
                    <TableHead className="text-right min-w-[100px]">Realisasi</TableHead>
                    <TableHead className="text-center min-w-[70px] border-r border-border">%</TableHead>
                    <TableHead className="text-right min-w-[80px]">Target</TableHead>
                    <TableHead className="text-right min-w-[80px]">Realisasi</TableHead>
                    <TableHead className="text-center min-w-[70px] border-r border-border">%</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredKegiatan.map((k, index) => {
                    const rAnggaran = filteredRealisasi
                      .filter((r) => r.kegiatanId === k.id)
                      .reduce((sum, r) => sum + (r.realisasiAnggaran || 0), 0)
                    const rOutput = filteredRealisasi
                      .filter((r) => r.kegiatanId === k.id)
                      .reduce((sum, r) => sum + (r.realisasiOutput || 0), 0)
                    const tOutput = k.targetMingguan?.reduce((sum, t) => sum + t.target, 0) || 0
                    const persenAnggaran = k.paguAnggaran > 0 ? (rAnggaran / k.paguAnggaran) * 100 : 0
                    const persenOutput = tOutput > 0 ? (rOutput / tOutput) * 100 : 0
                    return (
                      <TableRow key={k.id}>
                        <TableCell className="font-medium border-r border-border">{index + 1}</TableCell>
                        <TableCell className="border-r border-border">
                          <Badge variant="outline" className="text-xs whitespace-nowrap">
                            {SHORT_KEGIATAN_NAMES[k.jenisKegiatan] || k.jenisKegiatan}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[200px] border-r border-border">
                          <span className="text-sm font-medium line-clamp-2">{k.namaKegiatan}</span>
                        </TableCell>
                        {/* Anggaran */}
                        <TableCell className="text-right font-medium tabular-nums">{formatCurrency(k.paguAnggaran)}</TableCell>
                        <TableCell className="text-right tabular-nums">{formatCurrency(rAnggaran)}</TableCell>
                        <TableCell className="text-center border-r border-border">{getPersentaseBadge(persenAnggaran)}</TableCell>
                        {/* Output */}
                        <TableCell className="text-right tabular-nums">
                          {tOutput > 0 ? formatNumber(tOutput) : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-right tabular-nums">
                          {rOutput > 0 ? formatNumber(rOutput) : <span className="text-muted-foreground">-</span>}
                        </TableCell>
                        <TableCell className="text-center border-r border-border">
                          {tOutput > 0 ? getPersentaseBadge(persenOutput) : <span className="text-muted-foreground text-xs">-</span>}
                        </TableCell>
                        <TableCell className="text-center">
                          <Badge
                            variant={k.status === "divalidasi" ? "default" : k.status === "diajukan" ? "secondary" : "outline"}
                            className="text-xs capitalize"
                          >
                            {k.status}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                  {filteredKegiatan.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={10} className="text-center text-muted-foreground py-8">
                        Tidak ada data kegiatan untuk wilayah ini
                      </TableCell>
                    </TableRow>
                  )}
                  {filteredKegiatan.length > 0 && (
                    <TableRow className="bg-muted/50 font-bold">
                      <TableCell colSpan={3} className="border-r border-border">Total ({filteredKegiatan.length} kegiatan)</TableCell>
                      <TableCell className="text-right">{formatCurrency(rekapData.totalAnggaranGlobal)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(rekapData.totalRealisasiGlobal)}</TableCell>
                      <TableCell className="text-center border-r border-border">{getPersentaseBadge(rekapData.persentaseRealisasiGlobal)}</TableCell>
                      <TableCell className="text-right">{formatNumber(rekapData.totalTargetOutputGlobal)}</TableCell>
                      <TableCell className="text-right">{formatNumber(rekapData.totalRealisasiOutputGlobal)}</TableCell>
                      <TableCell className="text-center border-r border-border">{getPersentaseBadge(rekapData.persentaseOutputGlobal)}</TableCell>
                      <TableCell />
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
