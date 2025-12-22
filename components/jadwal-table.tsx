"use client"

import { useState } from "react"
import { ChevronLeft, ChevronRight, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { kabupatenKotaList, mockJadwalOpsgab, jenisKegiatanList, mockKegiatan } from "@/lib/mock-data"
import { cn } from "@/lib/utils"

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
  "Kegiatan pendukung optimalisasi penerimaan PKB dan BBNKB": {
    bg: "bg-activity-6/20",
    text: "text-activity-6",
    border: "border-activity-6/30",
  },
}

const getKegiatanColor = (jenisKegiatan: string) => {
  return kegiatanColorMap[jenisKegiatan] || { bg: "bg-primary/20", text: "text-primary", border: "border-primary/30" }
}

const jenisKegiatanOptions = [
  { value: "all", label: "Semua Kegiatan" },
  ...jenisKegiatanList.map((jk) => ({
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

const bulanNames = [
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

  const getMonthsInRange = () => {
    const months: { year: number; month: number; label: string }[] = []
    let current = { ...selectedMonths.start }

    while (
      current.year < selectedMonths.end.year ||
      (current.year === selectedMonths.end.year && current.month <= selectedMonths.end.month)
    ) {
      months.push({
        year: current.year,
        month: current.month,
        label: `${bulanNames[current.month]} ${current.year}`,
      })

      if (current.month === 11) {
        current = { year: current.year + 1, month: 0 }
      } else {
        current = { ...current, month: current.month + 1 }
      }
    }

    return months
  }

  const months = getMonthsInRange()

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

    return kegiatan.targetMingguan.find((t) => t.bulan === bulan && t.mingguKe === mingguKe)
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
      targetOnly: !mingguData,
    }
  }

  const isKegiatanView = selectedKabKota !== "all"

  const getRows = () => {
    if (isKegiatanView) {
      return jenisKegiatanList.map((jk) => ({
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
            {months[0]?.label} - {months[months.length - 1]?.label}
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

      <div className="flex flex-wrap gap-3 rounded-lg border border-border bg-muted/30 p-3">
        <span className="text-xs font-medium text-muted-foreground">Keterangan Warna:</span>
        {jenisKegiatanList.map((jk) => {
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
              {months.map((month) => (
                <th
                  key={`${month.year}-${month.month}`}
                  colSpan={5}
                  className="border-b border-r border-border px-3 py-2 text-center font-medium"
                >
                  {month.label}
                </th>
              ))}
            </tr>
            <tr className="bg-muted/30">
              {months.map((month) =>
                [1, 2, 3, 4, 5].map((week) => (
                  <th
                    key={`${month.year}-${month.month}-${week}`}
                    className="min-w-[80px] border-b border-r border-border px-2 py-1.5 text-center text-xs font-medium"
                  >
                    Minggu {week}
                  </th>
                )),
              )}
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
                  {months.map((month) =>
                    [1, 2, 3, 4, 5].map((week) => {
                      const cellData = isKegiatanView
                        ? getJadwalForKegiatanCell(row.label, formatBulanKey(month.year, month.month), week)
                        : getJadwalForKabKotaCell(row.label, formatBulanKey(month.year, month.month), week)

                      const cellColor = isKegiatanView
                        ? getKegiatanColor(row.label)
                        : cellData && "jenisKegiatan" in cellData
                          ? getKegiatanColor(cellData.jenisKegiatan)
                          : { bg: "bg-primary/20", text: "text-primary", border: "border-primary/30" }

                      const isTargetOnly = cellData && "targetOnly" in cellData && cellData.targetOnly

                      return (
                        <td
                          key={`${row.id}-${month.year}-${month.month}-${week}`}
                          className="border-b border-r border-border px-1 py-1 text-center"
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
                                        {cellData.target} {cellData.satuan}
                                      </div>
                                    )}
                                    {!isTargetOnly && cellData.jumlahHari > 0 && (
                                      <>
                                        <div className={cellData.target !== undefined ? "text-[10px] opacity-80" : ""}>
                                          {cellData.jumlahHari} Hari
                                        </div>
                                        <div className="text-[10px] opacity-80">({cellData.tanggal})</div>
                                      </>
                                    )}
                                    {isTargetOnly && <div className="text-[10px] opacity-60">Target saja</div>}
                                  </div>
                                </TooltipTrigger>
                                <TooltipContent>
                                  <p className="font-medium">{row.label}</p>
                                  {cellData.target !== undefined && (
                                    <p className="text-xs font-semibold text-primary">
                                      Target: {cellData.target} {cellData.satuan}
                                    </p>
                                  )}
                                  {!isTargetOnly && cellData.jumlahHari > 0 && (
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
                    }),
                  )}
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex items-start gap-2 rounded-lg border border-border bg-muted/30 p-3">
        <Info className="mt-0.5 h-4 w-4 text-muted-foreground" />
        <div className="text-xs text-muted-foreground">
          <p className="font-medium">Petunjuk Penggunaan:</p>
          <ul className="mt-1 list-inside list-disc space-y-0.5">
            <li>Pilih "Semua Kabupaten/Kota" untuk melihat jadwal seluruh wilayah</li>
            <li>Pilih kabupaten/kota tertentu untuk melihat jadwal per jenis kegiatan rolesharing</li>
            <li>Gunakan navigasi bulan untuk melihat periode yang berbeda</li>
            <li>Hover pada jadwal untuk melihat detail lengkap</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
