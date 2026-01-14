/**
 * ISO Week Utilities
 *
 * Aturan:
 * 1. Minggu = ISO week (Senin–Minggu)
 * 2. Label bulan ditentukan oleh hari Kamis (Monday + 3 hari)
 * 3. Minggu ke-n dalam bulan: dihitung dari ISO week pertama yang Kamis-nya jatuh di bulan tsb
 * 4. Tahun label mengikuti tahun Kamis tersebut
 */

export interface ISOWeekInfo {
  isoWeekNumber: number // Nomor minggu ISO (1-53)
  weekInMonth: number // Minggu ke-n dalam bulan (1-5)
  monthLabel: number // Bulan label (0-11) berdasarkan hari Kamis
  yearLabel: number // Tahun label berdasarkan hari Kamis
  startDate: Date // Tanggal Senin (awal minggu)
  endDate: Date // Tanggal Minggu (akhir minggu)
  thursdayDate: Date // Tanggal Kamis (penentu label bulan)
}

export interface MonthWeeks {
  year: number
  month: number // 0-11
  monthName: string
  weeks: ISOWeekInfo[]
}

const MONTH_NAMES = [
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

const SHORT_MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"]

/**
 * Mendapatkan nomor minggu ISO dari sebuah tanggal
 */
export function getISOWeekNumber(date: Date): number {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()))
  const dayNum = d.getUTCDay() || 7 // Senin = 1, Minggu = 7
  d.setUTCDate(d.getUTCDate() + 4 - dayNum) // Set ke Kamis minggu tsb
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1))
  return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
}

/**
 * Mendapatkan tanggal Senin (awal) dari ISO week tertentu
 */
export function getISOWeekStartDate(isoYear: number, isoWeek: number): Date {
  // Cari tanggal 4 Januari tahun tersebut (selalu di minggu 1)
  const jan4 = new Date(Date.UTC(isoYear, 0, 4))
  const jan4Day = jan4.getUTCDay() || 7

  // Senin minggu 1
  const week1Monday = new Date(jan4)
  week1Monday.setUTCDate(jan4.getUTCDate() - jan4Day + 1)

  // Tambahkan (isoWeek - 1) * 7 hari
  const targetMonday = new Date(week1Monday)
  targetMonday.setUTCDate(week1Monday.getUTCDate() + (isoWeek - 1) * 7)

  return targetMonday
}

/**
 * Mendapatkan info lengkap untuk sebuah ISO week
 */
export function getISOWeekInfo(isoYear: number, isoWeek: number): ISOWeekInfo {
  const startDate = getISOWeekStartDate(isoYear, isoWeek)

  // End date = Senin + 6 hari (Minggu)
  const endDate = new Date(startDate)
  endDate.setUTCDate(startDate.getUTCDate() + 6)

  // Thursday = Senin + 3 hari
  const thursdayDate = new Date(startDate)
  thursdayDate.setUTCDate(startDate.getUTCDate() + 3)

  // Label bulan dan tahun ditentukan oleh Kamis
  const monthLabel = thursdayDate.getUTCMonth()
  const yearLabel = thursdayDate.getUTCFullYear()

  return {
    isoWeekNumber: isoWeek,
    weekInMonth: 0, // Akan dihitung nanti
    monthLabel,
    yearLabel,
    startDate,
    endDate,
    thursdayDate,
  }
}

/**
 * Generate semua minggu dalam setahun dengan penomoran minggu per bulan
 */
export function generateYearWeeks(year: number): ISOWeekInfo[] {
  const weeks: ISOWeekInfo[] = []

  // Cari jumlah minggu ISO dalam tahun ini
  const dec31 = new Date(Date.UTC(year, 11, 31))
  const lastWeek = getISOWeekNumber(dec31)
  const totalWeeks = lastWeek === 1 ? 52 : lastWeek

  // Juga cek apakah ada minggu dari tahun sebelumnya yang masuk ke Januari
  const jan1 = new Date(Date.UTC(year, 0, 1))
  const jan1Week = getISOWeekNumber(jan1)

  // Jika 1 Januari bukan minggu 1, berarti ada minggu dari tahun lalu
  let startWeek = 1
  let startYear = year
  if (jan1Week > 50) {
    // Minggu terakhir tahun lalu masuk ke Januari tahun ini
    startWeek = jan1Week
    startYear = year - 1
  }

  // Counter untuk minggu per bulan
  const monthWeekCounters: { [key: string]: number } = {}

  // Generate minggu dari tahun sebelumnya jika perlu
  if (startYear < year) {
    const weekInfo = getISOWeekInfo(startYear, startWeek)
    if (weekInfo.yearLabel === year) {
      const monthKey = `${weekInfo.yearLabel}-${weekInfo.monthLabel}`
      monthWeekCounters[monthKey] = (monthWeekCounters[monthKey] || 0) + 1
      weekInfo.weekInMonth = monthWeekCounters[monthKey]
      weeks.push(weekInfo)
    }
  }

  // Generate semua minggu tahun ini
  for (let w = 1; w <= totalWeeks; w++) {
    const weekInfo = getISOWeekInfo(year, w)

    // Hanya masukkan jika label tahunnya sama dengan tahun yang diminta
    // atau jika Kamis-nya jatuh di tahun yang diminta
    if (weekInfo.yearLabel === year) {
      const monthKey = `${weekInfo.yearLabel}-${weekInfo.monthLabel}`
      monthWeekCounters[monthKey] = (monthWeekCounters[monthKey] || 0) + 1
      weekInfo.weekInMonth = monthWeekCounters[monthKey]
      weeks.push(weekInfo)
    }
  }

  // Cek minggu pertama tahun depan yang mungkin masuk Desember
  const nextYearWeek1 = getISOWeekInfo(year + 1, 1)
  if (nextYearWeek1.yearLabel === year) {
    const monthKey = `${nextYearWeek1.yearLabel}-${nextYearWeek1.monthLabel}`
    monthWeekCounters[monthKey] = (monthWeekCounters[monthKey] || 0) + 1
    nextYearWeek1.weekInMonth = monthWeekCounters[monthKey]
    weeks.push(nextYearWeek1)
  }

  return weeks
}

/**
 * Mendapatkan minggu-minggu untuk bulan tertentu
 * Berdasarkan aturan: minggu masuk ke bulan jika Kamis-nya jatuh di bulan tersebut
 */
export function getWeeksForMonth(year: number, month: number): ISOWeekInfo[] {
  const allWeeks = generateYearWeeks(year)
  return allWeeks.filter((w) => w.yearLabel === year && w.monthLabel === month)
}

/**
 * Mendapatkan minggu-minggu yang dikelompokkan per bulan untuk rentang tertentu
 */
export function getMonthsWithWeeks(
  startYear: number,
  startMonth: number,
  endYear: number,
  endMonth: number,
): MonthWeeks[] {
  const result: MonthWeeks[] = []

  let currentYear = startYear
  let currentMonth = startMonth

  while (currentYear < endYear || (currentYear === endYear && currentMonth <= endMonth)) {
    const weeks = getWeeksForMonth(currentYear, currentMonth)

    result.push({
      year: currentYear,
      month: currentMonth,
      monthName: MONTH_NAMES[currentMonth],
      weeks,
    })

    // Next month
    if (currentMonth === 11) {
      currentMonth = 0
      currentYear++
    } else {
      currentMonth++
    }
  }

  return result
}

/**
 * Format tanggal pendek (e.g., "27 Jan")
 */
export function formatShortDate(date: Date): string {
  const day = date.getUTCDate()
  return `${day} ${SHORT_MONTH_NAMES[date.getUTCMonth()]}`
}

/**
 * Format rentang tanggal minggu (e.g., "27 Jan - 2 Feb")
 */
export function formatWeekRange(weekInfo: ISOWeekInfo): string {
  return `${formatShortDate(weekInfo.startDate)} - ${formatShortDate(weekInfo.endDate)}`
}

/**
 * Mendapatkan label minggu lengkap (e.g., "Minggu 1 (27 Jan - 2 Feb)")
 */
export function getWeekLabel(weekInfo: ISOWeekInfo): string {
  return `Minggu ${weekInfo.weekInMonth} (${formatWeekRange(weekInfo)})`
}

export { MONTH_NAMES, SHORT_MONTH_NAMES }
