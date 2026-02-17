"use client"

import { useState } from "react"
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StatusBadge } from "@/components/status-badge"
import { RealisasiList } from "@/components/realisasi-list"
import { Calendar, MapPin, Target, Wallet, Send, AlertCircle, FileText, ClipboardList } from "lucide-react"
import { type Kegiatan, type RealisasiOutput, kegiatanHasRealisasiOutput } from "@/lib/mock-data"

interface KegiatanDetailProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  kegiatan: Kegiatan | null
  onSubmitPengajuan: (id: string) => void
  onLaporRealisasi?: (kegiatan: Kegiatan) => void
  realisasiData?: RealisasiOutput[]
}

export function KegiatanDetail({
  open,
  onOpenChange,
  kegiatan,
  onSubmitPengajuan,
  onLaporRealisasi,
  realisasiData = [],
}: KegiatanDetailProps) {
  const [activeTab, setActiveTab] = useState("detail")

  if (!kegiatan) return null

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

  // Filter realisasi for this kegiatan
  const kegiatanRealisasi = realisasiData.filter((r) => r.kegiatanId === kegiatan.id)

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">{kegiatan.id}</span>
          </SheetTitle>
          <SheetDescription className="text-left text-base font-medium text-foreground">
            {kegiatan.namaKegiatan}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={kegiatan.status} />
            <Badge variant={kegiatan.kategori === "prioritas" ? "default" : "secondary"}>
              {kegiatan.kategori === "prioritas" ? "Prioritas" : "Pendukung"}
            </Badge>
          </div>

          {kegiatan.status === "divalidasi" ? (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="detail">Detail</TabsTrigger>
                <TabsTrigger value="realisasi">
                  Realisasi
                  {kegiatanRealisasi.length > 0 && (
                    <Badge variant="secondary" className="ml-2 h-5 px-1.5 text-xs">
                      {kegiatanRealisasi.length}
                    </Badge>
                  )}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="detail" className="mt-4">
                <DetailContent kegiatan={kegiatan} formatCurrency={formatCurrency} formatDate={formatDate} />
              </TabsContent>

              <TabsContent value="realisasi" className="mt-4">
                <RealisasiList
                  realisasi={kegiatanRealisasi}
                  paguAnggaran={kegiatan.paguAnggaran}
                  targetOutput={kegiatan.targetOutput}
                />
              </TabsContent>
            </Tabs>
          ) : (
            <>
              <Separator />
              <DetailContent kegiatan={kegiatan} formatCurrency={formatCurrency} formatDate={formatDate} />
            </>
          )}

          <Separator />

          {kegiatan.status === "divalidasi" && onLaporRealisasi && (
            <Button className="w-full" onClick={() => onLaporRealisasi(kegiatan)}>
              <ClipboardList className="mr-2 h-4 w-4" />
              Lapor Realisasi
            </Button>
          )}

          {kegiatan.status === "draft" && (
            <Button className="w-full" onClick={() => onSubmitPengajuan(kegiatan.id)}>
              <Send className="mr-2 h-4 w-4" />
              Ajukan untuk Validasi
            </Button>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

// Separated detail content component for reusability
function DetailContent({
  kegiatan,
  formatCurrency,
  formatDate,
}: {
  kegiatan: Kegiatan
  formatCurrency: (amount: number) => string
  formatDate: (dateString: string) => string
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">Jenis Kegiatan</p>
          <p className="font-medium">{kegiatan.jenisKegiatan}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <MapPin className="mt-0.5 h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">Kabupaten/Kota</p>
          <p className="font-medium">{kegiatan.kabupatenKota}</p>
        </div>
      </div>

      <div className="flex items-start gap-3">
        <Wallet className="mt-0.5 h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">Pagu Anggaran</p>
          <p className="font-medium">{formatCurrency(kegiatan.paguAnggaran)}</p>
        </div>
      </div>

      {kegiatan.targetOutput && (
        <div className="flex items-start gap-3">
          <Target className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Target Output</p>
            <p className="font-medium">{kegiatan.targetOutput}</p>
            {!kegiatanHasRealisasiOutput(kegiatan.jenisKegiatan) && (
              <p className="text-xs text-muted-foreground mt-1 italic">Kegiatan ini hanya melaporkan realisasi anggaran</p>
            )}
          </div>
        </div>
      )}

      {kegiatan.jadwalMulai && kegiatan.jadwalSelesai && (
        <div className="flex items-start gap-3">
          <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
          <div>
            <p className="text-sm text-muted-foreground">Jadwal Pelaksanaan</p>
            <p className="font-medium">
              {formatDate(kegiatan.jadwalMulai)} - {formatDate(kegiatan.jadwalSelesai)}
            </p>
          </div>
        </div>
      )}

      <div className="flex items-start gap-3">
        <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
        <div>
          <p className="text-sm text-muted-foreground">Tanggal Pengajuan</p>
          <p className="font-medium">{formatDate(kegiatan.tanggalPengajuan)}</p>
        </div>
      </div>

      {kegiatan.keterangan && (
        <div className="flex items-start gap-3">
          <AlertCircle className="mt-0.5 h-5 w-5 text-destructive" />
          <div>
            <p className="text-sm text-muted-foreground">Keterangan</p>
            <p className="font-medium text-destructive">{kegiatan.keterangan}</p>
          </div>
        </div>
      )}
    </div>
  )
}
