"use client"

import type React from "react"

import { useState, useEffect, useMemo } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Trash2, Calendar, CalendarPlus, X, Info } from "lucide-react"
import { kabupatenKotaList, jenisKegiatanList, type Kegiatan, type TargetOutputMingguan, getJenisKegiatanMeta } from "@/lib/mock-data"

interface KegiatanFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kegiatan?: Kegiatan | null
  onSubmit: (data: Partial<Kegiatan>) => void
}

const bulanOptions = [
  { value: "01", label: "Januari" },
  { value: "02", label: "Februari" },
  { value: "03", label: "Maret" },
  { value: "04", label: "April" },
  { value: "05", label: "Mei" },
  { value: "06", label: "Juni" },
  { value: "07", label: "Juli" },
  { value: "08", label: "Agustus" },
  { value: "09", label: "September" },
  { value: "10", label: "Oktober" },
  { value: "11", label: "November" },
  { value: "12", label: "Desember" },
]

const tahunOptions = [2024, 2025, 2026, 2027, 2028]

const requiresTanggalPelaksanaan = (jenisKegiatan: string): boolean => {
  return jenisKegiatan === "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus"
}

// Mendapatkan tanggal Senin dari minggu ISO tertentu
function getDateOfISOWeek(week: number, year: number): Date {
  const simple = new Date(year, 0, 1 + (week - 1) * 7)
  const dow = simple.getDay()
  const ISOweekStart = simple
  if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
  else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
  return ISOweekStart
}

// Mendapatkan nomor minggu ISO dari tanggal
function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum)
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

// Mendapatkan jumlah minggu ISO dalam setahun
function getISOWeeksInYear(year: number): number {
  const d = new Date(year, 11, 28)
  return getISOWeekNumber(d)
}

// Format tanggal ke string "DD MMM"
function formatDateShort(date: Date): string {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]
  return `${date.getDate()} ${months[date.getMonth()]}`
}

// Mendapatkan daftar minggu ISO untuk bulan tertentu
function getISOWeeksForMonth(
  year: number,
  month: number,
): { week: number; startDate: Date; endDate: Date; label: string }[] {
  const weeks: { week: number; startDate: Date; endDate: Date; label: string }[] = []
  const totalWeeks = getISOWeeksInYear(year)

  for (let w = 1; w <= totalWeeks; w++) {
    const weekStart = getDateOfISOWeek(w, year)
    const weekEnd = new Date(weekStart)
    weekEnd.setDate(weekStart.getDate() + 6)

    // Check if this week overlaps with the selected month
    const weekStartMonth = weekStart.getMonth()
    const weekEndMonth = weekEnd.getMonth()

    if (weekStartMonth === month || weekEndMonth === month) {
      weeks.push({
        week: w,
        startDate: weekStart,
        endDate: weekEnd,
        label: `Minggu ${w} (${formatDateShort(weekStart)} - ${formatDateShort(weekEnd)})`,
      })
    }
  }

  return weeks
}

const isAnggaranOnlyKegiatan = (jenisKegiatan: string): boolean => {
  const meta = getJenisKegiatanMeta(jenisKegiatan)
  return meta ? !meta.hasRealisasiOutput : false
}

export function KegiatanForm({ open, onOpenChange, kegiatan, onSubmit }: KegiatanFormProps) {
  const [tahunAnggaran, setTahunAnggaran] = useState<number>(2025)
  const [filterBulan, setFilterBulan] = useState<string>("01")

  const [formData, setFormData] = useState<Partial<Kegiatan>>(
    kegiatan || {
      namaKegiatan: "",
      jenisKegiatan: "",
      kategori: "prioritas",
      kabupatenKota: "",
      paguAnggaran: 0,
      targetOutput: "",
      jadwalMulai: "",
      jadwalSelesai: "",
      targetMingguan: [],
    },
  )

  const [targetMingguan, setTargetMingguan] = useState<TargetOutputMingguan[]>(kegiatan?.targetMingguan || [])

  const needsTanggalPelaksanaan = useMemo(() => {
    return requiresTanggalPelaksanaan(formData.jenisKegiatan || "")
  }, [formData.jenisKegiatan])

  const isPendukung = useMemo(() => {
    return isPendukungKegiatan(formData.jenisKegiatan || "")
  }, [formData.jenisKegiatan])

  const availableWeeks = useMemo(() => {
    const monthIndex = Number.parseInt(filterBulan) - 1
    return getISOWeeksForMonth(tahunAnggaran, monthIndex)
  }, [tahunAnggaran, filterBulan])

  const filteredTargetMingguan = useMemo(() => {
    return targetMingguan.filter((item) => {
      const itemBulan = item.bulan.includes("-") ? item.bulan.split("-")[1] : item.bulan
      return itemBulan === filterBulan
    })
  }, [targetMingguan, filterBulan])

  useEffect(() => {
    if (kegiatan) {
      setFormData(kegiatan)
      setTargetMingguan(kegiatan.targetMingguan || [])
      if (kegiatan.targetMingguan && kegiatan.targetMingguan.length > 0) {
        const firstBulan = kegiatan.targetMingguan[0].bulan
        if (firstBulan.includes("-")) {
          setTahunAnggaran(Number(firstBulan.split("-")[0]))
        }
      }
    } else {
      setFormData({
        namaKegiatan: "",
        jenisKegiatan: "",
        kategori: "prioritas",
        kabupatenKota: "",
        paguAnggaran: 0,
        targetOutput: "",
        jadwalMulai: "",
        jadwalSelesai: "",
        targetMingguan: [],
      })
      setTargetMingguan([])
      setTahunAnggaran(2025)
    }
  }, [kegiatan])

  const handleJenisKegiatanChange = (value: string) => {
    const selected = jenisKegiatanList.find((jk) => jk.nama === value)
    setFormData({
      ...formData,
      jenisKegiatan: value,
      kategori: selected?.kategori || "prioritas",
    })

    if (isPendukungKegiatan(value)) {
      setTargetMingguan([])
    } else if (requiresTanggalPelaksanaan(value)) {
      setTargetMingguan(
        targetMingguan.map((item) => ({
          ...item,
          satuan: "Kali",
          tanggalPelaksanaan: item.tanggalPelaksanaan || [],
        })),
      )
    }
  }

  const addTargetMingguan = () => {
    const firstWeek = availableWeeks[0]
    if (firstWeek) {
      const defaultSatuan = needsTanggalPelaksanaan ? "Kali" : "Unit"
      setTargetMingguan([
        ...targetMingguan,
        {
          bulan: filterBulan,
          mingguKe: firstWeek.week,
          target: needsTanggalPelaksanaan ? 1 : 0,
          satuan: defaultSatuan,
          tanggalPelaksanaan: needsTanggalPelaksanaan ? [] : undefined,
        },
      ])
    }
  }

  const updateTargetMingguan = (
    index: number,
    field: keyof TargetOutputMingguan,
    value: string | number | string[],
  ) => {
    const actualIndex = targetMingguan.findIndex((item) => {
      const itemBulan = item.bulan.includes("-") ? item.bulan.split("-")[1] : item.bulan
      return itemBulan === filterBulan && item === filteredTargetMingguan[index]
    })

    if (actualIndex !== -1) {
      const updated = [...targetMingguan]
      updated[actualIndex] = { ...updated[actualIndex], [field]: value }
      setTargetMingguan(updated)
    }
  }

  const addTanggalPelaksanaan = (index: number) => {
    const item = filteredTargetMingguan[index]
    const currentDates = item.tanggalPelaksanaan || []
    // Default to first day of the week
    const week = availableWeeks.find((w) => w.week === item.mingguKe)
    const defaultDate = week ? week.startDate.toISOString().split("T")[0] : ""
    updateTargetMingguan(index, "tanggalPelaksanaan", [...currentDates, defaultDate])
  }

  const removeTanggalPelaksanaan = (index: number, dateIndex: number) => {
    const item = filteredTargetMingguan[index]
    const currentDates = item.tanggalPelaksanaan || []
    const newDates = currentDates.filter((_, i) => i !== dateIndex)
    updateTargetMingguan(index, "tanggalPelaksanaan", newDates)
  }

  const updateTanggalPelaksanaan = (index: number, dateIndex: number, value: string) => {
    const item = filteredTargetMingguan[index]
    const currentDates = [...(item.tanggalPelaksanaan || [])]
    currentDates[dateIndex] = value
    updateTargetMingguan(index, "tanggalPelaksanaan", currentDates)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const targetMingguanWithYear = targetMingguan.map((item) => ({
      ...item,
      bulan: item.bulan.includes("-") ? item.bulan : `${tahunAnggaran}-${item.bulan}`,
    }))
    onSubmit({ ...formData, targetMingguan: targetMingguanWithYear })
    onOpenChange(false)
  }

  const isEdit = !!kegiatan

  const getWeekLabel = (weekNumber: number) => {
    const week = availableWeeks.find((w) => w.week === weekNumber)
    return week ? week.label : `Minggu ${weekNumber}`
  }

  const removeTargetMingguan = (index: number) => {
    const updated = [...targetMingguan]
    updated.splice(index, 1)
    setTargetMingguan(updated)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Kegiatan" : "Tambah Kegiatan Baru"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Perbarui informasi kegiatan rolesharing" : "Masukkan data kegiatan rolesharing baru"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">Detail Kegiatan</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="jenisKegiatan">Jenis Kegiatan</Label>
                <Select value={formData.jenisKegiatan} onValueChange={handleJenisKegiatanChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Jenis Kegiatan" />
                  </SelectTrigger>
                  <SelectContent>
                    {jenisKegiatanList.map((item) => (
                      <SelectItem key={item.id} value={item.nama}>
                        <div className="flex items-center gap-2">
                          <Badge variant={item.kategori === "prioritas" ? "default" : "secondary"} className="text-xs">
                            {item.kategori === "prioritas" ? "Prioritas" : "Pendukung"}
                          </Badge>
                          <span className="truncate">{item.nama}</span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tahunAnggaran">Tahun Anggaran</Label>
                <Select value={String(tahunAnggaran)} onValueChange={(value) => setTahunAnggaran(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Tahun" />
                  </SelectTrigger>
                  <SelectContent>
                    {tahunOptions.map((tahun) => (
                      <SelectItem key={tahun} value={String(tahun)}>
                        {tahun}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {isPendukung && (
              <div className="flex items-start gap-2 bg-muted/50 border border-border rounded-lg p-3">
                <Info className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">Kegiatan Pendukung</span>
                  <p className="mt-0.5">
                    Kegiatan pendukung hanya memerlukan data rincian kegiatan, kabupaten/kota, dan nominal anggaran.
                    Kegiatan ini tidak akan ditampilkan di halaman Jadwal Kegiatan.
                  </p>
                </div>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="namaKegiatan">Rincian Kegiatan</Label>
                <Input
                  id="namaKegiatan"
                  value={formData.namaKegiatan}
                  onChange={(e) => setFormData({ ...formData, namaKegiatan: e.target.value })}
                  placeholder="Masukkan rincian kegiatan spesifik"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kabupatenKota">Kabupaten/Kota</Label>
                <Select
                  value={formData.kabupatenKota}
                  onValueChange={(value) => setFormData({ ...formData, kabupatenKota: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Pilih Kabupaten/Kota" />
                  </SelectTrigger>
                  <SelectContent>
                    {kabupatenKotaList.map((item) => (
                      <SelectItem key={item} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paguAnggaran">Nominal Anggaran (Rp)</Label>
                <Input
                  id="paguAnggaran"
                  type="number"
                  value={formData.paguAnggaran}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      paguAnggaran: Number(e.target.value),
                    })
                  }
                  placeholder="0"
                  required
                />
              </div>

              {!isPendukung && (
                <>
                  <div className="space-y-2">
                    <Label htmlFor="jadwalMulai">Jadwal Mulai</Label>
                    <Input
                      id="jadwalMulai"
                      type="date"
                      value={formData.jadwalMulai}
                      onChange={(e) => setFormData({ ...formData, jadwalMulai: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="jadwalSelesai">Jadwal Selesai</Label>
                    <Input
                      id="jadwalSelesai"
                      type="date"
                      value={formData.jadwalSelesai}
                      onChange={(e) => setFormData({ ...formData, jadwalSelesai: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="targetOutput">Deskripsi Target Output</Label>
                    <Textarea
                      id="targetOutput"
                      value={formData.targetOutput}
                      onChange={(e) => setFormData({ ...formData, targetOutput: e.target.value })}
                      placeholder="Jelaskan target output kegiatan secara umum"
                      rows={2}
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {!isPendukung && (
            <div className="space-y-4">
              <div className="flex flex-col gap-3 border-b border-border pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-foreground">Target Output Mingguan</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">Tahun Anggaran: {tahunAnggaran}</p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addTargetMingguan}>
                    <Plus className="mr-1 h-4 w-4" />
                    Tambah Target
                  </Button>
                </div>

                {needsTanggalPelaksanaan && (
                  <div className="flex items-start gap-2 bg-info/10 border border-info/30 rounded-lg p-3">
                    <CalendarPlus className="h-4 w-4 text-info mt-0.5 shrink-0" />
                    <div className="text-xs text-info">
                      <span className="font-medium">Kegiatan dengan satuan "Kali"</span>
                      <p className="mt-0.5 text-muted-foreground">
                        Untuk kegiatan{" "}
                        {formData.jenisKegiatan === "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus"
                          ? "Penegakan Hukum"
                          : "Sosialisasi"}
                        , Anda perlu memasukkan tanggal pelaksanaan spesifik untuk setiap target.
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-3 bg-muted/30 rounded-lg p-3">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Label className="text-sm text-muted-foreground whitespace-nowrap">Filter Bulan:</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {bulanOptions.map((opt) => (
                      <Button
                        key={opt.value}
                        type="button"
                        variant={filterBulan === opt.value ? "default" : "ghost"}
                        size="sm"
                        className="h-7 px-2.5 text-xs"
                        onClick={() => setFilterBulan(opt.value)}
                      >
                        {opt.label.substring(0, 3)}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Menampilkan target untuk:{" "}
                  <span className="font-medium text-foreground">
                    {bulanOptions.find((b) => b.value === filterBulan)?.label} {tahunAnggaran}
                  </span>
                </span>
                <span className="text-xs text-muted-foreground">
                  {filteredTargetMingguan.length} target | {availableWeeks.length} minggu tersedia
                </span>
              </div>

              {filteredTargetMingguan.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
                  <p className="text-sm text-muted-foreground">
                    Belum ada target output untuk bulan {bulanOptions.find((b) => b.value === filterBulan)?.label}.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">Klik "Tambah Target" untuk menambahkan.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredTargetMingguan.map((item, index) => (
                    <div key={index} className="rounded-lg border border-border bg-muted/20 p-4">
                      <div className="grid gap-4 grid-cols-1 md:grid-cols-3">
                        <div className="space-y-1.5">
                          <Label className="text-xs text-muted-foreground">Minggu (ISO Week)</Label>
                          <Select
                            value={String(item.mingguKe)}
                            onValueChange={(value) => updateTargetMingguan(index, "mingguKe", Number(value))}
                          >
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue placeholder="Pilih Minggu" />
                            </SelectTrigger>
                            <SelectContent>
                              {availableWeeks.map((week) => (
                                <SelectItem key={week.week} value={String(week.week)}>
                                  {week.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5">
                          <Label htmlFor="target">{needsTanggalPelaksanaan ? "Jumlah Kegiatan" : "Target"}</Label>
                          <Input
                            type="number"
                            value={item.target}
                            onChange={(e) => updateTargetMingguan(index, "target", Number(e.target.value))}
                            placeholder="0"
                            className="h-9"
                          />
                        </div>
                        <div className="flex items-end gap-2">
                          <div className="flex-1 space-y-1.5">
                            <Label className="text-xs text-muted-foreground">Satuan</Label>
                            <Select
                              value={item.satuan}
                              onValueChange={(value) => updateTargetMingguan(index, "satuan", value)}
                              disabled={needsTanggalPelaksanaan}
                            >
                              <SelectTrigger className="h-9">
                                <SelectValue placeholder="Satuan" />
                              </SelectTrigger>
                              <SelectContent>
                                {satuanOptions.map((opt) => (
                                  <SelectItem key={opt} value={opt}>
                                    {opt}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 text-destructive hover:text-destructive hover:bg-destructive/10"
                            onClick={() => {
                              const actualIndex = targetMingguan.findIndex((t) => t === item)
                              if (actualIndex !== -1) {
                                removeTargetMingguan(actualIndex)
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      {needsTanggalPelaksanaan && (
                        <div className="mt-4 pt-4 border-t border-border">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="text-xs text-muted-foreground">Tanggal Pelaksanaan</Label>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs bg-transparent"
                              onClick={() => addTanggalPelaksanaan(index)}
                            >
                              <CalendarPlus className="h-3 w-3 mr-1" />
                              Tambah Tanggal
                            </Button>
                          </div>
                          {item.tanggalPelaksanaan && item.tanggalPelaksanaan.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {item.tanggalPelaksanaan.map((tanggal, dateIndex) => (
                                <div key={dateIndex} className="flex items-center gap-1 bg-muted rounded-md px-2 py-1">
                                  <Input
                                    type="date"
                                    value={tanggal}
                                    onChange={(e) => updateTanggalPelaksanaan(index, dateIndex, e.target.value)}
                                    className="h-7 w-auto border-0 bg-transparent p-0 text-xs"
                                  />
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-5 w-5 text-muted-foreground hover:text-destructive"
                                    onClick={() => removeTanggalPelaksanaan(index, dateIndex)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              ))}
                            </div>
                          ) : (
                            <p className="text-xs text-muted-foreground">
                              Belum ada tanggal pelaksanaan. Tambahkan sesuai jumlah kegiatan.
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit">{isEdit ? "Simpan Perubahan" : "Tambah Kegiatan"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
