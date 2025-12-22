"use client"

import type React from "react"

import { useState, useEffect } from "react"
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
import { Plus, Trash2 } from "lucide-react"
import { kabupatenKotaList, jenisKegiatanList, type Kegiatan, type TargetOutputMingguan } from "@/lib/mock-data"

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

const satuanOptions = [
  "Unit",
  "Kendaraan",
  "Orang",
  "Titik Operasi",
  "Notifikasi",
  "Dokumen",
  "Kegiatan",
  "Wajib Pajak",
  "Data",
  "Laporan",
]

export function KegiatanForm({ open, onOpenChange, kegiatan, onSubmit }: KegiatanFormProps) {
  const [tahunAnggaran, setTahunAnggaran] = useState<number>(2025)

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
  }

  const addTargetMingguan = () => {
    setTargetMingguan([...targetMingguan, { bulan: "01", mingguKe: 1, target: 0, satuan: "Unit" }])
  }

  const updateTargetMingguan = (index: number, field: keyof TargetOutputMingguan, value: string | number) => {
    const updated = [...targetMingguan]
    updated[index] = { ...updated[index], [field]: value }
    setTargetMingguan(updated)
  }

  const removeTargetMingguan = (index: number) => {
    setTargetMingguan(targetMingguan.filter((_, i) => i !== index))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Convert bulan format ke tahun-bulan sebelum submit
    const targetMingguanWithYear = targetMingguan.map((item) => ({
      ...item,
      bulan: item.bulan.includes("-") ? item.bulan : `${tahunAnggaran}-${item.bulan}`,
    }))
    onSubmit({ ...formData, targetMingguan: targetMingguanWithYear })
    onOpenChange(false)
  }

  const isEdit = !!kegiatan

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
          {/* Detail Kegiatan Section */}
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
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-2">
              <div>
                <h3 className="text-sm font-semibold text-foreground">Target Output Mingguan</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Tahun Anggaran: {tahunAnggaran}</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={addTargetMingguan}>
                <Plus className="mr-1 h-4 w-4" />
                Tambah Target
              </Button>
            </div>

            {targetMingguan.length === 0 ? (
              <div className="rounded-lg border border-dashed border-border bg-muted/30 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Belum ada target output mingguan. Klik "Tambah Target" untuk menambahkan.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {targetMingguan.map((item, index) => (
                  <div key={index} className="rounded-lg border border-border bg-muted/20 p-4">
                    <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Bulan</Label>
                        <Select
                          value={item.bulan.includes("-") ? item.bulan.split("-")[1] : item.bulan}
                          onValueChange={(value) => updateTargetMingguan(index, "bulan", value)}
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue placeholder="Pilih Bulan" />
                          </SelectTrigger>
                          <SelectContent>
                            {bulanOptions.map((opt) => (
                              <SelectItem key={opt.value} value={opt.value}>
                                {opt.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Minggu Ke</Label>
                        <Select
                          value={String(item.mingguKe)}
                          onValueChange={(value) => updateTargetMingguan(index, "mingguKe", Number(value))}
                        >
                          <SelectTrigger className="h-9 w-full">
                            <SelectValue placeholder="Minggu" />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5].map((w) => (
                              <SelectItem key={w} value={String(w)}>
                                Minggu {w}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Target</Label>
                        <Input
                          type="number"
                          value={item.target}
                          onChange={(e) => updateTargetMingguan(index, "target", Number(e.target.value))}
                          placeholder="0"
                          className="h-9 w-full"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Satuan</Label>
                        <div className="flex gap-2">
                          <Select
                            value={item.satuan}
                            onValueChange={(value) => updateTargetMingguan(index, "satuan", value)}
                          >
                            <SelectTrigger className="h-9 w-full">
                              <SelectValue placeholder="Satuan" />
                            </SelectTrigger>
                            <SelectContent>
                              {satuanOptions.map((sat) => (
                                <SelectItem key={sat} value={sat}>
                                  {sat}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-9 w-9 shrink-0 text-destructive hover:bg-destructive/10 hover:text-destructive"
                            onClick={() => removeTargetMingguan(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {targetMingguan.length > 0 && (
              <div className="rounded-lg bg-muted/30 px-3 py-2">
                <p className="text-xs text-muted-foreground">
                  Total: {targetMingguan.length} target mingguan ditambahkan untuk tahun {tahunAnggaran}
                </p>
              </div>
            )}
          </div>

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
