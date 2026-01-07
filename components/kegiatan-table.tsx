"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { StatusBadge } from "@/components/status-badge"
import { Pencil, Search, Filter, MapPin, ChevronDown, ChevronRight, ExternalLink } from "lucide-react"
import type { Kegiatan, KegiatanStatus, RealisasiOutput } from "@/lib/mock-data"
import { kabupatenKotaList } from "@/lib/mock-data"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"

interface KegiatanTableProps {
  data: Kegiatan[]
  onView: (kegiatan: Kegiatan) => void
  onEdit: (kegiatan: Kegiatan) => void
  realisasiData?: RealisasiOutput[]
}

export function KegiatanTable({ data, onView, onEdit, realisasiData = [] }: KegiatanTableProps) {
  const router = useRouter()
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<KegiatanStatus | "all">("all")
  const [kabupatenFilter, setKabupatenFilter] = useState<string>("all")
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set(kabupatenKotaList))

  const filteredData = data.filter((item) => {
    const matchesSearch =
      item.namaKegiatan.toLowerCase().includes(search.toLowerCase()) ||
      item.kabupatenKota.toLowerCase().includes(search.toLowerCase()) ||
      item.jenisKegiatan.toLowerCase().includes(search.toLowerCase())
    const matchesStatus = statusFilter === "all" || item.status === statusFilter
    const matchesKabupaten = kabupatenFilter === "all" || item.kabupatenKota === kabupatenFilter
    return matchesSearch && matchesStatus && matchesKabupaten
  })

  const groupedData = filteredData.reduce(
    (acc, item) => {
      if (!acc[item.kabupatenKota]) {
        acc[item.kabupatenKota] = []
      }
      acc[item.kabupatenKota].push(item)
      return acc
    },
    {} as Record<string, Kegiatan[]>,
  )

  const sortedGroups = Object.keys(groupedData).sort((a, b) => a.localeCompare(b))

  const toggleGroup = (kabupaten: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(kabupaten)) {
        next.delete(kabupaten)
      } else {
        next.add(kabupaten)
      }
      return next
    })
  }

  const expandAll = () => setExpandedGroups(new Set(sortedGroups))
  const collapseAll = () => setExpandedGroups(new Set())

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const calculateGroupSummary = (kegiatanList: Kegiatan[]) => {
    const totalAnggaran = kegiatanList.reduce((sum, k) => sum + k.paguAnggaran, 0)

    // Calculate total realisasi from realisasiData
    const kegiatanIds = kegiatanList.map((k) => k.id)
    const totalRealisasi = realisasiData
      .filter((r) => kegiatanIds.includes(r.kegiatanId))
      .reduce((sum, r) => sum + r.realisasiAnggaran, 0)

    const persentase = totalAnggaran > 0 ? (totalRealisasi / totalAnggaran) * 100 : 0

    return { totalAnggaran, totalRealisasi, persentase }
  }

  const handleViewDetail = (kegiatan: Kegiatan) => {
    router.push(`/kegiatan/${kegiatan.id}`)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari kegiatan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <Select value={kabupatenFilter} onValueChange={setKabupatenFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter Kabupaten/Kota" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Kabupaten/Kota</SelectItem>
              {kabupatenKotaList.map((kab) => (
                <SelectItem key={kab} value={kab}>
                  {kab}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as KegiatanStatus | "all")}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="diajukan">Diajukan</SelectItem>
              <SelectItem value="divalidasi">Divalidasi</SelectItem>
              <SelectItem value="ditolak">Ditolak</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {kabupatenFilter === "all" && (
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={expandAll}>
            Buka Semua
          </Button>
          <Button variant="outline" size="sm" onClick={collapseAll}>
            Tutup Semua
          </Button>
          <span className="text-sm text-muted-foreground ml-2">{sortedGroups.length} Kabupaten/Kota</span>
        </div>
      )}

      {kabupatenFilter === "all" ? (
        <div className="space-y-3">
          {sortedGroups.map((kabupaten) => {
            const summary = calculateGroupSummary(groupedData[kabupaten])

            return (
              <Collapsible
                key={kabupaten}
                open={expandedGroups.has(kabupaten)}
                onOpenChange={() => toggleGroup(kabupaten)}
              >
                <div className="rounded-lg border border-border bg-card overflow-hidden">
                  <CollapsibleTrigger asChild>
                    <button className="flex w-full items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-3">
                        {expandedGroups.has(kabupaten) ? (
                          <ChevronDown className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="h-5 w-5 text-muted-foreground" />
                        )}
                        <MapPin className="h-4 w-4 text-primary" />
                        <span className="font-semibold">{kabupaten}</span>
                        <Badge variant="secondary">{groupedData[kabupaten].length} kegiatan</Badge>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex flex-col items-end">
                          <span className="text-muted-foreground text-xs">Alokasi</span>
                          <span className="font-medium">{formatCurrency(summary.totalAnggaran)}</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-muted-foreground text-xs">Realisasi</span>
                          <span className="font-medium text-primary">{formatCurrency(summary.totalRealisasi)}</span>
                        </div>
                        <div className="flex flex-col items-end min-w-[60px]">
                          <span className="text-muted-foreground text-xs">Persentase</span>
                          <span
                            className={`font-semibold ${
                              summary.persentase >= 80
                                ? "text-green-500"
                                : summary.persentase >= 50
                                  ? "text-yellow-500"
                                  : summary.persentase > 0
                                    ? "text-orange-500"
                                    : "text-muted-foreground"
                            }`}
                          >
                            {summary.persentase.toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </button>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <div className="border-t border-border">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-border hover:bg-transparent">
                            <TableHead className="text-muted-foreground">ID</TableHead>
                            <TableHead className="text-muted-foreground">Jenis Kegiatan</TableHead>
                            <TableHead className="text-muted-foreground">Nama Kegiatan</TableHead>
                            <TableHead className="text-muted-foreground">Pagu Anggaran</TableHead>
                            <TableHead className="text-muted-foreground">Status</TableHead>
                            <TableHead className="text-right text-muted-foreground">Aksi</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {groupedData[kabupaten].map((kegiatan) => (
                            <TableRow key={kegiatan.id} className="border-border">
                              <TableCell className="font-mono text-sm">{kegiatan.id}</TableCell>
                              <TableCell>
                                <div className="flex flex-col gap-1">
                                  <Badge
                                    variant={kegiatan.kategori === "prioritas" ? "default" : "secondary"}
                                    className="w-fit text-xs"
                                  >
                                    {kegiatan.kategori === "prioritas" ? "Prioritas" : "Pendukung"}
                                  </Badge>
                                  <span className="text-xs text-muted-foreground max-w-[180px] truncate">
                                    {kegiatan.jenisKegiatan}
                                  </span>
                                </div>
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate font-medium">
                                {kegiatan.namaKegiatan}
                              </TableCell>
                              <TableCell>{formatCurrency(kegiatan.paguAnggaran)}</TableCell>
                              <TableCell>
                                <StatusBadge status={kegiatan.status} />
                              </TableCell>
                              <TableCell className="text-right">
                                <div className="flex items-center justify-end gap-1">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleViewDetail(kegiatan)}
                                    className="h-8 w-8"
                                    title="Lihat Detail"
                                  >
                                    <ExternalLink className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onEdit(kegiatan)}
                                    className="h-8 w-8"
                                    disabled={kegiatan.status === "divalidasi"}
                                    title="Edit Kegiatan"
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            )
          })}
          {sortedGroups.length === 0 && (
            <div className="rounded-lg border border-border bg-card p-8 text-center text-muted-foreground">
              Tidak ada data kegiatan
            </div>
          )}
        </div>
      ) : (
        <div className="rounded-lg border border-border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead className="text-muted-foreground">ID</TableHead>
                <TableHead className="text-muted-foreground">Jenis Kegiatan</TableHead>
                <TableHead className="text-muted-foreground">Nama Kegiatan</TableHead>
                <TableHead className="text-muted-foreground">Pagu Anggaran</TableHead>
                <TableHead className="text-muted-foreground">Status</TableHead>
                <TableHead className="text-right text-muted-foreground">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    Tidak ada data kegiatan untuk {kabupatenFilter}
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((kegiatan) => (
                  <TableRow key={kegiatan.id} className="border-border">
                    <TableCell className="font-mono text-sm">{kegiatan.id}</TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge
                          variant={kegiatan.kategori === "prioritas" ? "default" : "secondary"}
                          className="w-fit text-xs"
                        >
                          {kegiatan.kategori === "prioritas" ? "Prioritas" : "Pendukung"}
                        </Badge>
                        <span className="text-xs text-muted-foreground max-w-[180px] truncate">
                          {kegiatan.jenisKegiatan}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate font-medium">{kegiatan.namaKegiatan}</TableCell>
                    <TableCell>{formatCurrency(kegiatan.paguAnggaran)}</TableCell>
                    <TableCell>
                      <StatusBadge status={kegiatan.status} />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewDetail(kegiatan)}
                          className="h-8 w-8"
                          title="Lihat Detail"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEdit(kegiatan)}
                          className="h-8 w-8"
                          disabled={kegiatan.status === "divalidasi"}
                          title="Edit Kegiatan"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
          Menampilkan {filteredData.length} dari {data.length} kegiatan
        </span>
      </div>
    </div>
  )
}
