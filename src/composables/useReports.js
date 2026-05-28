/**
 * StaySafe.my.id — useReports composable (Shared Singleton State)
 */

import { ref, computed } from 'vue'
import { REGIONS, detectRegionFromCoords } from '../config/regions.js'

// Helper functions for mock dates
function daysAgo(d) {
  const date = new Date()
  date.setDate(date.getDate() - d)
  date.setHours(Math.floor(Math.random() * 24), Math.floor(Math.random() * 60))
  return date
}

function hoursAgo(h) {
  return new Date(Date.now() - h * 3600_000)
}

// 65+ realistic mock reports across Jakarta and regional clusters with human-readable addresses
const MOCK_REPORTS = [
  // ── kekerasan / begal ──────────────────────────────────────────────
  { id: 'r001', category: 'kekerasan', subcategory: 'begal', description: 'Begal motor di jalan sepi dekat Sudirman, pelaku dua orang berboncengan.', location: { type: 'Point', coordinates: [106.8230, -6.2088] }, address: 'Jl. Jend. Sudirman, Setiabudi, Jakarta Selatan', createdAt: hoursAgo(2) },
  { id: 'r002', category: 'kekerasan', subcategory: 'begal', description: 'Korban ditodong senjata tajam dan dirampas HP serta dompet saat melintas Jl. Gatot Subroto malam hari.', location: { type: 'Point', coordinates: [106.8271, -6.2325] }, address: 'Jl. Gatot Subroto, Mampang Prapatan, Jakarta Selatan', createdAt: hoursAgo(8) },
  { id: 'r003', category: 'kekerasan', subcategory: 'begal', description: 'Begal di kolong flyover Cawang, korban luka ringan.', location: { type: 'Point', coordinates: [106.8700, -6.2540] }, address: 'Flyover Cawang, Kramat Jati, Jakarta Timur', createdAt: daysAgo(1) },
  { id: 'r004', category: 'kekerasan', subcategory: 'begal', description: 'Dua pemuda di motor menyerang pengemudi ojol di kawasan Kalibata.', location: { type: 'Point', coordinates: [106.8560, -6.2580] }, address: 'Kalibata, Pancoran, Jakarta Selatan', createdAt: daysAgo(2) },
  { id: 'r005', category: 'kekerasan', subcategory: 'begal', description: 'Begal dengan celurit di jalur Rawamangun dini hari.', location: { type: 'Point', coordinates: [106.8860, -6.1930] }, address: 'Rawamangun, Pulo Gadung, Jakarta Timur', createdAt: daysAgo(4) },

  // ── kekerasan / penodongan ─────────────────────────────────────────
  { id: 'r006', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan di halte bus TransJakarta Harmoni, pelaku bawa pisau.', location: { type: 'Point', coordinates: [106.8194, -6.1685] }, address: 'Harmoni, Gambir, Jakarta Pusat', createdAt: hoursAgo(5) },
  { id: 'r007', category: 'kekerasan', subcategory: 'penodongan', description: 'Ditodong saat keluar ATM di Jl. Thamrin malam hari.', location: { type: 'Point', coordinates: [106.8229, -6.1935] }, address: 'Jl. MH Thamrin, Menteng, Jakarta Pusat', createdAt: daysAgo(1) },
  { id: 'r008', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan di parkiran mall Menteng, pelaku kabur menggunakan motor.', location: { type: 'Point', coordinates: [106.8370, -6.1940] }, address: 'Menteng, Jakarta Pusat', createdAt: daysAgo(3) },

  // ── kekerasan / penganiayaan ───────────────────────────────────────
  { id: 'r009', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Penganiayaan oleh pengendara mobil terhadap ojol di Kuningan akibat kemacetan.', location: { type: 'Point', coordinates: [106.8316, -6.2280] }, address: 'Kuningan, Setiabudi, Jakarta Selatan', createdAt: hoursAgo(12) },
  { id: 'r010', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Warga dikeroyok sekelompok orang di gang sempit Manggarai.', location: { type: 'Point', coordinates: [106.8494, -6.2130] }, address: 'Manggarai, Tebet, Jakarta Selatan', createdAt: daysAgo(2) },
  { id: 'r011', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Pengemudi taksi dipukul penumpang di kawasan Tanah Abang.', location: { type: 'Point', coordinates: [106.8118, -6.1862] }, address: 'Tanah Abang, Jakarta Pusat', createdAt: daysAgo(5) },

  // ── kekerasan / pelecehan seksual ──────────────────────────────────
  { id: 'r012', category: 'kekerasan', subcategory: 'pelecehan_seksual', description: 'Pelecehan di KRL arah Bogor pada jam sibuk, korban wanita dewasa.', location: { type: 'Point', coordinates: [106.8459, -6.2015] }, address: 'Stasiun Manggarai, Tebet, Jakarta Selatan', createdAt: daysAgo(1) },
  { id: 'r013', category: 'kekerasan', subcategory: 'pelecehan_seksual', description: 'Pelecehan verbal di trotoar Blok M, pelaku tidak dikenal.', location: { type: 'Point', coordinates: [106.7983, -6.2443] }, address: 'Blok M, Kebayoran Baru, Jakarta Selatan', createdAt: daysAgo(3) },
  { id: 'r014', category: 'kekerasan', subcategory: 'pelecehan_seksual', description: 'Kasus pelecehan di angkot M08 kawasan Cikini.', location: { type: 'Point', coordinates: [106.8416, -6.1897] }, address: 'Cikini, Menteng, Jakarta Pusat', createdAt: daysAgo(6) },

  // ── pencurian / jambret ────────────────────────────────────────────
  { id: 'r015', category: 'pencurian', subcategory: 'jambret', description: 'Tas dijambret saat jalan kaki di Jl. Kemang Raya, pelaku naik motor.', location: { type: 'Point', coordinates: [106.8148, -6.2605] }, address: 'Jl. Kemang Raya, Mampang Prapatan, Jakarta Selatan', createdAt: hoursAgo(1) },
  { id: 'r016', category: 'pencurian', subcategory: 'jambret', description: 'HP dijambret dari tangan korban di lampu merah Senen.', location: { type: 'Point', coordinates: [106.8442, -6.1762] }, address: 'Senen, Jakarta Pusat', createdAt: hoursAgo(6) },
  { id: 'r017', category: 'pencurian', subcategory: 'jambret', description: 'Jambret kalung emas di pasar Mangga Dua, pelaku melarikan diri ke arah utara.', location: { type: 'Point', coordinates: [106.8337, -6.1379] }, address: 'Mangga Dua, Sawah Besar, Jakarta Pusat', createdAt: daysAgo(1) },
  { id: 'r018', category: 'pencurian', subcategory: 'jambret', description: 'Penjambretan laptop di CFD Sudirman pagi hari.', location: { type: 'Point', coordinates: [106.8210, -6.2060] }, address: 'Jl. Jend. Sudirman, Tanah Abang, Jakarta Pusat', createdAt: daysAgo(2) },
  { id: 'r019', category: 'pencurian', subcategory: 'jambret', description: 'Jambret tas ransel di Jl. Fatmawati sore hari.', location: { type: 'Point', coordinates: [106.7940, -6.2890] }, address: 'Jl. RS Fatmawati, Cilandak, Jakarta Selatan', createdAt: daysAgo(3) },
  { id: 'r020', category: 'pencurian', subcategory: 'jambret', description: 'Penjambretan HP di trotoar depan Sarinah.', location: { type: 'Point', coordinates: [106.8237, -6.1879] }, address: 'Jl. MH Thamrin, Menteng, Jakarta Pusat', createdAt: daysAgo(4) },

  // ── pencurian / copet ──────────────────────────────────────────────
  { id: 'r021', category: 'pencurian', subcategory: 'copet', description: 'Dompet dicopet di dalam bus TransJakarta rute Blok M – Kota.', location: { type: 'Point', coordinates: [106.8100, -6.1700] }, address: 'Kebayoran Baru, Jakarta Selatan', createdAt: hoursAgo(3) },
  { id: 'r022', category: 'pencurian', subcategory: 'copet', description: 'Copet beroperasi di pasar Tanah Abang lantai 3, korban kehilangan HP.', location: { type: 'Point', coordinates: [106.8132, -6.1845] }, address: 'Tanah Abang, Jakarta Pusat', createdAt: hoursAgo(10) },
  { id: 'r023', category: 'pencurian', subcategory: 'copet', description: 'HP dicopet di antrian KRL Stasiun Manggarai.', location: { type: 'Point', coordinates: [106.8504, -6.2100] }, address: 'Stasiun Manggarai, Tebet, Jakarta Selatan', createdAt: daysAgo(1) },
  { id: 'r024', category: 'pencurian', subcategory: 'copet', description: 'Copet mengambil dompet di kerumunan pasar malam Kelapa Gading.', location: { type: 'Point', coordinates: [106.9050, -6.1580] }, address: 'Kelapa Gading, Jakarta Utara', createdAt: daysAgo(2) },
  { id: 'r025', category: 'pencurian', subcategory: 'copet', description: 'Pencopetan di halte TransJakarta Senen.', location: { type: 'Point', coordinates: [106.8450, -6.1730] }, address: 'Senen, Jakarta Pusat', createdAt: daysAgo(3) },
  { id: 'r026', category: 'pencurian', subcategory: 'copet', description: 'Copet beraksi saat konser di Senayan, beberapa korban kehilangan HP.', location: { type: 'Point', coordinates: [106.8020, -6.2190] }, address: 'Gelora Bung Karno, Tanah Abang, Jakarta Pusat', createdAt: daysAgo(5) },

  // ── pencurian / maling kendaraan ───────────────────────────────────
  { id: 'r027', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Motor Vario hilang di parkiran Indomaret Jl. Pramuka dini hari.', location: { type: 'Point', coordinates: [106.8570, -6.1880] }, address: 'Jl. Pramuka, Matraman, Jakarta Timur', createdAt: hoursAgo(4) },
  { id: 'r028', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian motor di parkiran kos-kosan Kebayoran Baru malam hari.', location: { type: 'Point', coordinates: [106.7890, -6.2410] }, address: 'Kebayoran Baru, Jakarta Selatan', createdAt: daysAgo(1) },
  { id: 'r029', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Motor NMAX dicuri di minimarket kawasan Cempaka Putih.', location: { type: 'Point', coordinates: [106.8710, -6.1730] }, address: 'Cempaka Putih, Jakarta Pusat', createdAt: daysAgo(2) },
  { id: 'r030', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Mobil pecah kaca di parkiran restoran Kelapa Gading, laptop hilang.', location: { type: 'Point', coordinates: [106.9090, -6.1560] }, address: 'Kelapa Gading, Jakarta Utara', createdAt: daysAgo(3) },
  { id: 'r031', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian sepeda motor di depan masjid Tebet saat shalat.', location: { type: 'Point', coordinates: [106.8560, -6.2270] }, address: 'Tebet, Jakarta Selatan', createdAt: daysAgo(5) },

  // ── pencurian / maling barang ──────────────────────────────────────
  { id: 'r032', category: 'pencurian', subcategory: 'maling_barang', description: 'Laptop dicuri dari meja kafe di area Menteng saat pemilik ke toilet.', location: { type: 'Point', coordinates: [106.8390, -6.1950] }, address: 'Menteng, Jakarta Pusat', createdAt: hoursAgo(7) },
  { id: 'r033', category: 'pencurian', subcategory: 'maling_barang', description: 'Maling masuk rumah saat penghuni tidur di perumahan Pondok Indah.', location: { type: 'Point', coordinates: [106.7830, -6.2750] }, address: 'Pondok Indah, Kebayoran Lama, Jakarta Selatan', createdAt: daysAgo(1) },
  { id: 'r034', category: 'pencurian', subcategory: 'maling_barang', description: 'Pencurian AC outdoor di ruko Pluit, terekam CCTV.', location: { type: 'Point', coordinates: [106.7920, -6.1230] }, address: 'Pluit, Penjaringan, Jakarta Utara', createdAt: daysAgo(2) },
  { id: 'r035', category: 'pencurian', subcategory: 'maling_barang', description: 'Barang belanjaan dicuri di area parkir supermarket Cilandak.', location: { type: 'Point', coordinates: [106.8000, -6.2860] }, address: 'Cilandak, Jakarta Selatan', createdAt: daysAgo(4) },
  { id: 'r036', category: 'pencurian', subcategory: 'maling_barang', description: 'Kabel listrik PLN dicuri sepanjang 100 meter di Cakung.', location: { type: 'Point', coordinates: [106.9300, -6.1860] }, address: 'Cakung, Jakarta Timur', createdAt: daysAgo(6) },

  // ── penipuan ───────────────────────────────────────────────────────
  { id: 'r037', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan jual beli HP bekas di pinggir jalan Glodok, barang palsu.', location: { type: 'Point', coordinates: [106.8150, -6.1490] }, address: 'Glodok, Taman Sari, Jakarta Barat', createdAt: hoursAgo(3) },
  { id: 'r038', category: 'penipuan', subcategory: 'penipuan', description: 'Money changer ilegal di Mangga Dua menipu turis dengan kurs palsu.', location: { type: 'Point', coordinates: [106.8350, -6.1360] }, address: 'Mangga Dua, Sawah Besar, Jakarta Pusat', createdAt: hoursAgo(14) },
  { id: 'r039', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan sewa apartemen fiktif di Kuningan melalui media sosial.', location: { type: 'Point', coordinates: [106.8310, -6.2300] }, address: 'Kuningan, Setiabudi, Jakarta Selatan', createdAt: daysAgo(1) },
  { id: 'r040', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan berkedok arisan online, korban rugi Rp15 juta di Kemang.', location: { type: 'Point', coordinates: [106.8170, -6.2620] }, address: 'Kemang, Mampang Prapatan, Jakarta Selatan', createdAt: daysAgo(2) },
  { id: 'r041', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan tiket konser palsu dijual di area Senayan.', location: { type: 'Point', coordinates: [106.8010, -6.2200] }, address: 'Gelora Bung Karno, Tanah Abang, Jakarta Pusat', createdAt: daysAgo(3) },
  { id: 'r042', category: 'penipuan', subcategory: 'penipuan', description: 'Toko online fiktif di Tanah Abang, banyak korban pembeli kain.', location: { type: 'Point', coordinates: [106.8105, -6.1870] }, address: 'Tanah Abang, Jakarta Pusat', createdAt: daysAgo(5) },
  { id: 'r043', category: 'penipuan', subcategory: 'penipuan', description: 'Investasi bodong berkedok crypto di kawasan SCBD.', location: { type: 'Point', coordinates: [106.8100, -6.2250] }, address: 'SCBD, Kebayoran Baru, Jakarta Selatan', createdAt: daysAgo(7) },

  // ── vandalisme ─────────────────────────────────────────────────────
  { id: 'r044', category: 'vandalisme', subcategory: 'vandalisme', description: 'Grafiti vandalisme di tembok JPO Semanggi, merusak fasilitas umum.', location: { type: 'Point', coordinates: [106.8185, -6.2210] }, address: 'Semanggi, Setiabudi, Jakarta Selatan', createdAt: hoursAgo(6) },
  { id: 'r045', category: 'vandalisme', subcategory: 'vandalisme', description: 'Kaca halte TransJakarta dipecahkan oleh sekelompok remaja di Cikini.', location: { type: 'Point', coordinates: [106.8430, -6.1890] }, address: 'Cikini, Menteng, Jakarta Pusat', createdAt: daysAgo(1) },
  { id: 'r046', category: 'vandalisme', subcategory: 'vandalisme', description: 'Perusakan pagar taman kota di Menteng oleh pengendara motor.', location: { type: 'Point', coordinates: [106.8370, -6.1960] }, address: 'Menteng, Jakarta Pusat', createdAt: daysAgo(2) },
  { id: 'r047', category: 'vandalisme', subcategory: 'vandalisme', description: 'Vandalisme coretan cat di dinding Stasiun Gondangdia.', location: { type: 'Point', coordinates: [106.8340, -6.1870] }, address: 'Stasiun Gondangdia, Menteng, Jakarta Pusat', createdAt: daysAgo(3) },
  { id: 'r048', category: 'vandalisme', subcategory: 'vandalisme', description: 'Perusakan CCTV di Jl. MH Thamrin oleh orang tak dikenal.', location: { type: 'Point', coordinates: [106.8225, -6.1940] }, address: 'Jl. MH Thamrin, Menteng, Jakarta Pusat', createdAt: daysAgo(4) },
  { id: 'r049', category: 'vandalisme', subcategory: 'vandalisme', description: 'Lampu penerangan jalan dirusak di Jl. Rasuna Said.', location: { type: 'Point', coordinates: [106.8400, -6.2220] }, address: 'Jl. HR Rasuna Said, Setiabudi, Jakarta Selatan', createdAt: daysAgo(6) },

  // ── tawuran ────────────────────────────────────────────────────────
  { id: 'r050', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran antar warga dua kampung di Johar Baru, polisi turun tangan.', location: { type: 'Point', coordinates: [106.8570, -6.1810] }, address: 'Johar Baru, Jakarta Pusat', createdAt: hoursAgo(4) },
  { id: 'r051', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran pelajar SMA di jembatan penyeberangan Matraman sore hari.', location: { type: 'Point', coordinates: [106.8580, -6.1980] }, address: 'Matraman, Jakarta Timur', createdAt: daysAgo(1) },
  { id: 'r052', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran antar kampung di Manggarai, satu korban luka tusuk.', location: { type: 'Point', coordinates: [106.8510, -6.2130] }, address: 'Manggarai, Tebet, Jakarta Selatan', createdAt: daysAgo(3) },
  { id: 'r053', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran remaja di Kampung Melayu menggunakan batu dan botol.', location: { type: 'Point', coordinates: [106.8660, -6.2250] }, address: 'Kampung Melayu, Jatinegara, Jakarta Timur', createdAt: daysAgo(5) },

  // ── Additional reports for density ─────────────────────────────────
  { id: 'r054', category: 'pencurian', subcategory: 'copet', description: 'Copet HP di bus kota rute Kampung Melayu–Tanah Abang.', location: { type: 'Point', coordinates: [106.8260, -6.1800] }, address: 'Jatinegara, Jakarta Timur', createdAt: daysAgo(1) },
  { id: 'r055', category: 'pencurian', subcategory: 'jambret', description: 'Penjambretan saat jogging pagi di Senayan.', location: { type: 'Point', coordinates: [106.7990, -6.2180] }, address: 'GBK Senayan, Jakarta Pusat', createdAt: daysAgo(2) },
  { id: 'r056', category: 'kekerasan', subcategory: 'begal', description: 'Begal sepeda motor di Jl. Otista Jatinegara pukul 23:00.', location: { type: 'Point', coordinates: [106.8700, -6.2160] }, address: 'Jl. Otista, Jatinegara, Jakarta Timur', createdAt: daysAgo(1) },
  { id: 'r057', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Pengeroyokan terhadap pedagang kaki lima di Pasar Senen.', location: { type: 'Point', coordinates: [106.8460, -6.1760] }, address: 'Senen, Jakarta Pusat', createdAt: daysAgo(4) },
  { id: 'r058', category: 'pencurian', subcategory: 'maling_barang', description: 'Pencurian paket dari depan rumah di kompleks Cipinang.', location: { type: 'Point', coordinates: [106.8830, -6.2150] }, address: 'Cipinang, Pulo Gadung, Jakarta Timur', createdAt: daysAgo(2) },
  { id: 'r059', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan joki CPNS di area Monas, korban transfer Rp5 juta.', location: { type: 'Point', coordinates: [106.8271, -6.1760] }, address: 'Gambir, Jakarta Pusat', createdAt: daysAgo(3) },
  { id: 'r060', category: 'vandalisme', subcategory: 'vandalisme', description: 'Perusakan pot bunga di median Jl. Sudirman oleh pengendara mabuk.', location: { type: 'Point', coordinates: [106.8215, -6.2100] }, address: 'Jl. Jend. Sudirman, Kebayoran Baru, Jakarta Selatan', createdAt: daysAgo(1) },
  { id: 'r061', category: 'pencurian', subcategory: 'copet', description: 'Copet dompet di KRL commuter line arah Bekasi jam pulang kerja.', location: { type: 'Point', coordinates: [106.8920, -6.2000] }, address: 'Stasiun Jatinegara, Jakarta Timur', createdAt: hoursAgo(9) },
  { id: 'r062', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan di gang gelap belakang Roxy Mas, pelaku membawa sajam.', location: { type: 'Point', coordinates: [106.8230, -6.1640] }, address: 'Cideng, Gambir, Jakarta Pusat', createdAt: daysAgo(2) },
  { id: 'r063', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Motor PCX hilang dari halaman rumah di Duren Sawit pagi hari.', location: { type: 'Point', coordinates: [106.9110, -6.2280] }, address: 'Duren Sawit, Jakarta Timur', createdAt: daysAgo(3) },
  { id: 'r064', category: 'kekerasan', subcategory: 'begal', description: 'Begal di Jl. Casablanca menjelang subuh, korban pengemudi ojol.', location: { type: 'Point', coordinates: [106.8410, -6.2290] }, address: 'Jl. Casablanca, Tebet, Jakarta Selatan', createdAt: hoursAgo(16) },
  { id: 'r065', category: 'pencurian', subcategory: 'jambret', description: 'Jambret anting emas di Pasar Baru, korban wanita paruh baya.', location: { type: 'Point', coordinates: [106.8390, -6.1650] }, address: 'Pasar Baru, Sawah Besar, Jakarta Pusat', createdAt: daysAgo(4) },

  // ── MOCK DATA LUAR JAKARTA (SKALABILITAS REGIONAL) ──────────────────
  // Kluster: Bali & Lombok (NTB)
  { id: 'r_bali_01', category: 'pencurian', subcategory: 'jambret', description: 'Penjambretan tas turis asing di trotoar Seminyak, pelaku menggunakan motor sport.', location: { type: 'Point', coordinates: [115.1580, -8.6900] }, address: 'Trotoar Seminyak, Kuta, Badung, Bali', createdAt: hoursAgo(4) },
  { id: 'r_bali_02', category: 'pencurian', subcategory: 'copet', description: 'Pencopetan handphone di area ramai Kuta Beach Walk.', location: { type: 'Point', coordinates: [115.1680, -8.7200] }, address: 'Kuta, Badung, Bali', createdAt: daysAgo(1) },
  { id: 'r_lombok_01', category: 'kekerasan', subcategory: 'begal', description: 'Percobaan begal motor di jalur sepi Senggigi malam hari, pelaku kabur ke arah perbukitan.', location: { type: 'Point', coordinates: [116.0400, -8.3900] }, address: 'Jl. Raya Senggigi, Batu Layar, Lombok Barat, NTB', createdAt: daysAgo(2) },
  
  // Kluster: DIY & Jawa Tengah
  { id: 'r_diy_01', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Aksi klithih remaja bermotor di jalan lingkar Sleman dini hari, korban mengalami luka gores.', location: { type: 'Point', coordinates: [110.3700, -7.7500] }, address: 'Ringroad Utara, Sleman, DI Yogyakarta', createdAt: hoursAgo(10) },
  { id: 'r_diy_02', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Motor matic hilang di parkiran kos kawasan Seturan.', location: { type: 'Point', coordinates: [110.4090, -7.7700] }, address: 'Seturan, Depok, Sleman, DI Yogyakarta', createdAt: daysAgo(1) },
  { id: 'r_jateng_01', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran pelajar SMK di jalan raya Semarang-Solo, beberapa senjata tajam diamankan warga.', location: { type: 'Point', coordinates: [110.4200, -7.0200] }, address: 'Jl. Perintis Kemerdekaan, Banyumanik, Semarang, Jawa Tengah', createdAt: daysAgo(3) },

  // Kluster: Jawa Timur
  { id: 'r_jatim_01', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Maling motor terekam CCTV di parkiran ruko Dharmahusada Surabaya.', location: { type: 'Point', coordinates: [112.7750, -7.2680] }, address: 'Ruko Dharmahusada, Gubeng, Surabaya, Jawa Timur', createdAt: hoursAgo(15) },
  { id: 'r_jatim_02', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan jual beli tiket wisata fiktif secara online di kawasan Malang.', location: { type: 'Point', coordinates: [112.6300, -7.9800] }, address: 'Klojen, Kota Malang, Jawa Timur', createdAt: daysAgo(2) }
]

// Singleton Shared State (outside hook definition)
const reports = ref([])
const loading = ref(false)
const currentRegion = ref('jabodetabekjur') // Default regional: JABODETABEKJUR (Jakarta)

const activeFilters = ref({
  kekerasan: true,
  pencurian: true,
  penipuan: true,
  vandalisme: true,
  tawuran: true,
})

export function useReports() {
  /** Check if any filters are disabled to determine if we are actively filtering */
  const isFiltering = computed(() => {
    return Object.values(activeFilters.value).some((v) => !v)
  })

  /** Filter reports dynamically based on checked categories AND current regional boundaries */
  const filteredReports = computed(() => {
    return reports.value.filter((r) => {
      // 1. Saring berdasarkan filter kategori aktif
      if (!activeFilters.value[r.category]) return false
      
      // 2. Saring berdasarkan kluster regional spasial dinamis
      const coords = r.location?.coordinates
      if (!coords || coords.length < 2) return false
      const [lng, lat] = coords
      
      const region = REGIONS[currentRegion.value]
      return region ? region.contains(lat, lng) : true
    })
  })

  /** Sorted by newest first, limit to 20 */
  const recentReports = computed(() =>
    [...filteredReports.value]
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, 20),
  )

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  const IS_PROD = import.meta.env.PROD

  /**
   * Load data from database API or fallback to mock data.
   */
  async function fetchReports() {
    loading.value = true
    try {
      if (API_BASE) {
        // Ambil data langsung dari Firestore API
        const response = await fetch(`${API_BASE}/reports?t=${Date.now()}`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const data = await response.json()
        reports.value = data.map((r) => ({
          id: r._id || r.id,
          category: r.category,
          subcategory: r.subcategory,
          description: r.description,
          location: r.location,
          address: r.address || '',
          createdAt: new Date(r.createdAt),
        }))
      } else {
        // Jika di produksi tetapi API_BASE kosong, ini adalah kesalahan konfigurasi kritis
        if (IS_PROD) {
          throw new Error('VITE_API_BASE_URL tidak terdefinisi di lingkungan produksi.')
        }
        // Fallback ke data simulasi offline di development
        await new Promise((resolve) => setTimeout(resolve, 300))
        reports.value = MOCK_REPORTS.map((r) => ({ ...r }))
      }
    } catch (error) {
      console.error('Gagal mengambil laporan dari API:', error)
      if (IS_PROD) {
        // Di produksi, jangan fallback ke mock data, biarkan kosong & lemparkan error
        reports.value = []
        throw error
      } else {
        // Di development, izinkan fallback ke mock data agar mempermudah coding
        console.warn('Fallback ke mock data (Development Mode)')
        reports.value = MOCK_REPORTS.map((r) => ({ ...r }))
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Submit a new report (POST to API if configured, otherwise local simulated save).
   */
  async function submitReport(data) {
    if (API_BASE) {
      try {
        const payload = {
          category: data.category,
          subcategory: data.subcategory,
          description: data.description || '',
          latitude: data.location.coordinates[1],  // Bujur adalah koordinat 1 [lng, lat]
          longitude: data.location.coordinates[0], // Lintang adalah koordinat 0 [lng, lat]
          turnstileToken: data.turnstileToken,     // Token Turnstile
        }
        const response = await fetch(`${API_BASE}/reports`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })
        if (!response.ok) {
          const errData = await response.json().catch(() => ({}))
          throw new Error(errData.error || `HTTP error! status: ${response.status}`)
        }
        const r = await response.json()
        const newReport = {
          id: r._id || r.id,
          category: r.category,
          subcategory: r.subcategory,
          description: r.description,
          location: r.location,
          address: r.address || '',
          createdAt: new Date(r.createdAt),
        }
        reports.value = [newReport, ...reports.value]
        return newReport
      } catch (error) {
        console.error('Gagal mengirimkan laporan baru ke API:', error)
        throw error // Lempar kembali agar diletakkan di form alert validasi
      }
    } else {
      // Penyimpanan simulasi lokal offline
      const report = {
        id: `r${Date.now()}`,
        category: data.category,
        subcategory: data.subcategory,
        description: data.description || '',
        location: data.location,
        address: data.address || 'Menteng, Jakarta Pusat',
        createdAt: new Date(),
      }
      reports.value = [report, ...reports.value]
      return report
    }
  }


  /**
   * Toggle a category filter on/off
   */
  function toggleFilter(category) {
    if (activeFilters.value[category] !== undefined) {
      activeFilters.value[category] = !activeFilters.value[category]
    }
  }

  /** Set all filters to either true or false */
  function setAllFilters(val) {
    for (const cat of Object.keys(activeFilters.value)) {
      activeFilters.value[cat] = val
    }
  }

  return {
    reports,
    loading,
    currentRegion,
    activeFilters,
    filteredReports,
    recentReports,
    isFiltering,
    fetchReports,
    submitReport,
    toggleFilter,
    setAllFilters,
  }
}
