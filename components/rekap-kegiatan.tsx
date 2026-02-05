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
import { jenisKegiatanList, type Kegiatan, type RealisasiOutput } from "@/lib/mock-data"
import { TrendingUp, TrendingDown, Minus, BarChart3, PieChartIcon, TableIcon } from "lucide-react"

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
  const rekapData = useMemo(() => {
    const totalAnggaranGlobal = kegiatan.reduce((sum, k) => sum + k.paguAnggaran, 0)
    const totalRealisasiGlobal = realisasiData.reduce((sum, r) => sum + (r.realisasiAnggaran || 0), 0)

    // Group by jenis kegiatan
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

    // Group by kabupaten/kota
    const kabKotaMap = new Map<string, { anggaran: number; realisasi: number; count: number }>()
    kegiatan.forEach((k) => {
      const existing = kabKotaMap.get(k.kabupatenKota) || { anggaran: 0, realisasi: 0, count: 0 }
      const realisasi = realisasiData
        .filter((r) => r.kegiatanId === k.id)
        .reduce((sum, r) => sum + (r.realisasiAnggaran || 0), 0)
      kabKotaMap.set(k.kabupatenKota, {
        anggaran: existing.anggaran + k.paguAnggaran,
        realisasi: existing.realisasi + realisasi,
        count: existing.count + 1,
      })
    })

    const byKabKota = Array.from(kabKotaMap.entries())
      .map(([nama, data]) => ({
        nama,
        ...data,
        persentase: data.anggaran > 0 ? (data.realisasi / data.anggaran) * 100 : 0,
      }))
      .sort((a, b) => b.anggaran - a.anggaran)
      .slice(0, 10) // Top 10

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
            Tabel
          </TabsTrigger>
          <TabsTrigger value="bar" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Grafik Batang
          </TabsTrigger>
          <TabsTrigger value="pie" className="gap-2">
            <PieChartIcon className="h-4 w-4" />
            Grafik Lingkaran
          </TabsTrigger>
        </TabsList>

        {/* Table View */}
        <TabsContent value="table">
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
        </TabsContent>

        {/* Bar Chart View */}
        <TabsContent value="bar">
          <Card>
            <CardHeader>
              <CardTitle>Perbandingan Anggaran vs Realisasi</CardTitle>
              <CardDescription>Grafik perbandingan pagu anggaran dan realisasi per jenis kegiatan (dalam jutaan Rupiah)</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer
                config={{
                  anggaran: {
                    label: "Pagu Anggaran",
                    color: "#3b82f6",
                  },
                  realisasi: {
                    label: "Realisasi",
                    color: "#10b981",
                  },
                }}
                className="h-[400px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={barData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis 
                      dataKey="name" 
                      angle={-45} 
                      textAnchor="end" 
                      height={80}
                      tick={{ fontSize: 11 }}
                      className="fill-muted-foreground"
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }}
                      className="fill-muted-foreground"
                      tickFormatter={(value) => `${value} Jt`}
                    />
                    <ChartTooltip 
                      content={<ChartTooltipContent />}
                      formatter={(value: number) => [`Rp ${value.toFixed(0)} Juta`, ""]}
                    />
                    <Legend />
                    <Bar dataKey="anggaran" fill="#3b82f6" name="Pagu Anggaran" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="realisasi" fill="#10b981" name="Realisasi" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pie Chart View */}
        <TabsContent value="pie">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Distribusi Anggaran</CardTitle>
                <CardDescription>Proporsi anggaran per jenis kegiatan rolesharing</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer
                  config={Object.fromEntries(
                    pieData.map((d, i) => [
                      d.name,
                      { label: d.name, color: d.color },
                    ])
                  )}
                  className="h-[350px]"
                >
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={120}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${(percent * 100).toFixed(0)}%`}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value: number) => formatCurrency(value)}
                      />
                      <Legend 
                        layout="vertical" 
                        align="right" 
                        verticalAlign="middle"
                        formatter={(value) => <span className="text-xs">{value}</span>}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 10 Kabupaten/Kota</CardTitle>
                <CardDescription>Berdasarkan total alokasi anggaran</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {rekapData.byKabKota.map((item, index) => (
                    <div key={item.nama} className="flex items-center gap-3">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                        {index + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium truncate">{item.nama}</p>
                          <p className="text-sm font-medium">{formatCurrency(item.anggaran)}</p>
                        </div>
                        <div className="mt-1 flex items-center gap-2">
                          <div className="h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className="h-full rounded-full bg-primary transition-all"
                              style={{ width: `${Math.min(item.persentase, 100)}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground w-12 text-right">
                            {item.persentase.toFixed(0)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
