"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Calendar, Wallet, Target, FileText } from "lucide-react"
import type { RealisasiOutput } from "@/lib/mock-data"

interface RealisasiListProps {
  realisasi: RealisasiOutput[]
  paguAnggaran: number
  targetOutput: string
}

export function RealisasiList({ realisasi, paguAnggaran, targetOutput }: RealisasiListProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatPeriode = (periode: string, tipePeriode: "bulanan" | "tanggal") => {
    if (tipePeriode === "bulanan") {
      const [year, month] = periode.split("-")
      const monthNames = [
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
      return `${monthNames[Number.parseInt(month) - 1]} ${year}`
    }
    return new Date(periode).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "long",
      year: "numeric",
    })
  }

  const totalRealisasiAnggaran = realisasi.reduce((sum, r) => sum + r.realisasiAnggaran, 0)
  const totalRealisasiOutput = realisasi.reduce((sum, r) => sum + r.realisasiOutput, 0)
  const persentaseAnggaran = paguAnggaran > 0 ? (totalRealisasiAnggaran / paguAnggaran) * 100 : 0

  const satuanOutputList = [
    ...new Set(realisasi.filter((r) => r.realisasiOutput > 0 && r.satuanOutput).map((r) => r.satuanOutput)),
  ]
  const satuanDisplay = satuanOutputList.length > 0 ? satuanOutputList[0] : ""

  if (realisasi.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-6 text-center">
        <p className="text-sm text-muted-foreground">Belum ada realisasi yang dilaporkan</p>
      </div>
    )
  }

  const anggaranReports = realisasi.filter((r) => r.realisasiAnggaran > 0)
  const outputReports = realisasi.filter((r) => r.realisasiOutput > 0)

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card className="bg-primary/5 border-primary/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Ringkasan Realisasi</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Realisasi Anggaran</span>
            <span className="font-semibold">{formatCurrency(totalRealisasiAnggaran)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Persentase Pagu</span>
            <Badge variant={persentaseAnggaran >= 100 ? "default" : "secondary"}>
              {persentaseAnggaran.toFixed(1)}%
            </Badge>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Jumlah Laporan Anggaran</span>
            <span className="text-sm">{anggaranReports.length} laporan</span>
          </div>
          <Separator className="my-2" />
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total Realisasi Output</span>
            <span className="font-semibold">
              {totalRealisasiOutput.toLocaleString("id-ID")} {satuanDisplay}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Target Output</span>
            <span className="text-sm">{targetOutput}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Jumlah Laporan Output</span>
            <span className="text-sm">{outputReports.length} laporan</span>
          </div>
        </CardContent>
      </Card>

      {/* Realisasi List */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Riwayat Realisasi</h4>
        {realisasi.map((r) => (
          <Card key={r.id} className="bg-card">
            <CardContent className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{formatPeriode(r.periode, r.tipePeriode)}</span>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline" className="text-xs">
                    {r.tipePeriode === "bulanan" ? "Bulanan" : "Per Tanggal"}
                  </Badge>
                  {r.realisasiAnggaran > 0 && r.realisasiOutput === 0 && (
                    <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400">
                      Anggaran
                    </Badge>
                  )}
                  {r.realisasiOutput > 0 && r.realisasiAnggaran === 0 && (
                    <Badge variant="secondary" className="text-xs bg-green-500/20 text-green-400">
                      Output
                    </Badge>
                  )}
                  {r.realisasiAnggaran > 0 && r.realisasiOutput > 0 && (
                    <Badge variant="secondary" className="text-xs bg-purple-500/20 text-purple-400">
                      Lengkap
                    </Badge>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {r.realisasiAnggaran > 0 && (
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Realisasi Anggaran</p>
                      <p className="font-medium">{formatCurrency(r.realisasiAnggaran)}</p>
                    </div>
                  </div>
                )}
                {r.realisasiOutput > 0 && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="text-muted-foreground">Realisasi Output</p>
                      <p className="font-medium">
                        {r.realisasiOutput.toLocaleString("id-ID")} {r.satuanOutput}
                      </p>
                    </div>
                  </div>
                )}
                {r.realisasiAnggaran === 0 && r.realisasiOutput > 0 && (
                  <div className="flex items-center gap-2">
                    <Wallet className="h-4 w-4 text-muted-foreground/50" />
                    <div>
                      <p className="text-muted-foreground/50">Realisasi Anggaran</p>
                      <p className="text-muted-foreground/50 text-sm italic">Tidak dilaporkan</p>
                    </div>
                  </div>
                )}
                {r.realisasiOutput === 0 && r.realisasiAnggaran > 0 && (
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-muted-foreground/50" />
                    <div>
                      <p className="text-muted-foreground/50">Realisasi Output</p>
                      <p className="text-muted-foreground/50 text-sm italic">Tidak dilaporkan</p>
                    </div>
                  </div>
                )}
              </div>

              {r.keterangan && (
                <div className="mt-3 flex items-start gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground mt-0.5" />
                  <p className="text-muted-foreground">{r.keterangan}</p>
                </div>
              )}

              <p className="mt-3 text-xs text-muted-foreground">
                Dilaporkan:{" "}
                {new Date(r.tanggalLapor).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
