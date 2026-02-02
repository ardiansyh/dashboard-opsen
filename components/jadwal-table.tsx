"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { kabupatenKotaList, mockJadwalOpsgab, jenisKegiatanList, mockKegiatan } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { getMonthsWithWeeks, formatWeekRange, MONTH_NAMES, isCurrentWeek, getCurrentWeekInfo } from "@/lib/iso-week-utils"

const kegiatanColorMap: Record<string, { bg: string; text: string; border: string }> = {
  "Penelusuran dan Penagihan Tunggakan PKB": {
    bg: "bg-activity-1/20",
    text: "text-activity-1",
    border: "border-activity-1/30",
  },
  "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus": {
    bg: "bg-activity-2/20",
    text: "text-activity-2",
    border: "border-activity-2/30",
  },
  "Pemberitahuan atau Penagihan PKB secara Digital": {
    bg: "bg-activity-3/20",
    text: "text-activity-3",
    border: "border-activity-3/30",
  },
  "Pendataan Potensi PKB dan BBNKB serta sinkronisasi data": {
    bg: "bg-activity-4/20",
    text: "text-activity-4",
    border: "border-activity-4/30",
  },
  "Sosialisasi dan Edukasi wajib pajak": {
    bg: "bg-activity-5/20",
    text: "text-activity-5",
    border: "border-activity-5/30",
  },
}

const getKegiatanColor = (jenisKegiatan: string) => {
  return kegiatanColorMap[jenisKegiatan] || { bg: "bg-primary/20", text: "text-primary", border: "border-primary/30" }
}

const prioritasKegiatanList = jenisKegiatanList.filter((jk) => jk.kategori === "prioritas")

const jenisKegiatanOptions = [
  { value: "all", label: "Semua Kegiatan" },
  ...prioritasKegiatanList.map((jk) => ({
    value: jk.nama,
    label: jk.nama,
  })),
]

const kabupatenKotaOptions = [
  { value: "all", label: "Semua Kabupaten/Kota" },
  ...kabupatenKotaList.map((kk) => ({
    value: kk,
    label: kk,
  })),
]

interface SelectedMonths {
  start: { year: number; month: number }
  end: { year: number; month: number }
}

export function JadwalTable() {
  const [jenisKegiatan, setJenisKegiatan] = useState("all")
  const [selectedKabKota, setSelectedKabKota] = useState("all")
  const [selectedMonths, setSelectedMonths] = useState<SelectedMonths>({
    start: { year: 2025, month: 0 },
    end: { year: 2025, month: 1 },
  })

  const monthsWithWeeks = getMonthsWithWeeks(
    selectedMonths.start.year,
    selectedMonths.start.month,
    selectedMonths.end.year,
    selectedMonths.end.month,
  )

  const navigateMonths = (direction: "prev" | "next") => {
    setSelectedMonths((prev) => {
      const offset = direction === "prev" ? -1 : 1
      let newStartMonth = prev.start.month + offset
      let newStartYear = prev.start.year
      let newEndMonth = prev.end.month + offset
      let newEndYear = prev.end.year

      if (newStartMonth < 0) {
        newStartMonth = 11
        newStartYear--
      } else if (newStartMonth > 11) {
        newStartMonth = 0
        newStartYear++
      }

      if (newEndMonth < 0) {
        newEndMonth = 11
        newEndYear--
      } else if (newEndMonth > 11) {
        newEndMonth = 0
        newEndYear++
      }

      return {
        start: { year: newStartYear, month: newStartMonth },
        end: { year: newEndYear, month: newEndMonth },
      }
    })
  }

  const formatBulanKey = (year: number, month: number) => {
    return `${year}-${String(month + 1).padStart(2, "0")}`
  }

  const getTargetMingguanForCell = (kabKota: string, jenisKeg: string, bulan: string, mingguKe: number) => {
    const kegiatan = mockKegiatan.find((k) => k.kabupatenKota === kabKota && k.jenisKegiatan === jenisKeg)

    if (!kegiatan?.targetMingguan) return null

    const target = kegiatan.targetMingguan.find((t) => t.bulan === bulan && t.mingguKe === mingguKe)
    return target
  }

  const formatTanggalPelaksanaan = (tanggal: string) => {
    const date = new Date(tanggal)
    return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" })
  }

  const getJadwalForKabKotaCell = (kabKota: string, bulan: string, mingguKe: number) => {
    const jadwal = mockJadwalOpsgab.find(
      (j) => j.kabupatenKota === kabKota && (jenisKegiatan === "all" || j.jenisKegiatan === jenisKegiatan),
    )

    if (!jadwal) return null

    const mingguData = jadwal.jadwalMingguan.find((m) => m.bulan === bulan && m.mingguKe === mingguKe)

    if (!mingguData) return null

    const targetData = getTargetMingguanForCell(kabKota, jadwal.jenisKegiatan, bulan, mingguKe)

    return {
      ...mingguData,
      keterangan: jadwal.keterangan,
      jenisKegiatan: jadwal.jenisKegiatan,
      target: targetData?.target,
      satuan: targetData?.satuan,
      tanggalPelaksanaan: targetData?.tanggalPelaksanaan,
    }
  }

  const getJadwalForKegiatanCell = (jenisKeg: string, bulan: string, mingguKe: number) => {
    const jadwal = mockJadwalOpsgab.find((j) => j.kabupatenKota === selectedKabKota && j.jenisKegiatan === jenisKeg)

    const targetData = getTargetMingguanForCell(selectedKabKota, jenisKeg, bulan, mingguKe)

    if (!jadwal) {
      if (targetData) {
        return {
          jumlahHari: 0,
          tanggal: "",
          target: targetData.target,
          satuan: targetData.satuan,
          targetOnly: true,
        }
      }
      return null
    }

    const mingguData = jadwal.jadwalMingguan.find((m) => m.bulan === bulan && m.mingguKe === mingguKe)

    if (!mingguData && !targetData) return null

    return {
      ...mingguData,
      keterangan: jadwal.keterangan,
      target: targetData?.target,
      satuan: targetData?.satuan,
      tanggalPelaksanaan: targetData?.tanggalPelaksanaan,
      targetOnly: !mingguData,
    }
  }

  const isKegiatanView = selectedKabKota !== "all"

  const getRows = () => {
    if (isKegiatanView) {
      return prioritasKegiatanList.map((jk) => ({
        id: jk.id,
        label: jk.nama,
        kategori: jk.kategori,
      }))
    } else {
      return kabupatenKotaList
        .filter(
          (kk) =>
            jenisKegiatan === "all" ||
            mockJadwalOpsgab.some((j) => j.kabupatenKota === kk && j.jenisKegiatan === jenisKegiatan),
        )
        .map((kk) => ({
          id: kk,
          label: kk,
        }))
    }
  }

  const rows = getRows()

  const maxWeeksPerMonth = Math.max(...monthsWithWeeks.map((m) => m.weeks.length), 5)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Select value={selectedKabKota} onValueChange={setSelectedKabKota}>
            <SelectTrigger className="w-[220px]">
              <SelectValue placeholder="Kabupaten/Kota" />
            </SelectTrigger>
            <SelectContent>
              {kabupatenKotaOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {!isKegiatanView && (
            <Select value={jenisKegiatan} onValueChange={setJenisKegiatan}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Jenis Kegiatan" />
              </SelectTrigger>
              <SelectContent>
                {jenisKegiatanOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigateMonths("prev")}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="min-w-[200px] text-center text-sm font-medium">
            {MONTH_NAMES[selectedMonths.start.month]} {selectedMonths.start.year} -{" "}
            {MONTH_NAMES[selectedMonths.end.month]} {selectedMonths.end.year}
          </span>
          <Button variant="outline" size="icon" onClick={() => navigateMonths("next")}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {isKegiatanView && (
        <div className="rounded-lg border border-primary/30 bg-primary/10 px-4 py-3">
          <p className="text-sm font-medium text-primary">
            Menampilkan jadwal kegiatan untuk: <span className="font-bold">{selectedKabKota}</span>
          </p>
        </div>
      )}

      {(() => {
        const currentInfo = getCurrentWeekInfo()
        const today = new Date()
        return (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-primary/30 bg-primary/5 px-4 py-2">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-primary animate-pulse" />
                <span className="text-sm font-medium text-primary">Hari Ini:</span>
              </div>
              <span className="text-sm text-foreground">
                {today.toLocaleDateString("id-ID", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>
            <div className="flex items-center gap-2 rounded-md bg-primary/10 px-3 py-1">
              <span className="text-xs text-muted-foreground">Minggu ke-{currentInfo.weekInMonth}</span>
              <span className="text-xs font-medium text-primary">(ISO Week {currentInfo.isoWeek})</span>
            </div>
          </div>
        )
      })()}

      <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-muted/30 p-3">
        <span className="text-xs font-medium text-muted-foreground">Keterangan Warna:</span>
        {prioritasKegiatanList.map((jk) => {
          const colors = getKegiatanColor(jk.nama)
          return (
            <div key={jk.id} className="flex items-center gap-1.5">
              <div className={cn("h-3 w-3 shrink-0 rounded", colors.bg, colors.border, "border")} />
              <span className="text-[10px] text-muted-foreground">{jk.nama.split(" ").slice(0, 2).join(" ")}...</span>
            </div>
          )
        })}
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th
                rowSpan={2}
                className="sticky left-0 z-10 min-w-[50px] border-b border-r border-border bg-muted/50 px-3 py-2 text-center font-medium"
              >
                No.
              </th>
              <th
                rowSpan={2}
                className="sticky left-[50px] z-10 min-w-[250px] border-b border-r border-border bg-muted/50 px-3 py-2 text-left font-medium"
              >
                {isKegiatanView ? "Jenis Kegiatan" : "Kabupaten/Kota"}
              </th>
              {monthsWithWeeks.map((monthData) => (
                <th
                  key={`${monthData.year}-${monthData.month}`}
                  colSpan={monthData.weeks.length || 1}
                  className="border-b border-r border-border px-3 py-2 text-center font-medium"
                >
                  {monthData.monthName} {monthData.year}
                </th>
              ))}
            </tr>
            <tr className="bg-muted/30">
              {monthsWithWeeks.map((monthData) => {
                if (monthData.weeks.length === 0) {
                  return (
                    <th
                      key={`${monthData.year}-${monthData.month}-empty`}
                      className="min-w-[100px] border-b border-r border-border px-2 py-1.5 text-center"
                    >
                      <span className="text-xs font-medium text-muted-foreground">-</span>
                    </th>
                  )
                }
                return monthData.weeks.map((weekInfo) => {
                  const isCurrent = isCurrentWeek(monthData.year, monthData.month, weekInfo.weekInMonth)
                  return (
                    <th
                      key={`${monthData.year}-${monthData.month}-w${weekInfo.weekInMonth}`}
                      className={cn(
                        "min-w-[110px] border-b border-r border-border px-2 py-1.5 text-center relative",
                        isCurrent && "bg-primary/20 border-primary/50"
                      )}
                    >
                      {isCurrent && (
                        <div className="absolute -top-1 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[9px] font-bold px-2 py-0.5 rounded-b-md shadow-sm">
                          Minggu Ini
                        </div>
                      )}
                      <div className={cn("flex flex-col", isCurrent && "pt-2")}>
                        <span className={cn("text-xs font-medium", isCurrent && "text-primary font-bold")}>Minggu {weekInfo.weekInMonth}</span>
                        <span className={cn("text-[10px]", isCurrent ? "text-primary/80" : "text-muted-foreground")}>{formatWeekRange(weekInfo)}</span>
                        <span className={cn("text-[9px]", isCurrent ? "text-primary/60" : "text-muted-foreground/70")}>(ISO {weekInfo.isoWeekNumber})</span>
                      </div>
                    </th>
                  )
                })
              })}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => {
              const rowColor = isKegiatanView ? getKegiatanColor(row.label) : null

              return (
                <tr
                  key={row.id}
                  className={cn("transition-colors hover:bg-muted/30", index % 2 === 0 ? "bg-card" : "bg-card/50")}
                >
                  <td className="sticky left-0 z-10 border-b border-r border-border bg-inherit px-3 py-2 text-center">
                    {index + 1}
                  </td>
                  <td className="sticky left-[50px] z-10 border-b border-r border-border bg-inherit px-3 py-2">
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center gap-2">
                        {isKegiatanView && rowColor && (
                          <div className={cn("h-3 w-3 shrink-0 rounded", rowColor.bg, rowColor.border, "border")} />
                        )}
                        <span className="font-medium">{row.label}</span>
                      </div>
                      {isKegiatanView && "kategori" in row && (
                        <span
                          className={cn(
                            "w-fit rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
                            row.kategori === "prioritas"
                              ? "bg-primary/20 text-primary"
                              : "bg-muted text-muted-foreground",
                          )}
                        >
                          {row.kategori}
                        </span>
                      )}
                    </div>
                  </td>
                  {monthsWithWeeks.map((monthData) => {
                    if (monthData.weeks.length === 0) {
                      return (
                        <td
                          key={`${row.id}-${monthData.year}-${monthData.month}-empty`}
                          className="border-b border-r border-border px-1 py-1 text-center"
                        >
                          <span className="text-muted-foreground/50">-</span>
                        </td>
                      )
                    }
                    return monthData.weeks.map((weekInfo) => {
                      const bulanKey = formatBulanKey(monthData.year, monthData.month)
                      const cellData = isKegiatanView
                        ? getJadwalForKegiatanCell(row.label, bulanKey, weekInfo.weekInMonth)
                        : getJadwalForKabKotaCell(row.label, bulanKey, weekInfo.weekInMonth)

                      const cellColor = isKegiatanView
                        ? getKegiatanColor(row.label)
                        : cellData && "jenisKegiatan" in cellData
                          ? getKegiatanColor(cellData.jenisKegiatan)
                          : { bg: "bg-primary/20", text: "text-primary", border: "border-primary/30" }

                      const isTargetOnly = cellData && "targetOnly" in cellData && cellData.targetOnly
                      const isCurrent = isCurrentWeek(monthData.year, monthData.month, weekInfo.weekInMonth)

                      return (
                        <td
                          key={`${row.id}-${monthData.year}-${monthData.month}-w${weekInfo.weekInMonth}`}
                          className={cn(
                            "border-b border-r border-border px-1 py-1 text-center",
                            isCurrent && "bg-primary/10 border-primary/30"
                          )}
                        >
                          {cellData ? (
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <div
                                    className={cn(
                                      "cursor-pointer rounded px-1.5 py-1 text-xs font-medium",
                                      isTargetOnly
                                        ? "bg-muted/50 text-muted-foreground border border-dashed border-border"
                                        : cn(cellColor.bg, cellColor.text),
                                    )}
                                  >
                                    {cellData.target !== undefined && (
                                      <div className="font-semibold">
                                        {cellData.target.toLocaleString("id-ID")} {cellData.satuan}
                                      </div>
                                    )}
                                    {cellData.satuan === "Kali" && cellData.tanggalPelaksanaan && cellData.tanggalPelaksanaan.length > 0 && (
                                      <div className="text-[10px] opacity-80">
                                        {cellData.tanggalPelaksanaan.map((tgl: string) => formatTanggalPelaksanaan(tgl)).join(", ")}
                                      </div>
                                    )}
                                    {!isTargetOnly && cellData.jumlahHari > 0 && cellData.satuan !== "Kali" && cellData.satuan !== "KBM" && (
                                      <>
                                        <div className={cellData.target !== undefined ? "text-[10px] opacity-80" : ""}>
                                          {cellData.jumlahHari} Hari
                                        </div>
                                        <div className="text-[10px] opacity-80">({cellData.tanggal})</div>
                                      </>
                                    )}
                                    {isTargetOnly && cellData.satuan !== "KBM" && <div className="text-[10px] opacity-60">Target saja</div>}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-medium">{row.label}</p>
                                  <p className="text-xs text-muted-foreground">
                                    Minggu {weekInfo.weekInMonth} (ISO Week {weekInfo.isoWeekNumber})
                                  </p>
                                  <p className="text-xs text-muted-foreground">{formatWeekRange(weekInfo)}</p>
                                  {cellData.target !== undefined && (
                                    <p className="text-xs font-semibold text-primary">
                                      Target: {cellData.target.toLocaleString("id-ID")} {cellData.satuan}
                                    </p>
                                  )}
                                  {cellData.satuan === "Kali" && cellData.tanggalPelaksanaan && cellData.tanggalPelaksanaan.length > 0 && (
                                    <p className="text-xs">
                                      Tanggal Pelaksanaan: {cellData.tanggalPelaksanaan.map((tgl: string) => formatTanggalPelaksanaan(tgl)).join(", ")}
                                    </p>
                                  )}
                                  {!isTargetOnly && cellData.jumlahHari > 0 && cellData.satuan !== "Kali" && cellData.satuan !== "KBM" && (
                                    <p className="text-xs">
                                      {cellData.jumlahHari} Hari (Tanggal: {cellData.tanggal})
                                    </p>
                                  )}
                                  {!isKegiatanView && "jenisKegiatan" in cellData && (
                                    <p className="text-xs text-muted-foreground">Kegiatan: {cellData.jenisKegiatan}</p>
                                  )}
                                  {cellData.keterangan && (
                                    <p className="text-xs text-muted-foreground">{cellData.keterangan}</p>
                                  )}
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          ) : (
                            <span className="text-muted-foreground/50">-</span>
                          )}
                        </td>
                      )
                    })
                  })}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">Petunjuk Penggunaan:</p>
          <ul className="ml-4 mt-1 list-disc space-y-0.5">
            <li>Pilih Kabupaten/Kota tertentu untuk melihat jadwal per jenis kegiatan rolesharing</li>
            <li>Gunakan tombol navigasi untuk berpindah periode bulan</li>
            <li>Arahkan kursor ke sel untuk melihat detail jadwal dan target</li>
            <li>Minggu menggunakan standar ISO-8601 (Senin-Minggu), label bulan ditentukan oleh hari Kamis</li>
            <li>Kegiatan pendukung tidak ditampilkan di jadwal karena tidak memiliki target mingguan</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
