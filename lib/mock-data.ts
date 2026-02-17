export type KegiatanStatus = "draft" | "diajukan" | "divalidasi" | "ditolak"

export type KategoriKegiatan = "prioritas" | "pendukung"

export interface TargetOutputMingguan {
  bulan: string // format: "2025-01"
  mingguKe: number // 1-5
  target: number
  satuan: string // e.g., "Unit", "Kendaraan", "Orang", "Kali", etc.
  tanggalPelaksanaan?: string[] // format: ["2025-01-15", "2025-01-16"] - untuk kegiatan dengan satuan "Kali"
}

export interface RealisasiOutput {
  id: string
  kegiatanId: string
  periode: string // format: "2025-01" for monthly or "2025-01-15" for specific date
  tipePeriode: "bulanan" | "tanggal"
  realisasiAnggaran: number
  realisasiOutput: number
  satuanOutput: string
  keterangan: string
  tanggalLapor: string
}

export interface Kegiatan {
  id: string
  namaKegiatan: string
  jenisKegiatan: string
  kategori: KategoriKegiatan
  kabupatenKota: string
  paguAnggaran: number
  targetOutput: string
  jadwalMulai: string
  jadwalSelesai: string
  status: KegiatanStatus
  tanggalPengajuan: string
  keterangan?: string
  targetMingguan?: TargetOutputMingguan[]
  realisasi?: RealisasiOutput[]
}

export interface RealisasiAnggaran {
  id: string
  kegiatanId: string
  bulan: string
  jumlah: number
  keterangan: string
}

export type SumberAnggaran = "dpa_prov" | "cost_sharing" | "mandiri"

export interface JadwalKegiatan {
  id: string
  kabupatenKota: string // changed from p3d
  jenisKegiatan: string
  jadwalMingguan: {
    bulan: string
    mingguKe: number
    jumlahHari: number
    tanggal: string
  }[]
  sumberAnggaran: SumberAnggaran
  keterangan?: string
}

export interface JenisKegiatanMeta {
  id: string
  nama: string
  kategori: KategoriKegiatan
  satuanOutput: string[]
  hasTargetMingguan: boolean
  hasRealisasiOutput: boolean
}

export const jenisKegiatanList: JenisKegiatanMeta[] = [
  { id: "JK01", nama: "Penelusuran dan Penagihan Tunggakan PKB", kategori: "prioritas", satuanOutput: ["KBM"], hasTargetMingguan: true, hasRealisasiOutput: true },
  { id: "JK02", nama: "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus", kategori: "prioritas", satuanOutput: ["Kali"], hasTargetMingguan: true, hasRealisasiOutput: true },
  { id: "JK03", nama: "Pemberitahuan atau Penagihan PKB secara Digital", kategori: "prioritas", satuanOutput: ["KBM"], hasTargetMingguan: true, hasRealisasiOutput: true },
  { id: "JK04", nama: "Pendataan Potensi PKB dan BBNKB serta Sinkronisasi Data", kategori: "prioritas", satuanOutput: ["Desa", "Petugas"], hasTargetMingguan: false, hasRealisasiOutput: true },
  { id: "JK05", nama: "Sosialisasi dan Edukasi Wajib Pajak", kategori: "prioritas", satuanOutput: ["Rupiah"], hasTargetMingguan: false, hasRealisasiOutput: false },
  { id: "JK06", nama: "Kegiatan Pendukung Optimalisasi Penerimaan PKB dan BBNKB", kategori: "pendukung", satuanOutput: ["Rupiah"], hasTargetMingguan: false, hasRealisasiOutput: false },
]

// Helper functions to check jenis kegiatan rules
export function getJenisKegiatanMeta(jenisKegiatan: string): JenisKegiatanMeta | undefined {
  return jenisKegiatanList.find((jk) => jk.nama === jenisKegiatan)
}

export function kegiatanHasTargetMingguan(jenisKegiatan: string): boolean {
  return getJenisKegiatanMeta(jenisKegiatan)?.hasTargetMingguan ?? false
}

export function kegiatanHasRealisasiOutput(jenisKegiatan: string): boolean {
  return getJenisKegiatanMeta(jenisKegiatan)?.hasRealisasiOutput ?? false
}

export function getKegiatanSatuanOutput(jenisKegiatan: string): string[] {
  return getJenisKegiatanMeta(jenisKegiatan)?.satuanOutput ?? []
}

export const kabupatenKotaList = [
  "Kota Bandung",
  "Kota Bekasi",
  "Kota Bogor",
  "Kota Cimahi",
  "Kota Cirebon",
  "Kota Depok",
  "Kota Sukabumi",
  "Kota Tasikmalaya",
  "Kota Banjar",
  "Kab. Bandung",
  "Kab. Bandung Barat",
  "Kab. Bekasi",
  "Kab. Bogor",
  "Kab. Ciamis",
  "Kab. Cianjur",
  "Kab. Cirebon",
  "Kab. Garut",
  "Kab. Indramayu",
  "Kab. Karawang",
  "Kab. Kuningan",
  "Kab. Majalengka",
  "Kab. Pangandaran",
  "Kab. Purwakarta",
  "Kab. Subang",
  "Kab. Sukabumi",
  "Kab. Sumedang",
  "Kab. Tasikmalaya",
]

export const mockKegiatan: Kegiatan[] = [
  {
    id: "KG001",
    namaKegiatan: "Penagihan Tunggakan PKB Kendaraan Roda 4 Tahun 2020-2023",
    jenisKegiatan: "Penelusuran dan Penagihan Tunggakan PKB",
    kategori: "prioritas",
    kabupatenKota: "Kota Bandung",
    paguAnggaran: 150000000,
    targetOutput: "5000 KBM",
    jadwalMulai: "2025-01-15",
    jadwalSelesai: "2025-06-30",
    status: "divalidasi",
    tanggalPengajuan: "2025-01-10",
    targetMingguan: [
      { bulan: "2025-01", mingguKe: 3, target: 200, satuan: "KBM" },
      { bulan: "2025-01", mingguKe: 4, target: 250, satuan: "KBM" },
      { bulan: "2025-02", mingguKe: 1, target: 300, satuan: "KBM" },
      { bulan: "2025-02", mingguKe: 2, target: 350, satuan: "KBM" },
      { bulan: "2025-02", mingguKe: 3, target: 400, satuan: "KBM" },
      { bulan: "2025-02", mingguKe: 4, target: 400, satuan: "KBM" },
      { bulan: "2025-03", mingguKe: 1, target: 450, satuan: "KBM" },
      { bulan: "2025-03", mingguKe: 2, target: 450, satuan: "KBM" },
      { bulan: "2025-03", mingguKe: 3, target: 500, satuan: "KBM" },
      { bulan: "2025-03", mingguKe: 4, target: 500, satuan: "KBM" },
      { bulan: "2025-04", mingguKe: 1, target: 350, satuan: "KBM" },
      { bulan: "2025-04", mingguKe: 2, target: 350, satuan: "KBM" },
      { bulan: "2025-05", mingguKe: 1, target: 250, satuan: "KBM" },
      { bulan: "2025-05", mingguKe: 2, target: 250, satuan: "KBM" },
    ],
    realisasi: [
      {
        id: "RO001",
        kegiatanId: "KG001",
        periode: "2025-01",
        tipePeriode: "bulanan",
        realisasiAnggaran: 25000000,
        realisasiOutput: 850,
        satuanOutput: "KBM",
        keterangan: "Penagihan tunggakan PKB tahap 1 wilayah Bandung Utara",
        tanggalLapor: "2025-02-05",
      },
      {
        id: "RO002",
        kegiatanId: "KG001",
        periode: "2025-02",
        tipePeriode: "bulanan",
        realisasiAnggaran: 35000000,
        realisasiOutput: 1200,
        satuanOutput: "KBM",
        keterangan: "Penagihan tunggakan PKB tahap 2 wilayah Bandung Selatan",
        tanggalLapor: "2025-03-03",
      },
    ],
  },
  {
    id: "KG002",
    namaKegiatan: "Operasi Gabungan Penertiban Pajak Kendaraan Bermotor",
    jenisKegiatan: "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus",
    kategori: "prioritas",
    kabupatenKota: "Kab. Karawang",
    paguAnggaran: 85000000,
    targetOutput: "12 kali operasi gabungan",
    jadwalMulai: "2025-02-01",
    jadwalSelesai: "2025-05-31",
    status: "diajukan",
    tanggalPengajuan: "2025-01-18",
    targetMingguan: [
      { bulan: "2025-02", mingguKe: 1, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-02-04"] },
      { bulan: "2025-02", mingguKe: 2, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-02-11"] },
      { bulan: "2025-02", mingguKe: 3, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-02-18"] },
      { bulan: "2025-02", mingguKe: 4, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-02-25"] },
      { bulan: "2025-03", mingguKe: 1, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-03-04"] },
      { bulan: "2025-03", mingguKe: 2, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-03-11"] },
      { bulan: "2025-03", mingguKe: 3, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-03-18"] },
      { bulan: "2025-03", mingguKe: 4, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-03-25"] },
      { bulan: "2025-04", mingguKe: 1, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-04-01"] },
      { bulan: "2025-04", mingguKe: 2, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-04-08"] },
      { bulan: "2025-05", mingguKe: 1, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-05-06"] },
      { bulan: "2025-05", mingguKe: 2, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-05-13"] },
    ],
  },
  {
    id: "KG003",
    namaKegiatan: "Pengiriman Notifikasi Digital PKB via SMS dan WhatsApp",
    jenisKegiatan: "Pemberitahuan atau Penagihan PKB secara Digital",
    kategori: "prioritas",
    kabupatenKota: "Kota Bekasi",
    paguAnggaran: 75000000,
    targetOutput: "50000 KBM",
    jadwalMulai: "2025-03-01",
    jadwalSelesai: "2025-12-31",
    status: "draft",
    tanggalPengajuan: "2025-01-20",
    targetMingguan: [
      { bulan: "2025-03", mingguKe: 1, target: 5000, satuan: "KBM" },
      { bulan: "2025-03", mingguKe: 2, target: 5000, satuan: "KBM" },
      { bulan: "2025-03", mingguKe: 3, target: 5000, satuan: "KBM" },
      { bulan: "2025-03", mingguKe: 4, target: 5000, satuan: "KBM" },
      { bulan: "2025-04", mingguKe: 1, target: 4000, satuan: "KBM" },
      { bulan: "2025-04", mingguKe: 2, target: 4000, satuan: "KBM" },
      { bulan: "2025-04", mingguKe: 3, target: 4000, satuan: "KBM" },
      { bulan: "2025-04", mingguKe: 4, target: 4000, satuan: "KBM" },
      { bulan: "2025-05", mingguKe: 1, target: 3500, satuan: "KBM" },
      { bulan: "2025-05", mingguKe: 2, target: 3500, satuan: "KBM" },
      { bulan: "2025-05", mingguKe: 3, target: 3500, satuan: "KBM" },
      { bulan: "2025-05", mingguKe: 4, target: 3500, satuan: "KBM" },
    ],
  },
  {
    id: "KG004",
    namaKegiatan: "Pendataan Kendaraan Bermotor di Wilayah Perbatasan",
    jenisKegiatan: "Pendataan Potensi PKB dan BBNKB serta Sinkronisasi Data",
    kategori: "prioritas",
    kabupatenKota: "Kab. Cirebon",
    paguAnggaran: 120000000,
    targetOutput: "15 Desa, 30 Petugas",
    jadwalMulai: "2025-02-15",
    jadwalSelesai: "2025-08-15",
    status: "ditolak",
    tanggalPengajuan: "2025-01-12",
    keterangan: "Data pendukung baseline belum lengkap",
  },
  {
    id: "KG005",
    namaKegiatan: "Sosialisasi Pajak Kendaraan di Kecamatan",
    jenisKegiatan: "Sosialisasi dan Edukasi Wajib Pajak",
    kategori: "prioritas",
    kabupatenKota: "Kab. Sukabumi",
    paguAnggaran: 95000000,
    targetOutput: "Rp 95.000.000",
    jadwalMulai: "2025-04-01",
    jadwalSelesai: "2025-10-31",
    status: "diajukan",
    tanggalPengajuan: "2025-01-22",
  },
  {
    id: "KG006",
    namaKegiatan: "Operasi Khusus Penindakan Kendaraan Bodong",
    jenisKegiatan: "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus",
    kategori: "prioritas",
    kabupatenKota: "Kab. Bogor",
    paguAnggaran: 110000000,
    targetOutput: "8 kali operasi khusus",
    jadwalMulai: "2025-03-01",
    jadwalSelesai: "2025-09-30",
    status: "divalidasi",
    tanggalPengajuan: "2025-01-08",
    targetMingguan: [
      { bulan: "2025-03", mingguKe: 1, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-03-05"] },
      { bulan: "2025-03", mingguKe: 3, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-03-19"] },
      { bulan: "2025-04", mingguKe: 2, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-04-09"] },
      { bulan: "2025-04", mingguKe: 4, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-04-23"] },
      { bulan: "2025-05", mingguKe: 2, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-05-14"] },
      { bulan: "2025-06", mingguKe: 1, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-06-04"] },
      { bulan: "2025-07", mingguKe: 2, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-07-09"] },
      { bulan: "2025-08", mingguKe: 1, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-08-06"] },
    ],
    realisasi: [
      {
        id: "RO003",
        kegiatanId: "KG006",
        periode: "2025-03-05",
        tipePeriode: "tanggal",
        realisasiAnggaran: 15000000,
        realisasiOutput: 1,
        satuanOutput: "Kali",
        keterangan: "Operasi penindakan di 5 kecamatan wilayah Bogor Barat",
        tanggalLapor: "2025-03-06",
      },
    ],
  },
  {
    id: "KG007",
    namaKegiatan: "Pengadaan Sistem Informasi Penagihan Terintegrasi",
    jenisKegiatan: "Kegiatan Pendukung Optimalisasi Penerimaan PKB dan BBNKB",
    kategori: "pendukung",
    kabupatenKota: "Kota Depok",
    paguAnggaran: 250000000,
    targetOutput: "Rp 250.000.000",
    jadwalMulai: "2025-02-01",
    jadwalSelesai: "2025-07-31",
    status: "draft",
    tanggalPengajuan: "2025-01-25",
  },
  {
    id: "KG008",
    namaKegiatan: "Penelusuran Data Tunggakan PKB Kendaraan Dinas",
    jenisKegiatan: "Penelusuran dan Penagihan Tunggakan PKB",
    kategori: "prioritas",
    kabupatenKota: "Kab. Indramayu",
    paguAnggaran: 65000000,
    targetOutput: "1500 KBM",
    jadwalMulai: "2025-04-01",
    jadwalSelesai: "2025-08-31",
    status: "diajukan",
    tanggalPengajuan: "2025-01-28",
    targetMingguan: [
      { bulan: "2025-04", mingguKe: 1, target: 100, satuan: "KBM" },
      { bulan: "2025-04", mingguKe: 2, target: 120, satuan: "KBM" },
      { bulan: "2025-04", mingguKe: 3, target: 130, satuan: "KBM" },
      { bulan: "2025-04", mingguKe: 4, target: 140, satuan: "KBM" },
      { bulan: "2025-05", mingguKe: 1, target: 150, satuan: "KBM" },
      { bulan: "2025-05", mingguKe: 2, target: 150, satuan: "KBM" },
      { bulan: "2025-05", mingguKe: 3, target: 150, satuan: "KBM" },
      { bulan: "2025-05", mingguKe: 4, target: 160, satuan: "KBM" },
      { bulan: "2025-06", mingguKe: 1, target: 100, satuan: "KBM" },
      { bulan: "2025-06", mingguKe: 2, target: 100, satuan: "KBM" },
      { bulan: "2025-07", mingguKe: 1, target: 100, satuan: "KBM" },
      { bulan: "2025-07", mingguKe: 2, target: 100, satuan: "KBM" },
    ],
  },
  {
    id: "KG009",
    namaKegiatan: "Sosialisasi Kesadaran Pajak Kendaraan ke Komunitas",
    jenisKegiatan: "Sosialisasi dan Edukasi Wajib Pajak",
    kategori: "prioritas",
    kabupatenKota: "Kota Cimahi",
    paguAnggaran: 55000000,
    targetOutput: "Rp 55.000.000",
    jadwalMulai: "2025-01-01",
    jadwalSelesai: "2025-06-30",
    status: "divalidasi",
    tanggalPengajuan: "2025-01-05",
    realisasi: [
      {
        id: "RO004",
        kegiatanId: "KG009",
        periode: "2025-01",
        tipePeriode: "bulanan",
        realisasiAnggaran: 15000000,
        realisasiOutput: 0,
        satuanOutput: "Rupiah",
        keterangan: "Kampanye digital bulan Januari - Instagram & Facebook Ads",
        tanggalLapor: "2025-02-01",
      },
      {
        id: "RO005",
        kegiatanId: "KG009",
        periode: "2025-02",
        tipePeriode: "bulanan",
        realisasiAnggaran: 18000000,
        realisasiOutput: 0,
        satuanOutput: "Rupiah",
        keterangan: "Kampanye digital bulan Februari - TikTok & YouTube",
        tanggalLapor: "2025-03-02",
      },
    ],
  },
  {
    id: "KG010",
    namaKegiatan: "Sinkronisasi Data Kendaraan dengan Kepolisian",
    jenisKegiatan: "Pendataan Potensi PKB dan BBNKB serta Sinkronisasi Data",
    kategori: "prioritas",
    kabupatenKota: "Kab. Garut",
    paguAnggaran: 90000000,
    targetOutput: "10 Desa, 20 Petugas",
    jadwalMulai: "2025-03-15",
    jadwalSelesai: "2025-06-15",
    status: "diajukan",
    tanggalPengajuan: "2025-02-01",
  },
  {
    id: "KG011",
    namaKegiatan: "Penagihan Tunggakan PKB Kendaraan Niaga",
    jenisKegiatan: "Penelusuran dan Penagihan Tunggakan PKB",
    kategori: "prioritas",
    kabupatenKota: "Kota Bogor",
    paguAnggaran: 125000000,
    targetOutput: "3500 KBM",
    jadwalMulai: "2025-02-01",
    jadwalSelesai: "2025-07-31",
    status: "divalidasi",
    tanggalPengajuan: "2025-01-15",
    targetMingguan: [
      { bulan: "2025-02", mingguKe: 1, target: 150, satuan: "KBM" },
      { bulan: "2025-02", mingguKe: 2, target: 200, satuan: "KBM" },
      { bulan: "2025-02", mingguKe: 3, target: 200, satuan: "KBM" },
      { bulan: "2025-03", mingguKe: 1, target: 250, satuan: "KBM" },
    ],
    realisasi: [
      {
        id: "RO006",
        kegiatanId: "KG011",
        periode: "2025-02",
        tipePeriode: "bulanan",
        realisasiAnggaran: 30000000,
        realisasiOutput: 520,
        satuanOutput: "KBM",
        keterangan: "Penagihan kendaraan niaga wilayah Bogor Tengah dan Timur",
        tanggalLapor: "2025-03-05",
      },
    ],
  },
  {
    id: "KG012",
    namaKegiatan: "Operasi Gabungan Razia Pajak Kendaraan",
    jenisKegiatan: "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus",
    kategori: "prioritas",
    kabupatenKota: "Kota Bogor",
    paguAnggaran: 95000000,
    targetOutput: "6 Kali operasi gabungan",
    jadwalMulai: "2025-03-01",
    jadwalSelesai: "2025-06-30",
    status: "diajukan",
    tanggalPengajuan: "2025-02-10",
    targetMingguan: [
      { bulan: "2025-03", mingguKe: 2, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-03-12"] },
      { bulan: "2025-03", mingguKe: 4, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-03-26"] },
      { bulan: "2025-04", mingguKe: 2, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-04-09"] },
      { bulan: "2025-04", mingguKe: 4, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-04-23"] },
      { bulan: "2025-05", mingguKe: 2, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-05-14"] },
      { bulan: "2025-05", mingguKe: 4, target: 1, satuan: "Kali", tanggalPelaksanaan: ["2025-05-28"] },
    ],
  },
  {
    id: "KG013",
    namaKegiatan: "Sosialisasi PKB melalui Media Massa",
    jenisKegiatan: "Sosialisasi dan Edukasi Wajib Pajak",
    kategori: "prioritas",
    kabupatenKota: "Kab. Cianjur",
    paguAnggaran: 85000000,
    targetOutput: "Rp 85.000.000",
    jadwalMulai: "2025-04-01",
    jadwalSelesai: "2025-09-30",
    status: "divalidasi",
    tanggalPengajuan: "2025-02-20",
    realisasi: [
      {
        id: "RO007",
        kegiatanId: "KG013",
        periode: "2025-04",
        tipePeriode: "bulanan",
        realisasiAnggaran: 20000000,
        realisasiOutput: 0,
        satuanOutput: "Rupiah",
        keterangan: "Sosialisasi di 4 kecamatan wilayah Cianjur Utara",
        tanggalLapor: "2025-05-02",
      },
    ],
  },
  {
    id: "KG014",
    namaKegiatan: "Pendataan Kendaraan Bermotor Baru",
    jenisKegiatan: "Pendataan Potensi PKB dan BBNKB serta Sinkronisasi Data",
    kategori: "prioritas",
    kabupatenKota: "Kab. Cianjur",
    paguAnggaran: 75000000,
    targetOutput: "12 Desa, 25 Petugas",
    jadwalMulai: "2025-03-01",
    jadwalSelesai: "2025-08-31",
    status: "draft",
    tanggalPengajuan: "2025-02-25",
  },
  {
    id: "KG015",
    namaKegiatan: "Notifikasi Digital PKB via Aplikasi Mobile",
    jenisKegiatan: "Pemberitahuan atau Penagihan PKB secara Digital",
    kategori: "prioritas",
    kabupatenKota: "Kab. Subang",
    paguAnggaran: 65000000,
    targetOutput: "30000 KBM",
    jadwalMulai: "2025-02-15",
    jadwalSelesai: "2025-11-30",
    status: "divalidasi",
    tanggalPengajuan: "2025-01-30",
    targetMingguan: [
      { bulan: "2025-02", mingguKe: 3, target: 3000, satuan: "KBM" },
      { bulan: "2025-02", mingguKe: 4, target: 3000, satuan: "KBM" },
      { bulan: "2025-03", mingguKe: 1, target: 4000, satuan: "KBM" },
      { bulan: "2025-03", mingguKe: 2, target: 4000, satuan: "KBM" },
      { bulan: "2025-03", mingguKe: 3, target: 4500, satuan: "KBM" },
      { bulan: "2025-03", mingguKe: 4, target: 4500, satuan: "KBM" },
      { bulan: "2025-04", mingguKe: 1, target: 3500, satuan: "KBM" },
      { bulan: "2025-04", mingguKe: 2, target: 3500, satuan: "KBM" },
    ],
    realisasi: [
      {
        id: "RO008",
        kegiatanId: "KG015",
        periode: "2025-02",
        tipePeriode: "bulanan",
        realisasiAnggaran: 12000000,
        realisasiOutput: 5800,
        satuanOutput: "KBM",
        keterangan: "Pengiriman notifikasi melalui push notification dan SMS",
        tanggalLapor: "2025-03-03",
      },
    ],
  },
  {
    id: "KG016",
    namaKegiatan: "Operasi Khusus Penertiban Kendaraan Mutasi",
    jenisKegiatan: "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus",
    kategori: "prioritas",
    kabupatenKota: "Kab. Subang",
    paguAnggaran: 70000000,
    targetOutput: "6 Kali operasi khusus",
    jadwalMulai: "2025-04-01",
    jadwalSelesai: "2025-07-31",
    status: "diajukan",
    tanggalPengajuan: "2025-03-01",
  },
  {
    id: "KG017",
    namaKegiatan: "Workshop Pajak Kendaraan untuk Komunitas",
    jenisKegiatan: "Sosialisasi dan Edukasi Wajib Pajak",
    kategori: "prioritas",
    kabupatenKota: "Kota Cirebon",
    paguAnggaran: 45000000,
    targetOutput: "Rp 45.000.000",
    jadwalMulai: "2025-03-15",
    jadwalSelesai: "2025-08-15",
    status: "divalidasi",
    tanggalPengajuan: "2025-02-10",
    realisasi: [
      {
        id: "RO009",
        kegiatanId: "KG017",
        periode: "2025-03",
        tipePeriode: "bulanan",
        realisasiAnggaran: 10000000,
        realisasiOutput: 0,
        satuanOutput: "Rupiah",
        keterangan: "Workshop untuk komunitas motor dan mobil antik",
        tanggalLapor: "2025-04-01",
      },
    ],
  },
  {
    id: "KG018",
    namaKegiatan: "Penelusuran Tunggakan PKB Kendaraan Angkutan Umum",
    jenisKegiatan: "Penelusuran dan Penagihan Tunggakan PKB",
    kategori: "prioritas",
    kabupatenKota: "Kota Cirebon",
    paguAnggaran: 80000000,
    targetOutput: "1200 angkutan umum tertagih",
    jadwalMulai: "2025-02-01",
    jadwalSelesai: "2025-06-30",
    status: "draft",
    tanggalPengajuan: "2025-01-28",
  },
  {
    id: "KG019",
    namaKegiatan: "Pelatihan Petugas Samsat Mobile",
    jenisKegiatan: "Kegiatan Pendukung Optimalisasi Penerimaan PKB dan BBNKB",
    kategori: "pendukung",
    kabupatenKota: "Kab. Purwakarta",
    paguAnggaran: 60000000,
    targetOutput: "Rp 60.000.000",
    jadwalMulai: "2025-03-01",
    jadwalSelesai: "2025-05-31",
    status: "divalidasi",
    tanggalPengajuan: "2025-02-05",
    realisasi: [
      {
        id: "RO010",
        kegiatanId: "KG019",
        periode: "2025-03",
        tipePeriode: "bulanan",
        realisasiAnggaran: 25000000,
        realisasiOutput: 0,
        satuanOutput: "Rupiah",
        keterangan: "Pelatihan batch 1 - teknis operasional Samsat Mobile",
        tanggalLapor: "2025-04-02",
      },
    ],
  },
  {
    id: "KG020",
    namaKegiatan: "Sinkronisasi Database Kendaraan Antar Instansi",
    jenisKegiatan: "Pendataan Potensi PKB dan BBNKB serta Sinkronisasi Data",
    kategori: "prioritas",
    kabupatenKota: "Kab. Purwakarta",
    paguAnggaran: 100000000,
    targetOutput: "20 Desa, 40 Petugas",
    jadwalMulai: "2025-04-01",
    jadwalSelesai: "2025-09-30",
    status: "diajukan",
    tanggalPengajuan: "2025-03-01",
  },
  {
    id: "KG021",
    namaKegiatan: "Penagihan Digital via E-Samsat",
    jenisKegiatan: "Pemberitahuan atau Penagihan PKB secara Digital",
    kategori: "prioritas",
    kabupatenKota: "Kab. Majalengka",
    paguAnggaran: 55000000,
    targetOutput: "20000 KBM",
    jadwalMulai: "2025-02-01",
    jadwalSelesai: "2025-12-31",
    status: "divalidasi",
    tanggalPengajuan: "2025-01-20",
    targetMingguan: [
      { bulan: "2025-02", mingguKe: 1, target: 1500, satuan: "KBM" },
      { bulan: "2025-02", mingguKe: 2, target: 1500, satuan: "KBM" },
      { bulan: "2025-02", mingguKe: 3, target: 1800, satuan: "KBM" },
      { bulan: "2025-02", mingguKe: 4, target: 1800, satuan: "KBM" },
      { bulan: "2025-03", mingguKe: 1, target: 2000, satuan: "KBM" },
      { bulan: "2025-03", mingguKe: 2, target: 2000, satuan: "KBM" },
      { bulan: "2025-03", mingguKe: 3, target: 2200, satuan: "KBM" },
      { bulan: "2025-03", mingguKe: 4, target: 2200, satuan: "KBM" },
      { bulan: "2025-04", mingguKe: 1, target: 2500, satuan: "KBM" },
      { bulan: "2025-04", mingguKe: 2, target: 2500, satuan: "KBM" },
    ],
    realisasi: [
      {
        id: "RO011",
        kegiatanId: "KG021",
        periode: "2025-02",
        tipePeriode: "bulanan",
        realisasiAnggaran: 8000000,
        realisasiOutput: 1850,
        satuanOutput: "KBM",
        keterangan: "Transaksi e-samsat bulan Februari",
        tanggalLapor: "2025-03-02",
      },
    ],
  },
  {
    id: "KG022",
    namaKegiatan: "Operasi Gabungan dengan TNI-Polri",
    jenisKegiatan: "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus",
    kategori: "prioritas",
    kabupatenKota: "Kab. Majalengka",
    paguAnggaran: 90000000,
    targetOutput: "6 Kali operasi gabungan",
    jadwalMulai: "2025-05-01",
    jadwalSelesai: "2025-08-31",
    status: "draft",
    tanggalPengajuan: "2025-03-15",
  },
  {
    id: "KG023",
    namaKegiatan: "Edukasi Pajak di Sekolah dan Kampus",
    jenisKegiatan: "Sosialisasi dan Edukasi Wajib Pajak",
    kategori: "prioritas",
    kabupatenKota: "Kota Tasikmalaya",
    paguAnggaran: 50000000,
    targetOutput: "Rp 50.000.000",
    jadwalMulai: "2025-03-01",
    jadwalSelesai: "2025-11-30",
    status: "divalidasi",
    tanggalPengajuan: "2025-02-01",
    realisasi: [
      {
        id: "RO012",
        kegiatanId: "KG023",
        periode: "2025-03",
        tipePeriode: "bulanan",
        realisasiAnggaran: 8000000,
        realisasiOutput: 0,
        satuanOutput: "Rupiah",
        keterangan: "Edukasi di 5 SMA dan 2 kampus di Tasikmalaya",
        tanggalLapor: "2025-04-01",
      },
    ],
  },
  {
    id: "KG024",
    namaKegiatan: "Pengadaan Kendaraan Operasional Samsat Keliling",
    jenisKegiatan: "Kegiatan Pendukung Optimalisasi Penerimaan PKB dan BBNKB",
    kategori: "pendukung",
    kabupatenKota: "Kota Tasikmalaya",
    paguAnggaran: 350000000,
    targetOutput: "Rp 350.000.000",
    jadwalMulai: "2025-04-01",
    jadwalSelesai: "2025-09-30",
    status: "diajukan",
    tanggalPengajuan: "2025-02-15",
  },
]

export const mockRealisasi: RealisasiAnggaran[] = [
  {
    id: "RL001",
    kegiatanId: "KG001",
    bulan: "2025-01",
    jumlah: 25000000,
    keterangan: "Pengadaan data dan koordinasi awal",
  },
  {
    id: "RL002",
    kegiatanId: "KG001",
    bulan: "2025-02",
    jumlah: 35000000,
    keterangan: "Pelaksanaan penagihan tahap 1",
  },
  {
    id: "RL003",
    kegiatanId: "KG006",
    bulan: "2025-03",
    jumlah: 40000000,
    keterangan: "Operasi penindakan di 5 kecamatan",
  },
  {
    id: "RL004",
    kegiatanId: "KG009",
    bulan: "2025-01",
    jumlah: 15000000,
    keterangan: "Produksi konten dan iklan digital",
  },
]

export const mockJadwalOpsgab: JadwalKegiatan[] = [
  {
    id: "JDW01",
    kabupatenKota: "Kab. Bogor",
    jenisKegiatan: "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus",
    jadwalMingguan: [
      { bulan: "2025-11", mingguKe: 2, jumlahHari: 3, tanggal: "11,12,13" },
      { bulan: "2025-11", mingguKe: 3, jumlahHari: 3, tanggal: "18,19,20" },
      { bulan: "2025-11", mingguKe: 4, jumlahHari: 3, tanggal: "25,26,27" },
      { bulan: "2025-12", mingguKe: 1, jumlahHari: 3, tanggal: "2,3,4" },
      { bulan: "2025-12", mingguKe: 2, jumlahHari: 3, tanggal: "9,10,11" },
    ],
    sumberAnggaran: "cost_sharing",
  },
  {
    id: "JDW02",
    kabupatenKota: "Kota Bogor",
    jenisKegiatan: "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus",
    jadwalMingguan: [
      { bulan: "2025-11", mingguKe: 2, jumlahHari: 2, tanggal: "11,12" },
      { bulan: "2025-11", mingguKe: 3, jumlahHari: 2, tanggal: "18,19" },
      { bulan: "2025-12", mingguKe: 2, jumlahHari: 2, tanggal: "9,10" },
      { bulan: "2025-12", mingguKe: 3, jumlahHari: 2, tanggal: "16,17" },
    ],
    sumberAnggaran: "mandiri",
  },
  {
    id: "JDW03",
    kabupatenKota: "Kota Sukabumi",
    jenisKegiatan: "Sosialisasi dan Edukasi Wajib Pajak",
    jadwalMingguan: [{ bulan: "2025-11", mingguKe: 4, jumlahHari: 3, tanggal: "25,26,27" }],
    sumberAnggaran: "mandiri",
  },
  {
    id: "JDW04",
    kabupatenKota: "Kab. Sukabumi",
    jenisKegiatan: "Penelusuran dan Penagihan Tunggakan PKB",
    jadwalMingguan: [
      { bulan: "2025-11", mingguKe: 2, jumlahHari: 2, tanggal: "11,12" },
      { bulan: "2025-12", mingguKe: 1, jumlahHari: 4, tanggal: "1,2,3,4" },
    ],
    sumberAnggaran: "cost_sharing",
  },
  {
    id: "JDW05",
    kabupatenKota: "Kab. Cianjur",
    jenisKegiatan: "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus",
    jadwalMingguan: [{ bulan: "2025-11", mingguKe: 1, jumlahHari: 4, tanggal: "4,5,6" }],
    sumberAnggaran: "cost_sharing",
  },
  {
    id: "JDW06",
    kabupatenKota: "Kota Depok",
    jenisKegiatan: "Pemberitahuan atau Penagihan PKB secara Digital",
    jadwalMingguan: [
      { bulan: "2025-11", mingguKe: 2, jumlahHari: 3, tanggal: "11,12,13" },
      { bulan: "2025-11", mingguKe: 4, jumlahHari: 3, tanggal: "25,26,27" },
    ],
    sumberAnggaran: "cost_sharing",
  },
  {
    id: "JDW07",
    kabupatenKota: "Kota Bekasi",
    jenisKegiatan: "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus",
    jadwalMingguan: [{ bulan: "2025-11", mingguKe: 2, jumlahHari: 3, tanggal: "11,12,13" }],
    sumberAnggaran: "dpa_prov",
  },
  {
    id: "JDW08",
    kabupatenKota: "Kab. Bekasi",
    jenisKegiatan: "Pendataan Potensi PKB dan BBNKB serta Sinkronisasi Data",
    jadwalMingguan: [
      { bulan: "2025-11", mingguKe: 2, jumlahHari: 2, tanggal: "12,13" },
      { bulan: "2025-11", mingguKe: 3, jumlahHari: 3, tanggal: "18,19,20" },
      { bulan: "2025-11", mingguKe: 4, jumlahHari: 2, tanggal: "26,27" },
      { bulan: "2025-12", mingguKe: 2, jumlahHari: 2, tanggal: "10,11" },
      { bulan: "2025-12", mingguKe: 4, jumlahHari: 2, tanggal: "24,25" },
    ],
    sumberAnggaran: "cost_sharing",
  },
  {
    id: "JDW09",
    kabupatenKota: "Kab. Karawang",
    jenisKegiatan: "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus",
    jadwalMingguan: [{ bulan: "2025-11", mingguKe: 2, jumlahHari: 3, tanggal: "11,12,13" }],
    sumberAnggaran: "dpa_prov",
  },
  {
    id: "JDW10",
    kabupatenKota: "Kab. Purwakarta",
    jenisKegiatan: "Penelusuran dan Penagihan Tunggakan PKB",
    jadwalMingguan: [{ bulan: "2025-11", mingguKe: 4, jumlahHari: 3, tanggal: "25,26,27" }],
    sumberAnggaran: "cost_sharing",
  },
  {
    id: "JDW11",
    kabupatenKota: "Kab. Subang",
    jenisKegiatan: "Sosialisasi dan Edukasi Wajib Pajak",
    jadwalMingguan: [{ bulan: "2025-11", mingguKe: 3, jumlahHari: 1, tanggal: "18" }],
    sumberAnggaran: "mandiri",
  },
  {
    id: "JDW12",
    kabupatenKota: "Kota Cirebon",
    jenisKegiatan: "Pemberitahuan atau Penagihan PKB secara Digital",
    jadwalMingguan: [
      { bulan: "2025-11", mingguKe: 2, jumlahHari: 1, tanggal: "13" },
      { bulan: "2025-11", mingguKe: 3, jumlahHari: 1, tanggal: "20" },
      { bulan: "2025-11", mingguKe: 4, jumlahHari: 1, tanggal: "27" },
      { bulan: "2025-12", mingguKe: 1, jumlahHari: 1, tanggal: "4" },
      { bulan: "2025-12", mingguKe: 2, jumlahHari: 1, tanggal: "11" },
      { bulan: "2025-12", mingguKe: 3, jumlahHari: 1, tanggal: "18" },
    ],
    sumberAnggaran: "mandiri",
  },
  {
    id: "JDW13",
    kabupatenKota: "Kab. Cirebon",
    jenisKegiatan: "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus",
    jadwalMingguan: [
      { bulan: "2025-11", mingguKe: 2, jumlahHari: 3, tanggal: "11,12,13" },
      { bulan: "2025-12", mingguKe: 1, jumlahHari: 3, tanggal: "2,3,4" },
    ],
    sumberAnggaran: "cost_sharing",
  },
  {
    id: "JDW14",
    kabupatenKota: "Kab. Indramayu",
    jenisKegiatan: "Pendataan Potensi PKB dan BBNKB serta Sinkronisasi Data",
    jadwalMingguan: [
      { bulan: "2025-11", mingguKe: 2, jumlahHari: 2, tanggal: "12,13" },
      { bulan: "2025-11", mingguKe: 3, jumlahHari: 1, tanggal: "18" },
    ],
    sumberAnggaran: "dpa_prov",
  },
  {
    id: "JDW15",
    kabupatenKota: "Kab. Kuningan",
    jenisKegiatan: "Sosialisasi dan Edukasi Wajib Pajak",
    jadwalMingguan: [{ bulan: "2025-11", mingguKe: 3, jumlahHari: 3, tanggal: "18,19,20" }],
    sumberAnggaran: "dpa_prov",
  },
  {
    id: "JDW16",
    kabupatenKota: "Kab. Majalengka",
    jenisKegiatan: "Penelusuran dan Penagihan Tunggakan PKB",
    jadwalMingguan: [{ bulan: "2025-11", mingguKe: 1, jumlahHari: 3, tanggal: "4,5,6" }],
    sumberAnggaran: "cost_sharing",
  },
  {
    id: "JDW17",
    kabupatenKota: "Kota Bandung",
    jenisKegiatan: "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus",
    jadwalMingguan: [{ bulan: "2025-11", mingguKe: 1, jumlahHari: 3, tanggal: "4,5,6" }],
    sumberAnggaran: "cost_sharing",
  },
  {
    id: "JDW18",
    kabupatenKota: "Kab. Bandung",
    jenisKegiatan: "Kegiatan Pendukung Optimalisasi Penerimaan PKB dan BBNKB",
    jadwalMingguan: [
      { bulan: "2025-11", mingguKe: 3, jumlahHari: 3, tanggal: "19,20,21" },
      { bulan: "2025-11", mingguKe: 4, jumlahHari: 3, tanggal: "26,27,28" },
      { bulan: "2025-12", mingguKe: 1, jumlahHari: 3, tanggal: "3,4,5" },
    ],
    sumberAnggaran: "mandiri",
  },
  {
    id: "JDW19",
    kabupatenKota: "Kab. Bandung Barat",
    jenisKegiatan: "Pendataan Potensi PKB dan BBNKB serta Sinkronisasi Data",
    jadwalMingguan: [
      { bulan: "2025-11", mingguKe: 1, jumlahHari: 3, tanggal: "4,5,6" },
      { bulan: "2025-12", mingguKe: 2, jumlahHari: 3, tanggal: "9,10,11" },
    ],
    sumberAnggaran: "cost_sharing",
  },
  {
    id: "JDW20",
    kabupatenKota: "Kab. Sumedang",
    jenisKegiatan: "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus",
    jadwalMingguan: [
      { bulan: "2025-11", mingguKe: 2, jumlahHari: 3, tanggal: "11,12,13" },
      { bulan: "2025-12", mingguKe: 1, jumlahHari: 3, tanggal: "2,3,4" },
    ],
    sumberAnggaran: "cost_sharing",
  },
  {
    id: "JDW21",
    kabupatenKota: "Kab. Garut",
    jenisKegiatan: "Penelusuran dan Penagihan Tunggakan PKB",
    jadwalMingguan: [{ bulan: "2025-11", mingguKe: 2, jumlahHari: 3, tanggal: "11,12,13" }],
    sumberAnggaran: "dpa_prov",
    keterangan: "APBD Prov",
  },
  {
    id: "JDW22",
    kabupatenKota: "Kota Tasikmalaya",
    jenisKegiatan: "Sosialisasi dan Edukasi Wajib Pajak",
    jadwalMingguan: [{ bulan: "2025-11", mingguKe: 3, jumlahHari: 3, tanggal: "18,19,20" }],
    sumberAnggaran: "cost_sharing",
  },
  {
    id: "JDW23",
    kabupatenKota: "Kota Tasikmalaya",
    jenisKegiatan: "Pemberitahuan atau Penagihan PKB secara Digital",
    jadwalMingguan: [
      { bulan: "2025-11", mingguKe: 1, jumlahHari: 3, tanggal: "4,5,6" },
      { bulan: "2025-12", mingguKe: 1, jumlahHari: 2, tanggal: "1,2" },
    ],
    sumberAnggaran: "cost_sharing",
  },
  {
    id: "JDW24",
    kabupatenKota: "Kab. Ciamis",
    jenisKegiatan: "Penegakan Hukum melalui Operasi Gabungan dan Operasi Khusus",
    jadwalMingguan: [
      { bulan: "2025-11", mingguKe: 2, jumlahHari: 2, tanggal: "12,14" },
      { bulan: "2025-12", mingguKe: 1, jumlahHari: 2, tanggal: "2,4" },
    ],
    sumberAnggaran: "cost_sharing",
  },
  {
    id: "JDW25",
    kabupatenKota: "Kab. Pangandaran",
    jenisKegiatan: "Kegiatan Pendukung Optimalisasi Penerimaan PKB dan BBNKB",
    jadwalMingguan: [
      { bulan: "2025-11", mingguKe: 3, jumlahHari: 1, tanggal: "19" },
      { bulan: "2025-11", mingguKe: 4, jumlahHari: 1, tanggal: "26" },
      { bulan: "2025-11", mingguKe: 5, jumlahHari: 1, tanggal: "28" },
    ],
    sumberAnggaran: "cost_sharing",
  },
  {
    id: "JDW26",
    kabupatenKota: "Kota Cimahi",
    jenisKegiatan: "Pendataan Potensi PKB dan BBNKB serta Sinkronisasi Data",
    jadwalMingguan: [{ bulan: "2025-11", mingguKe: 3, jumlahHari: 3, tanggal: "18,19,20" }],
    sumberAnggaran: "dpa_prov",
  },
  {
    id: "JDW27",
    kabupatenKota: "Kota Banjar",
    jenisKegiatan: "Sosialisasi dan Edukasi Wajib Pajak",
    jadwalMingguan: [
      { bulan: "2025-11", mingguKe: 2, jumlahHari: 3, tanggal: "11,12,13" },
      { bulan: "2025-11", mingguKe: 4, jumlahHari: 3, tanggal: "25,26,27" },
    ],
    sumberAnggaran: "cost_sharing",
  },
]

export const mockRealisasiOutput: RealisasiOutput[] = [
  {
    id: "RO001",
    kegiatanId: "KG001",
    periode: "2025-01",
    tipePeriode: "bulanan",
    realisasiAnggaran: 25000000,
    realisasiOutput: 850,
    satuanOutput: "Kendaraan",
    keterangan: "Penagihan tunggakan PKB tahap 1 wilayah Bandung Utara",
    tanggalLapor: "2025-02-05",
  },
  {
    id: "RO002",
    kegiatanId: "KG001",
    periode: "2025-02",
    tipePeriode: "bulanan",
    realisasiAnggaran: 35000000,
    realisasiOutput: 1200,
    satuanOutput: "Kendaraan",
    keterangan: "Penagihan tunggakan PKB tahap 2 wilayah Bandung Selatan",
    tanggalLapor: "2025-03-03",
  },
  {
    id: "RO003",
    kegiatanId: "KG006",
    periode: "2025-03-15",
    tipePeriode: "tanggal",
    realisasiAnggaran: 40000000,
    realisasiOutput: 125,
    satuanOutput: "Kendaraan Bodong",
    keterangan: "Operasi penindakan di 5 kecamatan wilayah Bogor Barat",
    tanggalLapor: "2025-03-16",
  },
  {
    id: "RO004",
    kegiatanId: "KG009",
    periode: "2025-01",
    tipePeriode: "bulanan",
    realisasiAnggaran: 15000000,
    realisasiOutput: 25000,
    satuanOutput: "Reach",
    keterangan: "Kampanye digital bulan Januari - Instagram & Facebook Ads",
    tanggalLapor: "2025-02-01",
  },
  {
    id: "RO005",
    kegiatanId: "KG009",
    periode: "2025-02",
    tipePeriode: "bulanan",
    realisasiAnggaran: 18000000,
    realisasiOutput: 35000,
    satuanOutput: "Reach",
    keterangan: "Kampanye digital bulan Februari - TikTok & YouTube",
    tanggalLapor: "2025-03-02",
  },
  {
    id: "RO006",
    kegiatanId: "KG011",
    periode: "2025-02",
    tipePeriode: "bulanan",
    realisasiAnggaran: 30000000,
    realisasiOutput: 520,
    satuanOutput: "Kendaraan",
    keterangan: "Penagihan kendaraan niaga wilayah Bogor Tengah dan Timur",
    tanggalLapor: "2025-03-05",
  },
  {
    id: "RO007",
    kegiatanId: "KG013",
    periode: "2025-04",
    tipePeriode: "bulanan",
    realisasiAnggaran: 20000000,
    realisasiOutput: 350,
    satuanOutput: "Peserta",
    keterangan: "Sosialisasi di 4 kecamatan wilayah Cianjur Utara",
    tanggalLapor: "2025-05-02",
  },
  {
    id: "RO008",
    kegiatanId: "KG015",
    periode: "2025-02",
    tipePeriode: "bulanan",
    realisasiAnggaran: 12000000,
    realisasiOutput: 5800,
    satuanOutput: "Notifikasi",
    keterangan: "Pengiriman notifikasi melalui push notification dan SMS",
    tanggalLapor: "2025-03-03",
  },
  {
    id: "RO009",
    kegiatanId: "KG017",
    periode: "2025-03",
    tipePeriode: "bulanan",
    realisasiAnggaran: 10000000,
    realisasiOutput: 120,
    satuanOutput: "Peserta",
    keterangan: "Workshop untuk komunitas motor dan mobil antik",
    tanggalLapor: "2025-04-01",
  },
  {
    id: "RO010",
    kegiatanId: "KG019",
    periode: "2025-03",
    tipePeriode: "bulanan",
    realisasiAnggaran: 25000000,
    realisasiOutput: 25,
    satuanOutput: "Petugas",
    keterangan: "Pelatihan batch 1 - teknis operasional Samsat Mobile",
    tanggalLapor: "2025-04-02",
  },
  {
    id: "RO011",
    kegiatanId: "KG021",
    periode: "2025-02",
    tipePeriode: "bulanan",
    realisasiAnggaran: 8000000,
    realisasiOutput: 1850,
    satuanOutput: "Transaksi",
    keterangan: "Transaksi e-samsat bulan Februari",
    tanggalLapor: "2025-03-02",
  },
]

export const getSumberAnggaranLabel = (sumber: SumberAnggaran): string => {
  switch (sumber) {
    case "dpa_prov":
      return "DPA Prov."
    case "cost_sharing":
      return "Cost Sharing"
    case "mandiri":
      return "Mandiri"
    default:
      return sumber
  }
}

export const getSumberAnggaranColor = (sumber: SumberAnggaran): string => {
  switch (sumber) {
    case "dpa_prov":
      return "bg-red-500/20 text-red-400 border-red-500/30"
    case "cost_sharing":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30"
    case "mandiri":
      return "bg-green-500/20 text-green-400 border-green-500/30"
    default:
      return "bg-muted text-muted-foreground"
  }
}
