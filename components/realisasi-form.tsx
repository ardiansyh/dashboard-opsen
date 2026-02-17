"use client"

import type React from "react"

import { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { type Kegiatan, type RealisasiOutput, kegiatanHasRealisasiOutput, getKegiatanSatuanOutput } from "@/lib/mock-data"

interface RealisasiFormProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kegiatan: Kegiatan | null
  onSubmit: (data: Omit<RealisasiOutput, "id" | "tanggalLapor">) => void
}

const bulanList = [
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

export function RealisasiForm({ open, onOpenChange, kegiatan, onSubmit }: RealisasiFormProps) {
  const [tipePeriode, setTipePeriode] = useState<"bulanan" | "tanggal">("bulanan")
  const [tahun, setTahun] = useState("2025")
  const [bulan, setBulan] = useState("01")
  const [tanggal, setTanggal] = useState("")

  const [laporAnggaran, setLaporAnggaran] = useState(true)
  const [laporOutput, setLaporOutput] = useState(true)

  const [realisasiAnggaran, setRealisasiAnggaran] = useState("")
  const [realisasiOutput, setRealisasiOutput] = useState("")
  const [satuanOutput, setSatuanOutput] = useState("")
  const [keterangan, setKeterangan] = useState("")

  const canReportOutput = kegiatan ? kegiatanHasRealisasiOutput(kegiatan.jenisKegiatan) : false
  const satuanOptions = kegiatan ? getKegiatanSatuanOutput(kegiatan.jenisKegiatan) : []

  useEffect(() => {
    if (open && kegiatan) {
      // Reset form when opened
      setTipePeriode("bulanan")
      setTahun("2025")
      setBulan("01")
      setTanggal("")
      setLaporAnggaran(true)
      const canOutput = kegiatanHasRealisasiOutput(kegiatan.jenisKegiatan)
      setLaporOutput(canOutput)
      setRealisasiAnggaran("")
      setRealisasiOutput("")
      const satuans = getKegiatanSatuanOutput(kegiatan.jenisKegiatan)
      setSatuanOutput(satuans.length > 0 ? satuans[0] : "")
      setKeterangan("")
    }
  }, [open, kegiatan])

  if (!kegiatan) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    const periode = tipePeriode === "bulanan" ? `${tahun}-${bulan}` : tanggal

    onSubmit({
      kegiatanId: kegiatan.id,
      periode,
      tipePeriode,
      realisasiAnggaran: laporAnggaran ? Number(realisasiAnggaran) || 0 : 0,
      realisasiOutput: laporOutput ? Number(realisasiOutput) || 0 : 0,
      satuanOutput: laporOutput ? satuanOutput : "",
      keterangan,
    })

    onOpenChange(false)
  }

  const isValid = laporAnggaran || laporOutput

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Lapor Realisasi</DialogTitle>
          <DialogDescription>
            Laporkan realisasi anggaran dan/atau output untuk kegiatan:{" "}
            <span className="font-medium text-foreground">{kegiatan.namaKegiatan}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Tipe Periode */}
          <div className="space-y-2">
            <Label>Tipe Periode</Label>
            <Select value={tipePeriode} onValueChange={(v) => setTipePeriode(v as "bulanan" | "tanggal")}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="bulanan">Bulanan</SelectItem>
                <SelectItem value="tanggal">Tanggal Tertentu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Periode Selection */}
          {tipePeriode === "bulanan" ? (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tahun</Label>
                <Select value={tahun} onValueChange={setTahun}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2024">2024</SelectItem>
                    <SelectItem value="2025">2025</SelectItem>
                    <SelectItem value="2026">2026</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Bulan</Label>
                <Select value={bulan} onValueChange={setBulan}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {bulanList.map((b) => (
                      <SelectItem key={b.value} value={b.value}>
                        {b.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Tanggal</Label>
              <Input type="date" value={tanggal} onChange={(e) => setTanggal(e.target.value)} required />
            </div>
          )}

          <div className="space-y-3">
            <Label>Jenis Laporan</Label>
            <p className="text-xs text-muted-foreground">
              {canReportOutput
                ? "Pilih jenis realisasi yang ingin dilaporkan"
                : "Kegiatan ini hanya melaporkan realisasi anggaran"}
            </p>
            <div className="flex flex-col gap-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="lapor-anggaran"
                  checked={laporAnggaran}
                  onCheckedChange={(checked) => setLaporAnggaran(checked as boolean)}
                />
                <label
                  htmlFor="lapor-anggaran"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Realisasi Anggaran
                </label>
              </div>
              {canReportOutput && (
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lapor-output"
                    checked={laporOutput}
                    onCheckedChange={(checked) => setLaporOutput(checked as boolean)}
                  />
                  <label
                    htmlFor="lapor-output"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Realisasi Output
                  </label>
                </div>
              )}
            </div>
            {!isValid && <p className="text-xs text-destructive">Pilih minimal satu jenis laporan</p>}
          </div>

          {/* Realisasi Anggaran - Only show if checkbox is checked */}
          {laporAnggaran && (
            <div className="space-y-2 rounded-lg border border-border p-4">
              <Label>Realisasi Anggaran (Rp)</Label>
              <Input
                type="number"
                placeholder="0"
                value={realisasiAnggaran}
                onChange={(e) => setRealisasiAnggaran(e.target.value)}
                required={laporAnggaran}
              />
              <p className="text-xs text-muted-foreground">
                Pagu Anggaran:{" "}
                {new Intl.NumberFormat("id-ID", {
                  style: "currency",
                  currency: "IDR",
                  minimumFractionDigits: 0,
                }).format(kegiatan.paguAnggaran)}
              </p>
            </div>
          )}

          {/* Realisasi Output - Only show if checkbox is checked */}
          {laporOutput && (
            <div className="space-y-4 rounded-lg border border-border p-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Realisasi Output</Label>
                  <Input
                    type="number"
                    placeholder="0"
                    value={realisasiOutput}
                    onChange={(e) => setRealisasiOutput(e.target.value)}
                    required={laporOutput}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Satuan</Label>
                  {satuanOptions.length === 1 ? (
                    <Input value={satuanOptions[0]} disabled />
                  ) : (
                    <Select value={satuanOutput} onValueChange={setSatuanOutput}>
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih satuan" />
                      </SelectTrigger>
                      <SelectContent>
                        {satuanOptions.map((s) => (
                          <SelectItem key={s} value={s}>
                            {s}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Target Output: {kegiatan.targetOutput}</p>
            </div>
          )}

          {/* Keterangan */}
          <div className="space-y-2">
            <Label>Keterangan</Label>
            <Textarea
              placeholder="Masukkan keterangan realisasi..."
              value={keterangan}
              onChange={(e) => setKeterangan(e.target.value)}
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Batal
            </Button>
            <Button type="submit" disabled={!isValid}>
              Simpan Realisasi
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
