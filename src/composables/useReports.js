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

// 220+ realistic mock reports across Indonesia with human-readable addresses
const MOCK_REPORTS = [
  // ── JABODETABEKJUR (r001 - r065) ───────────────────────────────────
  { id: 'r001', category: 'kekerasan', subcategory: 'begal', description: 'Begal motor di jalan sepi dekat Sudirman, pelaku dua orang berboncengan.', location: { type: 'Point', coordinates: [106.8230, -6.2088] }, address: 'Jl. Jend. Sudirman, Setiabudi, Jakarta Selatan', createdAt: hoursAgo(2) },
  { id: 'r002', category: 'kekerasan', subcategory: 'begal', description: 'Korban ditodong senjata tajam dan dirampas HP serta dompet saat melintas Jl. Gatot Subroto malam hari.', location: { type: 'Point', coordinates: [106.8271, -6.2325] }, address: 'Jl. Gatot Subroto, Mampang Prapatan, Jakarta Selatan', createdAt: hoursAgo(8) },
  { id: 'r003', category: 'kekerasan', subcategory: 'begal', description: 'Begal di kolong flyover Cawang, korban luka ringan.', location: { type: 'Point', coordinates: [106.8700, -6.2540] }, address: 'Flyover Cawang, Kramat Jati, Jakarta Timur', createdAt: daysAgo(1) },
  { id: 'r004', category: 'kekerasan', subcategory: 'begal', description: 'Dua pemuda di motor menyerang pengemudi ojol di kawasan Kalibata.', location: { type: 'Point', coordinates: [106.8560, -6.2580] }, address: 'Kalibata, Pancoran, Jakarta Selatan', createdAt: daysAgo(2) },
  { id: 'r005', category: 'kekerasan', subcategory: 'begal', description: 'Begal dengan celurit di jalur Rawamangun dini hari.', location: { type: 'Point', coordinates: [106.8860, -6.1930] }, address: 'Rawamangun, Pulo Gadung, Jakarta Timur', createdAt: daysAgo(4) },
  { id: 'r006', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan di halte bus TransJakarta Harmoni, pelaku bawa pisau.', location: { type: 'Point', coordinates: [106.8194, -6.1685] }, address: 'Harmoni, Gambir, Jakarta Pusat', createdAt: hoursAgo(5) },
  { id: 'r007', category: 'kekerasan', subcategory: 'penodongan', description: 'Ditodong saat keluar ATM di Jl. Thamrin malam hari.', location: { type: 'Point', coordinates: [106.8229, -6.1935] }, address: 'Jl. MH Thamrin, Menteng, Jakarta Pusat', createdAt: daysAgo(1) },
  { id: 'r008', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan di parkiran mall Menteng, pelaku kabur menggunakan motor.', location: { type: 'Point', coordinates: [106.8370, -6.1940] }, address: 'Menteng, Jakarta Pusat', createdAt: daysAgo(3) },
  { id: 'r009', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Penganiayaan oleh pengendara mobil terhadap ojol di Kuningan akibat kemacetan.', location: { type: 'Point', coordinates: [106.8316, -6.2280] }, address: 'Kuningan, Setiabudi, Jakarta Selatan', createdAt: hoursAgo(12) },
  { id: 'r010', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Warga dikeroyok sekelompok orang di gang sempit Manggarai.', location: { type: 'Point', coordinates: [106.8494, -6.2130] }, address: 'Manggarai, Tebet, Jakarta Selatan', createdAt: daysAgo(2) },
  { id: 'r011', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Pengemudi taksi dipukul penumpang di kawasan Tanah Abang.', location: { type: 'Point', coordinates: [106.8118, -6.1862] }, address: 'Tanah Abang, Jakarta Pusat', createdAt: daysAgo(5) },
  { id: 'r012', category: 'kekerasan', subcategory: 'pelecehan_seksual', description: 'Pelecehan di KRL arah Bogor pada jam sibuk, korban wanita dewasa.', location: { type: 'Point', coordinates: [106.8459, -6.2015] }, address: 'Stasiun Manggarai, Tebet, Jakarta Selatan', createdAt: daysAgo(1) },
  { id: 'r013', category: 'kekerasan', subcategory: 'pelecehan_seksual', description: 'Pelecehan verbal di trotoar Blok M, pelaku tidak dikenal.', location: { type: 'Point', coordinates: [106.7983, -6.2443] }, address: 'Blok M, Kebayoran Baru, Jakarta Selatan', createdAt: daysAgo(3) },
  { id: 'r014', category: 'kekerasan', subcategory: 'pelecehan_seksual', description: 'Kasus pelecehan di angkot M08 kawasan Cikini.', location: { type: 'Point', coordinates: [106.8416, -6.1897] }, address: 'Cikini, Menteng, Jakarta Pusat', createdAt: daysAgo(6) },
  { id: 'r015', category: 'pencurian', subcategory: 'jambret', description: 'Tas dijambret saat jalan kaki di Jl. Kemang Raya, pelaku naik motor.', location: { type: 'Point', coordinates: [106.8148, -6.2605] }, address: 'Jl. Kemang Raya, Mampang Prapatan, Jakarta Selatan', createdAt: hoursAgo(1) },
  { id: 'r016', category: 'pencurian', subcategory: 'jambret', description: 'HP dijambret dari tangan korban di lampu merah Senen.', location: { type: 'Point', coordinates: [106.8442, -6.1762] }, address: 'Senen, Jakarta Pusat', createdAt: hoursAgo(6) },
  { id: 'r017', category: 'pencurian', subcategory: 'jambret', description: 'Jambret kalung emas di pasar Mangga Dua, pelaku melarikan diri ke arah utara.', location: { type: 'Point', coordinates: [106.8337, -6.1379] }, address: 'Mangga Dua, Sawah Besar, Jakarta Pusat', createdAt: daysAgo(1) },
  { id: 'r018', category: 'pencurian', subcategory: 'jambret', description: 'Penjambretan laptop di CFD Sudirman pagi hari.', location: { type: 'Point', coordinates: [106.8210, -6.2060] }, address: 'Jl. Jend. Sudirman, Tanah Abang, Jakarta Pusat', createdAt: daysAgo(2) },
  { id: 'r019', category: 'pencurian', subcategory: 'jambret', description: 'Jambret tas ransel di Jl. Fatmawati sore hari.', location: { type: 'Point', coordinates: [106.7940, -6.2890] }, address: 'Jl. RS Fatmawati, Cilandak, Jakarta Selatan', createdAt: daysAgo(3) },
  { id: 'r020', category: 'pencurian', subcategory: 'jambret', description: 'Penjambretan HP di trotoar depan Sarinah.', location: { type: 'Point', coordinates: [106.8237, -6.1879] }, address: 'Jl. MH Thamrin, Menteng, Jakarta Pusat', createdAt: daysAgo(4) },
  { id: 'r021', category: 'pencurian', subcategory: 'copet', description: 'Dompet dicopet di dalam bus TransJakarta rute Blok M – Kota.', location: { type: 'Point', coordinates: [106.8100, -6.1700] }, address: 'Kebayoran Baru, Jakarta Selatan', createdAt: hoursAgo(3) },
  { id: 'r022', category: 'pencurian', subcategory: 'copet', description: 'Copet beroperasi di pasar Tanah Abang lantai 3, korban kehilangan HP.', location: { type: 'Point', coordinates: [106.8132, -6.1845] }, address: 'Tanah Abang, Jakarta Pusat', createdAt: hoursAgo(10) },
  { id: 'r023', category: 'pencurian', subcategory: 'copet', description: 'HP dicopet di antrian KRL Stasiun Manggarai.', location: { type: 'Point', coordinates: [106.8504, -6.2100] }, address: 'Stasiun Manggarai, Tebet, Jakarta Selatan', createdAt: daysAgo(1) },
  { id: 'r024', category: 'pencurian', subcategory: 'copet', description: 'Copet mengambil dompet di kerumunan pasar malam Kelapa Gading.', location: { type: 'Point', coordinates: [106.9050, -6.1580] }, address: 'Kelapa Gading, Jakarta Utara', createdAt: daysAgo(2) },
  { id: 'r025', category: 'pencurian', subcategory: 'copet', description: 'Pencopetan di halte TransJakarta Senen.', location: { type: 'Point', coordinates: [106.8450, -6.1730] }, address: 'Senen, Jakarta Pusat', createdAt: daysAgo(3) },
  { id: 'r026', category: 'pencurian', subcategory: 'copet', description: 'Copet beraksi saat konser di Senayan, beberapa korban kehilangan HP.', location: { type: 'Point', coordinates: [106.8020, -6.2190] }, address: 'Gelora Bung Karno, Tanah Abang, Jakarta Pusat', createdAt: daysAgo(5) },
  { id: 'r027', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Motor Vario hilang di parkiran Indomaret Jl. Pramuka dini hari.', location: { type: 'Point', coordinates: [106.8570, -6.1880] }, address: 'Jl. Pramuka, Matraman, Jakarta Timur', createdAt: hoursAgo(4) },
  { id: 'r028', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian motor di parkiran kos-kosan Kebayoran Baru malam hari.', location: { type: 'Point', coordinates: [106.7890, -6.2410] }, address: 'Kebayoran Baru, Jakarta Selatan', createdAt: daysAgo(1) },
  { id: 'r029', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Motor NMAX dicuri di minimarket kawasan Cempaka Putih.', location: { type: 'Point', coordinates: [106.8710, -6.1730] }, address: 'Cempaka Putih, Jakarta Pusat', createdAt: daysAgo(2) },
  { id: 'r030', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Mobil pecah kaca di parkiran restoran Kelapa Gading, laptop hilang.', location: { type: 'Point', coordinates: [106.9090, -6.1560] }, address: 'Kelapa Gading, Jakarta Utara', createdAt: daysAgo(3) },
  { id: 'r031', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian sepeda motor di depan masjid Tebet saat shalat.', location: { type: 'Point', coordinates: [106.8560, -6.2270] }, address: 'Tebet, Jakarta Selatan', createdAt: daysAgo(5) },
  { id: 'r032', category: 'pencurian', subcategory: 'maling_barang', description: 'Laptop dicuri dari meja kafe di area Menteng saat pemilik ke toilet.', location: { type: 'Point', coordinates: [106.8390, -6.1950] }, address: 'Menteng, Jakarta Pusat', createdAt: hoursAgo(7) },
  { id: 'r033', category: 'pencurian', subcategory: 'maling_barang', description: 'Maling masuk rumah saat penghuni tidur di perumahan Pondok Indah.', location: { type: 'Point', coordinates: [106.7830, -6.2750] }, address: 'Pondok Indah, Kebayoran Lama, Jakarta Selatan', createdAt: daysAgo(1) },
  { id: 'r034', category: 'pencurian', subcategory: 'maling_barang', description: 'Pencurian AC outdoor di ruko Pluit, terekam CCTV.', location: { type: 'Point', coordinates: [106.7920, -6.1230] }, address: 'Pluit, Penjaringan, Jakarta Utara', createdAt: daysAgo(2) },
  { id: 'r035', category: 'pencurian', subcategory: 'maling_barang', description: 'Barang belanjaan dicuri di area parkir supermarket Cilandak.', location: { type: 'Point', coordinates: [106.8000, -6.2860] }, address: 'Cilandak, Jakarta Selatan', createdAt: daysAgo(4) },
  { id: 'r036', category: 'pencurian', subcategory: 'maling_barang', description: 'Kabel listrik PLN dicuri sepanjang 100 meter di Cakung.', location: { type: 'Point', coordinates: [106.9300, -6.1860] }, address: 'Cakung, Jakarta Timur', createdAt: daysAgo(6) },
  { id: 'r037', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan jual beli HP bekas di pinggir jalan Glodok, barang palsu.', location: { type: 'Point', coordinates: [106.8150, -6.1490] }, address: 'Glodok, Taman Sari, Jakarta Barat', createdAt: hoursAgo(3) },
  { id: 'r038', category: 'penipuan', subcategory: 'penipuan', description: 'Money changer ilegal di Mangga Dua menipu turis dengan kurs palsu.', location: { type: 'Point', coordinates: [106.8350, -6.1360] }, address: 'Mangga Dua, Sawah Besar, Jakarta Pusat', createdAt: hoursAgo(14) },
  { id: 'r039', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan sewa apartemen fiktif di Kuningan melalui media sosial.', location: { type: 'Point', coordinates: [106.8310, -6.2300] }, address: 'Kuningan, Setiabudi, Jakarta Selatan', createdAt: daysAgo(1) },
  { id: 'r040', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan berkedok arisan online, korban rugi Rp15 juta di Kemang.', location: { type: 'Point', coordinates: [106.8170, -6.2620] }, address: 'Kemang, Mampang Prapatan, Jakarta Selatan', createdAt: daysAgo(2) },
  { id: 'r041', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan tiket konser palsu dijual di area Senayan.', location: { type: 'Point', coordinates: [106.8010, -6.2200] }, address: 'Gelora Bung Karno, Tanah Abang, Jakarta Pusat', createdAt: daysAgo(3) },
  { id: 'r042', category: 'penipuan', subcategory: 'penipuan', description: 'Toko online fiktif di Tanah Abang, banyak korban pembeli kain.', location: { type: 'Point', coordinates: [106.8105, -6.1870] }, address: 'Tanah Abang, Jakarta Pusat', createdAt: daysAgo(5) },
  { id: 'r043', category: 'penipuan', subcategory: 'penipuan', description: 'Investasi bodong berkedok crypto di kawasan SCBD.', location: { type: 'Point', coordinates: [106.8100, -6.2250] }, address: 'SCBD, Kebayoran Baru, Jakarta Selatan', createdAt: daysAgo(7) },
  { id: 'r044', category: 'vandalisme', subcategory: 'vandalisme', description: 'Grafiti vandalisme di tembok JPO Semanggi, merusak fasilitas umum.', location: { type: 'Point', coordinates: [106.8185, -6.2210] }, address: 'Semanggi, Setiabudi, Jakarta Selatan', createdAt: hoursAgo(6) },
  { id: 'r045', category: 'vandalisme', subcategory: 'vandalisme', description: 'Kaca halte TransJakarta dipecahkan oleh sekelompok remaja di Cikini.', location: { type: 'Point', coordinates: [106.8430, -6.1890] }, address: 'Cikini, Menteng, Jakarta Pusat', createdAt: daysAgo(1) },
  { id: 'r046', category: 'vandalisme', subcategory: 'vandalisme', description: 'Perusakan pagar taman kota di Menteng oleh pengendara motor.', location: { type: 'Point', coordinates: [106.8370, -6.1960] }, address: 'Menteng, Jakarta Pusat', createdAt: daysAgo(2) },
  { id: 'r047', category: 'vandalisme', subcategory: 'vandalisme', description: 'Vandalisme coretan cat di dinding Stasiun Gondangdia.', location: { type: 'Point', coordinates: [106.8340, -6.1870] }, address: 'Stasiun Gondangdia, Menteng, Jakarta Pusat', createdAt: daysAgo(3) },
  { id: 'r048', category: 'vandalisme', subcategory: 'vandalisme', description: 'Perusakan CCTV di Jl. MH Thamrin oleh orang tak dikenal.', location: { type: 'Point', coordinates: [106.8225, -6.1940] }, address: 'Jl. MH Thamrin, Menteng, Jakarta Pusat', createdAt: daysAgo(4) },
  { id: 'r049', category: 'vandalisme', subcategory: 'vandalisme', description: 'Lampu penerangan jalan dirusak di Jl. Rasuna Said.', location: { type: 'Point', coordinates: [106.8400, -6.2220] }, address: 'Jl. HR Rasuna Said, Setiabudi, Jakarta Selatan', createdAt: daysAgo(6) },
  { id: 'r050', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran antar warga dua kampung di Johar Baru, polisi turun tangan.', location: { type: 'Point', coordinates: [106.8570, -6.1810] }, address: 'Johar Baru, Jakarta Pusat', createdAt: hoursAgo(4) },
  { id: 'r051', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran pelajar SMA di jembatan penyeberangan Matraman sore hari.', location: { type: 'Point', coordinates: [106.8580, -6.1980] }, address: 'Matraman, Jakarta Timur', createdAt: daysAgo(1) },
  { id: 'r052', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran antar kampung di Manggarai, satu korban luka tusuk.', location: { type: 'Point', coordinates: [106.8510, -6.2130] }, address: 'Manggarai, Tebet, Jakarta Selatan', createdAt: daysAgo(3) },
  { id: 'r053', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran remaja di Kampung Melayu menggunakan batu dan botol.', location: { type: 'Point', coordinates: [106.8660, -6.2250] }, address: 'Kampung Melayu, Jatinegara, Jakarta Timur', createdAt: daysAgo(5) },
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

  // ── JABAR & BANTEN (r_jabar_01 - r_jabar_12) ────────────────────────
  { id: 'r_jabar_01', category: 'kekerasan', subcategory: 'begal', description: 'Aksi begal motor jalanan sepi Lembang malam hari, pelaku membawa senjata tajam.', location: { type: 'Point', coordinates: [107.6150, -6.8200] }, address: 'Lembang, Bandung Barat, Jawa Barat', createdAt: hoursAgo(4) },
  { id: 'r_jabar_02', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian sepeda motor di kos-kosan daerah Dago Giri, terekam kamera CCTV.', location: { type: 'Point', coordinates: [107.6291, -6.8652] }, address: 'Dago, Coblong, Kota Bandung, Jawa Barat', createdAt: daysAgo(1) },
  { id: 'r_jabar_03', category: 'pencurian', subcategory: 'jambret', description: 'Jambret tas milik pejalan kaki di trotoar Kota Serang, pelaku mengendarai motor berboncengan.', location: { type: 'Point', coordinates: [106.1450, -6.1200] }, address: 'Jl. Jend. Sudirman, Serang, Banten', createdAt: daysAgo(2) },
  { id: 'r_jabar_04', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Pengeroyokan akibat perselisihan lalu lintas di jalur alternatif Nagreg.', location: { type: 'Point', coordinates: [107.8900, -7.0300] }, address: 'Nagreg, Kabupaten Bandung, Jawa Barat', createdAt: daysAgo(3) },
  { id: 'r_jabar_05', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan tiket konser fiktif bermodus COD di daerah Pasteur.', location: { type: 'Point', coordinates: [107.5850, -6.8970] }, address: 'Pasteur, Sukajadi, Kota Bandung, Jawa Barat', createdAt: daysAgo(4) },
  { id: 'r_jabar_06', category: 'vandalisme', subcategory: 'vandalisme', description: 'Coretan grafiti liar di fasilitas umum kawasan heritage Jalan Asia Afrika.', location: { type: 'Point', coordinates: [107.6100, -6.9210] }, address: 'Jl. Asia Afrika, Sumur Bandung, Kota Bandung, Jawa Barat', createdAt: daysAgo(5) },
  { id: 'r_jabar_07', category: 'pencurian', subcategory: 'copet', description: 'Pencopetan dompet di area stasiun kereta api Cirebon.', location: { type: 'Point', coordinates: [108.5550, -6.7100] }, address: 'Stasiun Cirebon, Kejaksan, Kota Cirebon, Jawa Barat', createdAt: hoursAgo(10) },
  { id: 'r_jabar_08', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran sekelompok pemuda bersenjata sarung bermuatan batu di Tasikmalaya.', location: { type: 'Point', coordinates: [108.2100, -7.3400] }, address: 'Tawang, Kota Tasikmalaya, Jawa Barat', createdAt: daysAgo(2) },
  { id: 'r_jabar_09', category: 'pencurian', subcategory: 'maling_barang', description: 'Maling tabung gas 3kg di sebuah warung kelontong kawasan Pandeglang.', location: { type: 'Point', coordinates: [105.8300, -6.3100] }, address: 'Cadasari, Pandeglang, Banten', createdAt: daysAgo(3) },
  { id: 'r_jabar_10', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan sopir truk barang di jalur pantai utara (Pantura) Subang.', location: { type: 'Point', coordinates: [107.7500, -6.2800] }, address: 'Pamanukan, Subang, Jawa Barat', createdAt: hoursAgo(18) },
  { id: 'r_jabar_11', category: 'pencurian', subcategory: 'jambret', description: 'Jambret handphone pesepeda pagi hari di kawasan BSD Tangerang Selatan.', location: { type: 'Point', coordinates: [106.6350, -6.3050] }, address: 'Cisauk, Tangerang, Banten', createdAt: daysAgo(1) },
  { id: 'r_jabar_12', category: 'vandalisme', subcategory: 'vandalisme', description: 'Perusakan rambu lalu lintas di dekat terminal Baranangsiang Bogor.', location: { type: 'Point', coordinates: [106.8090, -6.6020] }, address: 'Bogor Timur, Kota Bogor, Jawa Barat', createdAt: daysAgo(6) },

  // ── DIY & JAWA TENGAH (r_diy_01 - r_diy_12) ─────────────────────────
  { id: 'r_diy_01', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Aksi klithih remaja bermotor di jalan lingkar Sleman dini hari, korban mengalami luka gores.', location: { type: 'Point', coordinates: [110.3700, -7.7500] }, address: 'Ringroad Utara, Sleman, DI Yogyakarta', createdAt: hoursAgo(10) },
  { id: 'r_diy_02', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Motor matic hilang di parkiran kos kawasan Seturan.', location: { type: 'Point', coordinates: [110.4090, -7.7700] }, address: 'Seturan, Depok, Sleman, DI Yogyakarta', createdAt: daysAgo(1) },
  { id: 'r_diy_03', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran pelajar SMK di jalan raya Semarang-Solo, beberapa senjata tajam diamankan warga.', location: { type: 'Point', coordinates: [110.4200, -7.0200] }, address: 'Jl. Perintis Kemerdekaan, Banyumanik, Semarang, Jawa Tengah', createdAt: daysAgo(3) },
  { id: 'r_diy_04', category: 'pencurian', subcategory: 'copet', description: 'Dompet wisatawan dicopet di kawasan wisata terpadu Malioboro saat ramai sore hari.', location: { type: 'Point', coordinates: [110.3658, -7.7924] }, address: 'Jl. Malioboro, Gedongtengen, Kota Yogyakarta', createdAt: hoursAgo(2) },
  { id: 'r_diy_05', category: 'kekerasan', subcategory: 'begal', description: 'Percobaan begal motor di area persawahan daerah Bantul, pelaku menendang motor korban.', location: { type: 'Point', coordinates: [110.3300, -7.8900] }, address: 'Sanden, Bantul, DI Yogyakarta', createdAt: daysAgo(2) },
  { id: 'r_diy_06', category: 'penipuan', subcategory: 'penipuan', description: 'Modus penipuan sewa penginapan fiktif jelang liburan akhir tahun di daerah Kaliurang.', location: { type: 'Point', coordinates: [110.4250, -7.6020] }, address: 'Kaliurang, Pakem, Sleman, DI Yogyakarta', createdAt: daysAgo(4) },
  { id: 'r_diy_07', category: 'pencurian', subcategory: 'maling_barang', description: 'Pencurian helm bermerek di area parkir stasiun Tugu Yogyakarta.', location: { type: 'Point', coordinates: [110.3620, -7.7890] }, address: 'Stasiun Tugu, Gedongtengen, Kota Yogyakarta', createdAt: hoursAgo(6) },
  { id: 'r_diy_08', category: 'vandalisme', subcategory: 'vandalisme', description: 'Vandalisme berupa coretan pilox di dinding cagar budaya kawasan Kotagede.', location: { type: 'Point', coordinates: [110.4000, -7.8200] }, address: 'Kotagede, Kota Yogyakarta', createdAt: daysAgo(5) },
  { id: 'r_diy_09', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan di kawasan Simpang Lima Semarang, dompet dan handphone korban dirampas.', location: { type: 'Point', coordinates: [110.4220, -6.9900] }, address: 'Simpang Lima, Semarang Selatan, Kota Semarang, Jawa Tengah', createdAt: hoursAgo(15) },
  { id: 'r_diy_10', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian mobil L300 box di area industri terpadu Solo Baru.', location: { type: 'Point', coordinates: [110.8100, -7.6000] }, address: 'Solo Baru, Sukoharjo, Jawa Tengah', createdAt: daysAgo(3) },
  { id: 'r_diy_11', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran sekelompok remaja bersenjata gear motor di daerah Magelang Utara.', location: { type: 'Point', coordinates: [110.2250, -7.4600] }, address: 'Magelang Utara, Kota Magelang, Jawa Tengah', createdAt: daysAgo(1) },
  { id: 'r_diy_12', category: 'pencurian', subcategory: 'jambret', description: 'Jambret kalung di trotoar Simpang Lima Boyolali, pelaku menggunakan motor bebek.', location: { type: 'Point', coordinates: [110.6020, -7.5300] }, address: 'Boyolali, Jawa Tengah', createdAt: daysAgo(7) },

  // ── JAWA TIMUR (r_jatim_01 - r_jatim_12) ───────────────────────────
  { id: 'r_jatim_01', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Maling motor terekam CCTV di parkiran ruko Dharmahusada Surabaya.', location: { type: 'Point', coordinates: [112.7750, -7.2680] }, address: 'Ruko Dharmahusada, Gubeng, Surabaya, Jawa Timur', createdAt: hoursAgo(15) },
  { id: 'r_jatim_02', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan jual beli tiket wisata fiktif secara online di kawasan Malang.', location: { type: 'Point', coordinates: [112.6300, -7.9800] }, address: 'Klojen, Kota Malang, Jawa Timur', createdAt: daysAgo(2) },
  { id: 'r_jatim_03', category: 'kekerasan', subcategory: 'begal', description: 'Begal motor bersenjata clurit beraksi di kawasan Kenjeran menjelang subuh.', location: { type: 'Point', coordinates: [112.7900, -7.2200] }, address: 'Kenjeran, Kota Surabaya, Jawa Timur', createdAt: hoursAgo(5) },
  { id: 'r_jatim_04', category: 'pencurian', subcategory: 'jambret', description: 'Jambret tas pejalan kaki di trotoar depan Stasiun Gubeng Baru.', location: { type: 'Point', coordinates: [112.7530, -7.2650] }, address: 'Tambaksari, Kota Surabaya, Jawa Timur', createdAt: hoursAgo(3) },
  { id: 'r_jatim_05', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Penganiayaan di warung kopi kawasan Sidoarjo akibat bentrok geng motor.', location: { type: 'Point', coordinates: [112.7150, -7.4500] }, address: 'Candi, Kabupaten Sidoarjo, Jawa Timur', createdAt: daysAgo(1) },
  { id: 'r_jatim_06', category: 'pencurian', subcategory: 'copet', description: 'Pencopetan dompet penumpang bus antarkota di Terminal Purabaya Bungurasih.', location: { type: 'Point', coordinates: [112.7230, -7.3500] }, address: 'Terminal Purabaya, Waru, Sidoarjo, Jawa Timur', createdAt: hoursAgo(8) },
  { id: 'r_jatim_07', category: 'vandalisme', subcategory: 'vandalisme', description: 'Perusakan fasilitas umum berupa bangku taman di kawasan Ijen Malang.', location: { type: 'Point', coordinates: [112.6210, -7.9710] }, address: 'Jl. Besar Ijen, Klojen, Kota Malang, Jawa Timur', createdAt: daysAgo(3) },
  { id: 'r_jatim_08', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran sekelompok pesilat di jalur pantura Gresik, menyebabkan kemacetan parah.', location: { type: 'Point', coordinates: [112.6300, -7.1600] }, address: 'Manyar, Kabupaten Gresik, Jawa Timur', createdAt: daysAgo(2) },
  { id: 'r_jatim_09', category: 'pencurian', subcategory: 'maling_barang', description: 'Pencurian jemuran baju bermerek milik warga kos di daerah Jember.', location: { type: 'Point', coordinates: [113.7000, -8.1800] }, address: 'Sumbersari, Kabupaten Jember, Jawa Timur', createdAt: daysAgo(4) },
  { id: 'r_jatim_10', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan investasi sembako murah fiktif, merugikan puluhan ibu-ibu di Madiun.', location: { type: 'Point', coordinates: [111.5200, -7.6300] }, address: 'Kartoharjo, Kota Madiun, Jawa Timur', createdAt: daysAgo(5) },
  { id: 'r_jatim_11', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan di kawasan pelabuhan Ketapang Banyuwangi, menargetkan penumpang kapal laut.', location: { type: 'Point', coordinates: [114.3900, -8.1300] }, address: 'Kalipuro, Kabupaten Banyuwangi, Jawa Timur', createdAt: hoursAgo(20) },
  { id: 'r_jatim_12', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian truk engkel bermuatan beras di daerah Kediri malam hari.', location: { type: 'Point', coordinates: [112.0200, -7.8200] }, address: 'Mojoroto, Kota Kediri, Jawa Timur', createdAt: daysAgo(7) },

  // ── BALI & LOMBOK (r_bali_01 - r_bali_12) ───────────────────────────
  { id: 'r_bali_01', category: 'pencurian', subcategory: 'jambret', description: 'Penjambretan tas turis asing di trotoar Seminyak, pelaku menggunakan motor sport.', location: { type: 'Point', coordinates: [115.1580, -8.6900] }, address: 'Trotoar Seminyak, Kuta, Badung, Bali', createdAt: hoursAgo(4) },
  { id: 'r_bali_02', category: 'pencurian', subcategory: 'copet', description: 'Pencopetan handphone di area ramai Kuta Beach Walk.', location: { type: 'Point', coordinates: [115.1680, -8.7200] }, address: 'Kuta, Badung, Bali', createdAt: daysAgo(1) },
  { id: 'r_lombok_01', category: 'kekerasan', subcategory: 'begal', description: 'Percobaan begal motor di jalur sepi Senggigi malam hari, pelaku kabur ke arah perbukitan.', location: { type: 'Point', coordinates: [116.0400, -8.3900] }, address: 'Jl. Raya Senggigi, Batu Layar, Lombok Barat, NTB', createdAt: daysAgo(2) },
  { id: 'r_bali_04', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian sepeda motor sewaan turis asing di dekat pantai Canggu.', location: { type: 'Point', coordinates: [115.1320, -8.6500] }, address: 'Canggu, Kuta Utara, Badung, Bali', createdAt: hoursAgo(6) },
  { id: 'r_bali_05', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Perkelahian fisik antar warga negara asing di kelab malam kawasan Legian.', location: { type: 'Point', coordinates: [115.1720, -8.7100] }, address: 'Legian, Kuta, Badung, Bali', createdAt: hoursAgo(2) },
  { id: 'r_bali_06', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan transaksi sewa vila fiktif bernilai puluhan juta rupiah di kawasan Ubud.', location: { type: 'Point', coordinates: [115.2640, -8.5080] }, address: 'Ubud, Gianyar, Bali', createdAt: daysAgo(3) },
  { id: 'r_bali_07', category: 'pencurian', subcategory: 'maling_barang', description: 'Pencurian barang berharga milik tamu hotel di daerah Jimbaran, pelaku menyelinap lewat balkon.', location: { type: 'Point', coordinates: [115.1780, -8.7800] }, address: 'Jimbaran, Kuta Selatan, Badung, Bali', createdAt: daysAgo(4) },
  { id: 'r_bali_08', category: 'vandalisme', subcategory: 'vandalisme', description: 'Aksi vandalisme coretan cat di tebing suci daerah Uluwatu oleh oknum tak dikenal.', location: { type: 'Point', coordinates: [115.0900, -8.8300] }, address: 'Uluwatu, Pecatu, Badung, Bali', createdAt: daysAgo(5) },
  { id: 'r_bali_09', category: 'pencurian', subcategory: 'copet', description: 'Pencopetan di area pasar seni Sukawati Gianyar saat rombongan turis berbelanja.', location: { type: 'Point', coordinates: [115.2800, -8.5900] }, address: 'Sukawati, Gianyar, Bali', createdAt: hoursAgo(10) },
  { id: 'r_bali_10', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan di kawasan pantai Senggigi Lombok Barat, menyasar barang turis.', location: { type: 'Point', coordinates: [116.0350, -8.4000] }, address: 'Senggigi, Batu Layar, Lombok Barat, NTB', createdAt: hoursAgo(12) },
  { id: 'r_bali_11', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Motor matic milik warga lokal hilang di parkiran pantai Kuta Lombok NTB.', location: { type: 'Point', coordinates: [116.2800, -8.8900] }, address: 'Kuta, Pujut, Lombok Tengah, NTB', createdAt: daysAgo(2) },
  { id: 'r_bali_12', category: 'tawuran', subcategory: 'tawuran', description: 'Bentrok fisik antar kelompok pemuda di area parkir Mataram Mall NTB.', location: { type: 'Point', coordinates: [116.1200, -8.5900] }, address: 'Cakranegara, Kota Mataram, NTB', createdAt: daysAgo(1) },

  // ── SUMATERA UTARA (r_sumut_01 - r_sumut_12) ────────────────────────
  { id: 'r_sumut_01', category: 'kekerasan', subcategory: 'begal', description: 'Begal sadis beraksi di Jalan Ring Road Medan, korban terluka akibat sajam.', location: { type: 'Point', coordinates: [98.6250, 3.5750] }, address: 'Jl. Ring Road, Sunggal, Kota Medan, Sumatera Utara', createdAt: hoursAgo(3) },
  { id: 'r_sumut_02', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian sepeda motor di teras rumah kost daerah Padang Bulan.', location: { type: 'Point', coordinates: [98.6520, 3.5580] }, address: 'Padang Bulan, Medan Baru, Kota Medan, Sumatera Utara', createdAt: hoursAgo(10) },
  { id: 'r_sumut_03', category: 'pencurian', subcategory: 'jambret', description: 'Jambret ponsel pejalan kaki di trotoar Lapangan Merdeka Medan.', location: { type: 'Point', coordinates: [98.6750, 3.5910] }, address: 'Kesawan, Medan Barat, Kota Medan, Sumatera Utara', createdAt: daysAgo(1) },
  { id: 'r_sumut_04', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Pengeroyokan juru parkir liar di kawasan Pajak Melati oleh sekelompok pemuda.', location: { type: 'Point', coordinates: [98.6180, 3.5420] }, address: 'Medan Selayang, Kota Medan, Sumatera Utara', createdAt: daysAgo(2) },
  { id: 'r_sumut_05', category: 'penipuan', subcategory: 'penipuan', description: 'Modus penipuan loker fiktif dengan memungut biaya tes di daerah Belawan.', location: { type: 'Point', coordinates: [98.6850, 3.7750] }, address: 'Medan Belawan, Kota Medan, Sumatera Utara', createdAt: daysAgo(4) },
  { id: 'r_sumut_06', category: 'vandalisme', subcategory: 'vandalisme', description: 'Vandalisme coretan cat semprot di dinding luar bangunan cagar budaya Kesawan.', location: { type: 'Point', coordinates: [98.6740, 3.5930] }, address: 'Medan Barat, Kota Medan, Sumatera Utara', createdAt: daysAgo(5) },
  { id: 'r_sumut_07', category: 'pencurian', subcategory: 'copet', description: 'Dompet dicopet di dalam bus angkutan umum lintas Binjai - Medan.', location: { type: 'Point', coordinates: [98.5080, 3.6150] }, address: 'Binjai Barat, Kota Binjai, Sumatera Utara', createdAt: hoursAgo(8) },
  { id: 'r_sumut_08', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran antargeng motor bersenjata celurit di dekat flyover Brayan.', location: { type: 'Point', coordinates: [98.6720, 3.6350] }, address: 'Medan Deli, Kota Medan, Sumatera Utara', createdAt: daysAgo(1) },
  { id: 'r_sumut_09', category: 'pencurian', subcategory: 'maling_barang', description: 'Maling tabung gas elpiji terekam kamera CCTV di warung daerah Tebing Tinggi.', location: { type: 'Point', coordinates: [99.1620, 3.3320] }, address: 'Rambutan, Kota Tebing Tinggi, Sumatera Utara', createdAt: daysAgo(3) },
  { id: 'r_sumut_10', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan turis di sekitar ikon wisata Danau Toba daerah Parapat.', location: { type: 'Point', coordinates: [98.9320, 2.6650] }, address: 'Girsang Sipangan Bolon, Simalungun, Sumatera Utara', createdAt: hoursAgo(15) },
  { id: 'r_sumut_11', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian sepeda motor dinas di area parkir kantor dinas Kota Pematangsiantar.', location: { type: 'Point', coordinates: [99.0620, 2.9600] }, address: 'Siantar Barat, Kota Pematangsiantar, Sumatera Utara', createdAt: daysAgo(2) },
  { id: 'r_sumut_12', category: 'kekerasan', subcategory: 'begal', description: 'Begal motor bersenjata parang di jalan raya Banda Aceh - Medan lintas Lhokseumawe.', location: { type: 'Point', coordinates: [97.1450, 5.1750] }, address: 'Banda Sakti, Kota Lhokseumawe, Aceh', createdAt: daysAgo(6) },

  // ── SUMATERA TENGAH (r_sumteng_01 - r_sumteng_12) ───────────────────
  { id: 'r_sumteng_01', category: 'kekerasan', subcategory: 'begal', description: 'Begal bersenjata tajam beraksi di kawasan jalan bypass Pekanbaru, motor dirampas.', location: { type: 'Point', coordinates: [101.4120, 0.5350] }, address: 'Payung Sekaki, Kota Pekanbaru, Riau', createdAt: hoursAgo(5) },
  { id: 'r_sumteng_02', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian sepeda motor di area parkir ruko Jalan Sudirman Pekanbaru.', location: { type: 'Point', coordinates: [101.4490, 0.5050] }, address: 'Pekanbaru Kota, Kota Pekanbaru, Riau', createdAt: hoursAgo(12) },
  { id: 'r_sumteng_03', category: 'pencurian', subcategory: 'jambret', description: 'Jambret kalung emas milik ibu-ibu saat berbelanja di Pasar Bawah Pekanbaru.', location: { type: 'Point', coordinates: [101.4420, 0.5210] }, address: 'Senapelan, Kota Pekanbaru, Riau', createdAt: daysAgo(1) },
  { id: 'r_sumteng_04', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Penganiayaan jukir liar oleh sekelompok orang di daerah panam Pekanbaru.', location: { type: 'Point', coordinates: [101.3780, 0.4680] }, address: 'Tampan, Kota Pekanbaru, Riau', createdAt: daysAgo(2) },
  { id: 'r_sumteng_05', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan arisan online palsu dengan kerugian ratusan juta di daerah Padang.', location: { type: 'Point', coordinates: [100.3750, -0.9420] }, address: 'Padang Barat, Kota Padang, Sumatera Barat', createdAt: daysAgo(3) },
  { id: 'r_sumteng_06', category: 'vandalisme', subcategory: 'vandalisme', description: 'Coretan grafiti di tugu adipura kota Padang, merusak keindahan tugu.', location: { type: 'Point', coordinates: [100.3620, -0.9500] }, address: 'Padang Selatan, Kota Padang, Sumatera Barat', createdAt: daysAgo(5) },
  { id: 'r_sumteng_07', category: 'pencurian', subcategory: 'copet', description: 'Pencopetan handphone di area pusat perbelanjaan Nagoya Hill Batam.', location: { type: 'Point', coordinates: [104.0150, 1.1420] }, address: 'Nagoya, Lubuk Baja, Kota Batam, Kepulauan Riau', createdAt: hoursAgo(9) },
  { id: 'r_sumteng_08', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran remaja menggunakan kembang api dan sarung di Bengkong Batam.', location: { type: 'Point', coordinates: [104.0320, 1.1550] }, address: 'Bengkong, Kota Batam, Kepulauan Riau', createdAt: daysAgo(1) },
  { id: 'r_sumteng_09', category: 'pencurian', subcategory: 'maling_barang', description: 'Pencurian sepeda lipat di teras perumahan Batam Center, terekam kamera.', location: { type: 'Point', coordinates: [104.0500, 1.1250] }, address: 'Batam Kota, Kota Batam, Kepulauan Riau', createdAt: daysAgo(2) },
  { id: 'r_sumteng_10', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan sopir angkot di dekat pasar raya Kota Padang.', location: { type: 'Point', coordinates: [100.3680, -0.9380] }, address: 'Padang Timur, Kota Padang, Sumatera Barat', createdAt: hoursAgo(18) },
  { id: 'r_sumteng_11', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian mobil bak terbuka bermuatan kelapa sawit di Dumai.', location: { type: 'Point', coordinates: [101.4420, 1.6700] }, address: 'Dumai Timur, Kota Dumai, Riau', createdAt: daysAgo(4) },
  { id: 'r_sumteng_12', category: 'pencurian', subcategory: 'jambret', description: 'Penjambretan tas turis lokal di pantai padang saat sore hari.', location: { type: 'Point', coordinates: [100.3490, -0.9250] }, address: 'Padang Utara, Kota Padang, Sumatera Barat', createdAt: daysAgo(6) },

  // ── SUMATERA SELATAN (r_sumsel_01 - r_sumsel_12) ────────────────────
  { id: 'r_sumsel_01', category: 'kekerasan', subcategory: 'begal', description: 'Begal sadis membacok korban untuk merebut motor di kawasan Jakabaring.', location: { type: 'Point', coordinates: [104.7920, -3.0200] }, address: 'Jakabaring, Seberang Ulu I, Kota Palembang, Sumatera Selatan', createdAt: hoursAgo(2) },
  { id: 'r_sumsel_02', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian motor matic di area parkir pasar 16 Ilir Palembang.', location: { type: 'Point', coordinates: [104.7620, -2.9900] }, address: 'Ilir Timur I, Kota Palembang, Sumatera Selatan', createdAt: hoursAgo(11) },
  { id: 'r_sumsel_03', category: 'pencurian', subcategory: 'jambret', description: 'Jambret ponsel pejalan kaki di atas jembatan Ampera Palembang.', location: { type: 'Point', coordinates: [104.7635, -2.9912] }, address: 'Jembatan Ampera, Seberang Ulu I, Kota Palembang, Sumatera Selatan', createdAt: daysAgo(1) },
  { id: 'r_sumsel_04', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Penganiayaan terhadap supir truk batubara di jalur lintas Muara Enim.', location: { type: 'Point', coordinates: [103.8000, -3.6500] }, address: 'Muara Enim, Kabupaten Muara Enim, Sumatera Selatan', createdAt: daysAgo(3) },
  { id: 'r_sumsel_05', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan investasi bodong berkedok kebun sawit palsu di daerah Prabumulih.', location: { type: 'Point', coordinates: [104.2200, -3.4300] }, address: 'Prabumulih Timur, Kota Prabumulih, Sumatera Selatan', createdAt: daysAgo(4) },
  { id: 'r_sumsel_06', category: 'vandalisme', subcategory: 'vandalisme', description: 'Perusakan halte bus Trans Musi berupa pecahan kaca dan coretan cat.', location: { type: 'Point', coordinates: [104.7500, -2.9600] }, address: 'Sako, Kota Palembang, Sumatera Selatan', createdAt: daysAgo(5) },
  { id: 'r_sumsel_07', category: 'pencurian', subcategory: 'copet', description: 'Copet mencuri dompet turis lokal di pusat kuliner Pempek 26 Ilir.', location: { type: 'Point', coordinates: [104.7450, -2.9850] }, address: 'Bukit Kecil, Kota Palembang, Sumatera Selatan', createdAt: hoursAgo(7) },
  { id: 'r_sumsel_08', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran pemuda antarkampung menggunakan kembang api dan sajam di daerah Ilir Barat.', location: { type: 'Point', coordinates: [104.7200, -2.9950] }, address: 'Ilir Barat II, Kota Palembang, Sumatera Selatan', createdAt: daysAgo(1) },
  { id: 'r_sumsel_09', category: 'pencurian', subcategory: 'maling_barang', description: 'Pencurian genset dari dalam gudang logistik di Kota Jambi.', location: { type: 'Point', coordinates: [103.6200, -1.6150] }, address: 'Telanaipura, Kota Jambi, Jambi', createdAt: daysAgo(2) },
  { id: 'r_sumsel_10', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan bersenjata tajam di kawasan pantai Panjang Bengkulu malam hari.', location: { type: 'Point', coordinates: [102.2600, -3.8100] }, address: 'Ratu Agung, Kota Bengkulu, Bengkulu', createdAt: hoursAgo(16) },
  { id: 'r_sumsel_11', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian sepeda motor di dekat gerbang universitas daerah Bandar Lampung.', location: { type: 'Point', coordinates: [105.2420, -5.3750] }, address: 'Rajabasa, Kota Bandar Lampung, Lampung', createdAt: daysAgo(2) },
  { id: 'r_sumsel_12', category: 'pencurian', subcategory: 'jambret', description: 'Jambret dompet menyasar emak-emak di pasar tradisional Pangkalpinang.', location: { type: 'Point', coordinates: [106.1150, -2.1200] }, address: 'Rangkui, Kota Pangkalpinang, Bangka Belitung', createdAt: daysAgo(6) },

  // ── KALIMANTAN BARAT (r_kalbar_01 - r_kalbar_12) ────────────────────
  { id: 'r_kalbar_01', category: 'kekerasan', subcategory: 'begal', description: 'Begal motor bersajam di jalan arteri luar kota Pontianak, motor dibawa kabur.', location: { type: 'Point', coordinates: [109.3550, -0.0500] }, address: 'Pontianak Tenggara, Kota Pontianak, Kalimantan Barat', createdAt: hoursAgo(4) },
  { id: 'r_kalbar_02', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian motor bebek di parkiran pasar Flamboyan Pontianak.', location: { type: 'Point', coordinates: [109.3440, -0.0350] }, address: 'Pontianak Selatan, Kota Pontianak, Kalimantan Barat', createdAt: hoursAgo(10) },
  { id: 'r_kalbar_03', category: 'pencurian', subcategory: 'jambret', description: 'Jambret HP pejalan kaki di trotoar Jalan Ahmad Yani Pontianak.', location: { type: 'Point', coordinates: [109.3510, -0.0420] }, address: 'Pontianak Kota, Kota Pontianak, Kalimantan Barat', createdAt: daysAgo(1) },
  { id: 'r_kalbar_04', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Pengeroyokan akibat bentrok pemuda di kelab malam daerah Kubu Raya.', location: { type: 'Point', coordinates: [109.4100, -0.1200] }, address: 'Sungai Raya, Kubu Raya, Kalimantan Barat', createdAt: daysAgo(2) },
  { id: 'r_kalbar_05', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan bermodus hipnotis di dalam angkutan umum kota Singkawang.', location: { type: 'Point', coordinates: [108.9800, 0.9080] }, address: 'Singkawang Barat, Kota Singkawang, Kalimantan Barat', createdAt: daysAgo(4) },
  { id: 'r_kalbar_06', category: 'vandalisme', subcategory: 'vandalisme', description: 'Aksi vandalisme pilox di taman kota Singkawang oleh kelompok pemuda mabuk.', location: { type: 'Point', coordinates: [108.9740, 0.9120] }, address: 'Singkawang Tengah, Kota Singkawang, Kalimantan Barat', createdAt: daysAgo(5) },
  { id: 'r_kalbar_07', category: 'pencurian', subcategory: 'copet', description: 'Copet mengambil handphone milik warga di pasar tradisional Sambas.', location: { type: 'Point', coordinates: [109.3020, 1.3600] }, address: 'Sambas, Kabupaten Sambas, Kalimantan Barat', createdAt: hoursAgo(8) },
  { id: 'r_kalbar_08', category: 'tawuran', subcategory: 'tawuran', description: 'Bentrok pemuda bersenjata tajam di kawasan pelabuhan Ketapang Kalbar.', location: { type: 'Point', coordinates: [109.9600, -1.8400] }, address: 'Delta Pawan, Kabupaten Ketapang, Kalimantan Barat', createdAt: daysAgo(2) },
  { id: 'r_kalbar_09', category: 'pencurian', subcategory: 'maling_barang', description: 'Pencurian mesin pompa air di area perkebunan kelapa sawit Palangkaraya.', location: { type: 'Point', coordinates: [113.9100, -2.2200] }, address: 'Pahandut, Kota Palangkaraya, Kalimantan Tengah', createdAt: daysAgo(3) },
  { id: 'r_kalbar_10', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan di kawasan bundaran besar Palangkaraya saat malam sunyi.', location: { type: 'Point', coordinates: [113.9230, -2.2120] }, address: 'Jekan Raya, Kota Palangkaraya, Kalimantan Tengah', createdAt: hoursAgo(15) },
  { id: 'r_kalbar_11', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian sepeda motor di area universitas negeri Palangkaraya.', location: { type: 'Point', coordinates: [113.9000, -2.2280] }, address: 'Jekan Raya, Kota Palangkaraya, Kalimantan Tengah', createdAt: daysAgo(2) },
  { id: 'r_kalbar_12', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran kelompok remaja membawa sarung berisi kawat besi di Ketapang.', location: { type: 'Point', coordinates: [109.9700, -1.8300] }, address: 'Ketapang, Kabupaten Ketapang, Kalimantan Barat', createdAt: daysAgo(6) },

  // ── KALIMANTAN TIMUR (r_kaltim_01 - r_kaltim_12) ────────────────────
  { id: 'r_kaltim_01', category: 'kekerasan', subcategory: 'begal', description: 'Begal sadis beraksi di jalur Samarinda-Balikpapan km 20 malam hari.', location: { type: 'Point', coordinates: [116.9200, -1.0500] }, address: 'Samboja, Kutai Kartanegara, Kalimantan Timur', createdAt: hoursAgo(3) },
  { id: 'r_kaltim_02', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Sepeda motor sport hilang di parkiran kost kawasan Gunung Malang Balikpapan.', location: { type: 'Point', coordinates: [116.8350, -1.2580] }, address: 'Balikpapan Tengah, Kota Balikpapan, Kalimantan Timur', createdAt: hoursAgo(9) },
  { id: 'r_kaltim_03', category: 'pencurian', subcategory: 'jambret', description: 'Jambret menyambar tas pejalan kaki di depan Plaza Balikpapan.', location: { type: 'Point', coordinates: [116.8280, -1.2680] }, address: 'Balikpapan Kota, Kota Balikpapan, Kalimantan Timur', createdAt: daysAgo(1) },
  { id: 'r_kaltim_04', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Penganiayaan pekerja proyek akibat perselisihan upah di dekat kawasan IKN.', location: { type: 'Point', coordinates: [116.7150, -0.9650] }, address: 'Sepaku, Penajam Paser Utara, Kalimantan Timur', createdAt: daysAgo(2) },
  { id: 'r_kaltim_05', category: 'penipuan', subcategory: 'penipuan', description: 'Modus penipuan kapling tanah investasi fiktif di kawasan penyangga IKN.', location: { type: 'Point', coordinates: [116.7450, -0.9500] }, address: 'Penajam Paser Utara, Kalimantan Timur', createdAt: daysAgo(4) },
  { id: 'r_kaltim_06', category: 'vandalisme', subcategory: 'vandalisme', description: 'Pecah kaca pos satpam proyek perumahan di Balikpapan oleh pemuda mabuk.', location: { type: 'Point', coordinates: [116.8850, -1.2150] }, address: 'Balikpapan Utara, Kota Balikpapan, Kalimantan Timur', createdAt: daysAgo(5) },
  { id: 'r_kaltim_07', category: 'pencurian', subcategory: 'copet', description: 'Copet handphone beraksi di pasar tradisional Segiri Samarinda.', location: { type: 'Point', coordinates: [117.1550, -0.4950] }, address: 'Samarinda Ulu, Kota Samarinda, Kalimantan Timur', createdAt: hoursAgo(8) },
  { id: 'r_kaltim_08', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran pelajar antar SMK di dekat pelabuhan Samarinda.', location: { type: 'Point', coordinates: [117.1620, -0.5050] }, address: 'Samarinda Kota, Kota Samarinda, Kalimantan Timur', createdAt: daysAgo(1) },
  { id: 'r_kaltim_09', category: 'pencurian', subcategory: 'maling_barang', description: 'Maling mencuri barang elektronik dari dalam kantor ruko di Banjarmasin.', location: { type: 'Point', coordinates: [114.5950, -3.3220] }, address: 'Banjarmasin Tengah, Kota Banjarmasin, Kalimantan Selatan', createdAt: daysAgo(3) },
  { id: 'r_kaltim_10', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan bersenjata tajam di siring sungai Martapura Banjarmasin malam hari.', location: { type: 'Point', coordinates: [114.5900, -3.3150] }, address: 'Banjarmasin Barat, Kota Banjarmasin, Kalimantan Selatan', createdAt: hoursAgo(16) },
  { id: 'r_kaltim_11', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Motor matic hilang saat diparkir di depan warung makan Bontang.', location: { type: 'Point', coordinates: [117.4850, 0.1250] }, address: 'Bontang Utara, Kota Bontang, Kalimantan Timur', createdAt: daysAgo(2) },
  { id: 'r_kaltim_12', category: 'vandalisme', subcategory: 'vandalisme', description: 'Vandalisme berupa perusakan lampu hias jembatan di kota Tarakan.', location: { type: 'Point', coordinates: [117.5900, 3.3280] }, address: 'Tarakan Barat, Kota Tarakan, Kalimantan Utara', createdAt: daysAgo(6) },

  // ── SULAWESI UTARA (r_sulut_01 - r_sulut_12) ────────────────────────
  { id: 'r_sulut_01', category: 'kekerasan', subcategory: 'begal', description: 'Percobaan begal motor di ring road Manado malam hari, korban berhasil kabur.', location: { type: 'Point', coordinates: [124.8620, 1.4550] }, address: 'Jl. Ring Road, Mapanget, Kota Manado, Sulawesi Utara', createdAt: hoursAgo(5) },
  { id: 'r_sulut_02', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Maling motor terekam CCTV beraksi di parkiran pusat perbelanjaan Manado.', location: { type: 'Point', coordinates: [124.8400, 1.4820] }, address: 'Wenang, Kota Manado, Sulawesi Utara', createdAt: hoursAgo(10) },
  { id: 'r_sulut_03', category: 'pencurian', subcategory: 'jambret', description: 'Jambret dompet menyasar pejalan kaki di trotoar Boulevard Manado.', location: { type: 'Point', coordinates: [124.8320, 1.4780] }, address: 'Sario, Kota Manado, Sulawesi Utara', createdAt: daysAgo(1) },
  { id: 'r_sulut_04', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Kasus penganiayaan di kelab malam kawasan Megamas Manado akibat miras.', location: { type: 'Point', coordinates: [124.8280, 1.4880] }, address: 'Megamas, Wenang, Kota Manado, Sulawesi Utara', createdAt: daysAgo(2) },
  { id: 'r_sulut_05', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan jual beli emas palsu bermodus sistem COD di kota Bitung.', location: { type: 'Point', coordinates: [125.1850, 1.4420] }, address: 'Maesa, Kota Bitung, Sulawesi Utara', createdAt: daysAgo(4) },
  { id: 'r_sulut_06', category: 'vandalisme', subcategory: 'vandalisme', description: 'Aksi corat-coret tembok stadion Klabat Manado oleh supporter bola liar.', location: { type: 'Point', coordinates: [124.8450, 1.4650] }, address: 'Wanea, Kota Manado, Sulawesi Utara', createdAt: daysAgo(5) },
  { id: 'r_sulut_07', category: 'pencurian', subcategory: 'copet', description: 'Handphone dicopet saat antri sembako murah di Gorontalo.', location: { type: 'Point', coordinates: [123.0580, 0.5450] }, address: 'Kota Selatan, Kota Gorontalo, Gorontalo', createdAt: hoursAgo(8) },
  { id: 'r_sulut_08', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran remaja membawa panah wayer di perbatasan desa Gorontalo.', location: { type: 'Point', coordinates: [123.0650, 0.5550] }, address: 'Dumbo Raya, Kota Gorontalo, Gorontalo', createdAt: daysAgo(1) },
  { id: 'r_sulut_09', category: 'pencurian', subcategory: 'maling_barang', description: 'Pencurian genset toko kelontong di kota Palu Sulawesi Tengah.', location: { type: 'Point', coordinates: [119.8750, -0.9020] }, address: 'Palu Timur, Kota Palu, Sulawesi Tengah', createdAt: daysAgo(3) },
  { id: 'r_sulut_10', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan bersenjata tajam di jembatan Ponulele Palu malam hari.', location: { type: 'Point', coordinates: [119.8650, -0.8850] }, address: 'Palu Barat, Kota Palu, Sulawesi Tengah', createdAt: hoursAgo(15) },
  { id: 'r_sulut_11', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian sepeda motor di area universitas tadulako Palu.', location: { type: 'Point', coordinates: [119.8920, -0.8550] }, address: 'Mantikulore, Kota Palu, Sulawesi Tengah', createdAt: daysAgo(2) },
  { id: 'r_sulut_12', category: 'vandalisme', subcategory: 'vandalisme', description: 'Perusakan pot bunga di taman kota Palu oleh sekelompok pemuda.', location: { type: 'Point', coordinates: [119.8800, -0.8980] }, address: 'Palu Selatan, Kota Palu, Sulawesi Tengah', createdAt: daysAgo(6) },

  // ── SULAWESI SELATAN (r_sulsel_01 - r_sulsel_12) ───────────────────
  { id: 'r_sulsel_01', category: 'kekerasan', subcategory: 'begal', description: 'Begal sadis bersenjata busur panah beraksi di Jalan Pettarani Makassar.', location: { type: 'Point', coordinates: [119.4350, -5.1550] }, address: 'Jl. AP Pettarani, Rappocini, Kota Makassar, Sulawesi Selatan', createdAt: hoursAgo(3) },
  { id: 'r_sulsel_02', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Maling motor terekam CCTV menggasak motor matic di area kos Tamalanrea.', location: { type: 'Point', coordinates: [119.4850, -5.1320] }, address: 'Tamalanrea, Kota Makassar, Sulawesi Selatan', createdAt: hoursAgo(10) },
  { id: 'r_sulsel_03', category: 'pencurian', subcategory: 'jambret', description: 'Jambret ponsel pejalan kaki di kawasan anjungan Pantai Losari.', location: { type: 'Point', coordinates: [119.4080, -5.1440] }, address: 'Ujung Pandang, Kota Makassar, Sulawesi Selatan', createdAt: daysAgo(1) },
  { id: 'r_sulsel_04', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Aksi pengeroyokan sopir ojol oleh sekelompok pemuda mabuk di Makassar.', location: { type: 'Point', coordinates: [119.4200, -5.1600] }, address: 'Panakkukang, Kota Makassar, Sulawesi Selatan', createdAt: daysAgo(2) },
  { id: 'r_sulsel_05', category: 'penipuan', subcategory: 'penipuan', description: 'Modus penipuan arisan online palsu di kota Makassar, korban rugi puluhan juta.', location: { type: 'Point', coordinates: [119.4420, -5.1400] }, address: 'Manggala, Kota Makassar, Sulawesi Selatan', createdAt: daysAgo(4) },
  { id: 'r_sulsel_06', category: 'vandalisme', subcategory: 'vandalisme', description: 'Aksi corat-coret liar di dinding terowongan flyover Makassar.', location: { type: 'Point', coordinates: [119.4380, -5.1380] }, address: 'Ujung Tanah, Kota Makassar, Sulawesi Selatan', createdAt: daysAgo(5) },
  { id: 'r_sulsel_07', category: 'pencurian', subcategory: 'copet', description: 'Copet handphone beraksi di pasar Butung Makassar saat pasar ramai pembeli.', location: { type: 'Point', coordinates: [119.4120, -5.1220] }, address: 'Wajo, Kota Makassar, Sulawesi Selatan', createdAt: hoursAgo(8) },
  { id: 'r_sulsel_08', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran antar kelompok pemuda bersenjata busur dan parang di Makassar.', location: { type: 'Point', coordinates: [119.4250, -5.1780] }, address: 'Tallo, Kota Makassar, Sulawesi Selatan', createdAt: daysAgo(1) },
  { id: 'r_sulsel_09', category: 'pencurian', subcategory: 'maling_barang', description: 'Pencuri menyatroni rumah kosong di Kendari, membawa kabur emas dan laptop.', location: { type: 'Point', coordinates: [122.5100, -3.9750] }, address: 'Kadia, Kota Kendari, Sulawesi Tenggara', createdAt: daysAgo(3) },
  { id: 'r_sulsel_10', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan pemuda di area pelabuhan Kendari malam hari.', location: { type: 'Point', coordinates: [122.5350, -3.9550] }, address: 'Kendari Barat, Kota Kendari, Sulawesi Tenggara', createdAt: hoursAgo(15) },
  { id: 'r_sulsel_11', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian sepeda motor matic di area parkir kantor pos Kendari.', location: { type: 'Point', coordinates: [122.5150, -3.9800] }, address: 'Wua-Wua, Kota Kendari, Sulawesi Tenggara', createdAt: daysAgo(2) },
  { id: 'r_sulsel_12', category: 'vandalisme', subcategory: 'vandalisme', description: 'Perusakan kaca etalase warung di kota Palopo oleh pemuda mabuk.', location: { type: 'Point', coordinates: [120.1900, -2.9900] }, address: 'Wara, Kota Palopo, Sulawesi Selatan', createdAt: daysAgo(6) },

  // ── NTT & SUMBAWA (r_ntt_01 - r_ntt_12) ─────────────────────────────
  { id: 'r_ntt_01', category: 'kekerasan', subcategory: 'begal', description: 'Percobaan begal motor di jalan sepi luar kota Kupang, korban ditendang hingga jatuh.', location: { type: 'Point', coordinates: [123.6150, -10.1800] }, address: 'Oebobo, Kota Kupang, Nusa Tenggara Timur', createdAt: hoursAgo(5) },
  { id: 'r_ntt_02', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian motor matic milik mahasiswa di area kampus Universitas Nusa Cendana.', location: { type: 'Point', coordinates: [123.6520, -10.1580] }, address: 'Kelapa Lima, Kota Kupang, Nusa Tenggara Timur', createdAt: hoursAgo(10) },
  { id: 'r_ntt_03', category: 'pencurian', subcategory: 'jambret', description: 'Jambret ponsel pejalan kaki di kawasan pantai Lasiana Kupang.', location: { type: 'Point', coordinates: [123.6750, -10.1250] }, address: 'Lasiana, Kelapa Lima, Kota Kupang, Nusa Tenggara Timur', createdAt: daysAgo(1) },
  { id: 'r_ntt_04', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Pengeroyokan akibat pengaruh minuman keras tradisional di desa Kupang.', location: { type: 'Point', coordinates: [123.6050, -10.1900] }, address: 'Maulafa, Kota Kupang, Nusa Tenggara Timur', createdAt: daysAgo(2) },
  { id: 'r_ntt_05', category: 'penipuan', subcategory: 'penipuan', description: 'Modus penipuan calo tiket kapal laut fiktif di pelabuhan Tenau Kupang.', location: { type: 'Point', coordinates: [123.5350, -10.2000] }, address: 'Alak, Kota Kupang, Nusa Tenggara Timur', createdAt: daysAgo(4) },
  { id: 'r_ntt_06', category: 'vandalisme', subcategory: 'vandalisme', description: 'Perusakan pagar pembatas taman kota Kupang oleh oknum tidak dikenal.', location: { type: 'Point', coordinates: [123.6080, -10.1720] }, address: 'Oebobo, Kota Kupang, Nusa Tenggara Timur', createdAt: daysAgo(5) },
  { id: 'r_ntt_07', category: 'pencurian', subcategory: 'copet', description: 'Copet mencopet HP warga saat keramaian pasar malam Kupang.', location: { type: 'Point', coordinates: [123.6020, -10.1650] }, address: 'Kota Raja, Kota Kupang, Nusa Tenggara Timur', createdAt: hoursAgo(8) },
  { id: 'r_ntt_08', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran kelompok pemuda akibat salah paham di daerah pelabuhan Larantuka.', location: { type: 'Point', coordinates: [122.9800, -8.3400] }, address: 'Larantuka, Flores Timur, Nusa Tenggara Timur', createdAt: daysAgo(1) },
  { id: 'r_ntt_09', category: 'pencurian', subcategory: 'maling_barang', description: 'Pencurian hewan ternak sapi milik warga di Kabupaten Sumbawa NTB.', location: { type: 'Point', coordinates: [117.4200, -8.5000] }, address: 'Sumbawa, Kabupaten Sumbawa, NTB', createdAt: daysAgo(3) },
  { id: 'r_ntt_10', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan bersenjata tajam di kawasan terminal bus Bima NTB.', location: { type: 'Point', coordinates: [118.7200, -8.4500] }, address: 'Rasanae Barat, Kota Bima, NTB', createdAt: hoursAgo(15) },
  { id: 'r_ntt_11', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian motor trail di dekat kawasan persawahan Maumere Flores.', location: { type: 'Point', coordinates: [122.2150, -8.6250] }, address: 'Alok, Kabupaten Sikka, Nusa Tenggara Timur', createdAt: daysAgo(2) },
  { id: 'r_ntt_12', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran remaja membawa batu dan kayu di dekat pantai Waingapu Sumba.', location: { type: 'Point', coordinates: [120.2600, -9.6500] }, address: 'Kota Waingapu, Sumba Timur, Nusa Tenggara Timur', createdAt: daysAgo(6) },

  // ── KEPULAUAN MALUKU (r_maluku_01 - r_maluku_10) ───────────────────
  { id: 'r_maluku_01', category: 'kekerasan', subcategory: 'begal', description: 'Percobaan begal motor di area jalan pantai Ambon malam hari, pelaku menggunakan kayu.', location: { type: 'Point', coordinates: [128.1850, -3.6950] }, address: 'Sirimau, Kota Ambon, Maluku', createdAt: hoursAgo(5) },
  { id: 'r_maluku_02', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Motor matic hilang di parkiran kantor kelurahan Kota Ambon.', location: { type: 'Point', coordinates: [128.1720, -3.6880] }, address: 'Nusaniwe, Kota Ambon, Maluku', createdAt: hoursAgo(10) },
  { id: 'r_maluku_03', category: 'pencurian', subcategory: 'jambret', description: 'Penjambretan handphone pejalan kaki di dekat Gong Perdamaian Ambon.', location: { type: 'Point', coordinates: [128.1810, -3.6930] }, address: 'Sirimau, Kota Ambon, Maluku', createdAt: daysAgo(1) },
  { id: 'r_maluku_04', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Kasus pengeroyokan pemuda di pelabuhan Yos Sudarso Ambon akibat miras.', location: { type: 'Point', coordinates: [128.1900, -3.6820] }, address: 'Pelabuhan Yos Sudarso, Kota Ambon, Maluku', createdAt: daysAgo(2) },
  { id: 'r_maluku_05', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan transaksi sembako murah palsu yang merugikan pedagang pasar Ambon.', location: { type: 'Point', coordinates: [128.1830, -3.6900] }, address: 'Sirimau, Kota Ambon, Maluku', createdAt: daysAgo(4) },
  { id: 'r_maluku_06', category: 'pencurian', subcategory: 'copet', description: 'Copet beraksi mengambil dompet di pasar tradisional Mardika Ambon.', location: { type: 'Point', coordinates: [128.1880, -3.6920] }, address: 'Pasar Mardika, Kota Ambon, Maluku', createdAt: hoursAgo(8) },
  { id: 'r_maluku_07', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran kelompok pemuda antar desa di perbatasan Maluku Tengah.', location: { type: 'Point', coordinates: [128.9500, -3.3100] }, address: 'Masohi, Maluku Tengah, Maluku', createdAt: daysAgo(1) },
  { id: 'r_maluku_08', category: 'pencurian', subcategory: 'maling_barang', description: 'Pencurian hasil bumi cengkeh jemuran milik petani di Ternate.', location: { type: 'Point', coordinates: [127.3800, 0.7900] }, address: 'Ternate Selatan, Kota Ternate, Maluku Utara', createdAt: daysAgo(3) },
  { id: 'r_maluku_09', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan turis di dekat benteng Tolukko Ternate malam hari.', location: { type: 'Point', coordinates: [127.3880, 0.8120] }, address: 'Ternate Utara, Kota Ternate, Maluku Utara', createdAt: hoursAgo(15) },
  { id: 'r_maluku_10', category: 'vandalisme', subcategory: 'vandalisme', description: 'Perusakan lampu penerangan jalan di kawasan pantai Falajawa Ternate.', location: { type: 'Point', coordinates: [127.3780, 0.7850] }, address: 'Ternate Tengah, Kota Ternate, Maluku Utara', createdAt: daysAgo(5) },

  // ── PAPUA BARAT (r_papuab_01 - r_papuab_10) ─────────────────────────
  { id: 'r_papuab_01', category: 'kekerasan', subcategory: 'begal', description: 'Begal motor beraksi di jalur arteri pelabuhan Sorong, pelaku membawa kayu balok.', location: { type: 'Point', coordinates: [131.2550, -0.8850] }, address: 'Sorong Kota, Kota Sorong, Papua Barat Daya', createdAt: hoursAgo(4) },
  { id: 'r_papuab_02', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Motor trail dinas hilang di parkiran kantor daerah Sorong.', location: { type: 'Point', coordinates: [131.2400, -0.8750] }, address: 'Sorong Timur, Kota Sorong, Papua Barat Daya', createdAt: hoursAgo(9) },
  { id: 'r_papuab_03', category: 'pencurian', subcategory: 'jambret', description: 'Jambret merampas tas pejalan kaki di trotoar Jalan Ahmad Yani Sorong.', location: { type: 'Point', coordinates: [131.2610, -0.8800] }, address: 'Sorong Barat, Kota Sorong, Papua Barat Daya', createdAt: daysAgo(1) },
  { id: 'r_papuab_04', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Bentrok fisik pemuda akibat pengaruh minuman keras di kelab malam Sorong.', location: { type: 'Point', coordinates: [131.2450, -0.8900] }, address: 'Sorong Manoi, Kota Sorong, Papua Barat Daya', createdAt: daysAgo(2) },
  { id: 'r_papuab_05', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan berkedok investasi hasil laut fiktif di daerah Raja Ampat.', location: { type: 'Point', coordinates: [130.8200, -0.4200] }, address: 'Waisai, Raja Ampat, Papua Barat Daya', createdAt: daysAgo(4) },
  { id: 'r_papuab_06', category: 'pencurian', subcategory: 'copet', description: 'Copet mencuri HP penumpang kapal di ruang tunggu pelabuhan Sorong.', location: { type: 'Point', coordinates: [131.2380, -0.8650] }, address: 'Sorong Kepulauan, Kota Sorong, Papua Barat Daya', createdAt: hoursAgo(8) },
  { id: 'r_papuab_07', category: 'tawuran', subcategory: 'tawuran', description: 'Tawuran antar warga menggunakan busur panah tradisional di Manokwari.', location: { type: 'Point', coordinates: [134.0650, -0.8620] }, address: 'Manokwari Barat, Kabupaten Manokwari, Papua Barat', createdAt: daysAgo(1) },
  { id: 'r_papuab_08', category: 'pencurian', subcategory: 'maling_barang', description: 'Maling genset proyek jalan trans papua daerah Manokwari.', location: { type: 'Point', coordinates: [134.0500, -0.8550] }, address: 'Manokwari Timur, Kabupaten Manokwari, Papua Barat', createdAt: daysAgo(3) },
  { id: 'r_papuab_09', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan sopir angkutan kota di dekat pasar sanggeng Manokwari.', location: { type: 'Point', coordinates: [134.0580, -0.8700] }, address: 'Manokwari Barat, Kabupaten Manokwari, Papua Barat', createdAt: hoursAgo(15) },
  { id: 'r_papuab_10', category: 'vandalisme', subcategory: 'vandalisme', description: 'Perusakan halte bus trans Manokwari berupa coretan dan pecahan kaca.', location: { type: 'Point', coordinates: [134.0700, -0.8800] }, address: 'Manokwari Selatan, Kabupaten Manokwari, Papua Barat', createdAt: daysAgo(5) },

  // ── PAPUA TIMUR (r_papuat_01 - r_papuat_10) ─────────────────────────
  { id: 'r_papuat_01', category: 'kekerasan', subcategory: 'begal', description: 'Begal sadis bersenjata tajam beraksi di jalan trans Jayapura-Wamena.', location: { type: 'Point', coordinates: [140.6650, -2.5950] }, address: 'Abepura, Kota Jayapura, Papua', createdAt: hoursAgo(4) },
  { id: 'r_papuat_02', category: 'pencurian', subcategory: 'maling_kendaraan', description: 'Pencurian sepeda motor dinas di area parkir kantor daerah Jayapura.', location: { type: 'Point', coordinates: [140.7020, -2.5350] }, address: 'Jayapura Utara, Kota Jayapura, Papua', createdAt: hoursAgo(9) },
  { id: 'r_papuat_03', category: 'pencurian', subcategory: 'jambret', description: 'Jambret ponsel pejalan kaki di dekat dermaga Jayapura.', location: { type: 'Point', coordinates: [140.7080, -2.5450] }, address: 'Jayapura Selatan, Kota Jayapura, Papua', createdAt: daysAgo(1) },
  { id: 'r_papuat_04', category: 'kekerasan', subcategory: 'penganiayaan', description: 'Pengeroyokan juru parkir di dekat pasar baru Jayapura akibat perselisihan.', location: { type: 'Point', coordinates: [140.6850, -2.5800] }, address: 'Heram, Kota Jayapura, Papua', createdAt: daysAgo(2) },
  { id: 'r_papuat_05', category: 'penipuan', subcategory: 'penipuan', description: 'Penipuan rekrutmen pegawai BUMN fiktif bermodus uang jaminan di Jayapura.', location: { type: 'Point', coordinates: [140.6900, -2.5600] }, address: 'Jayapura Selatan, Kota Jayapura, Papua', createdAt: daysAgo(4) },
  { id: 'r_papuat_06', category: 'pencurian', subcategory: 'copet', description: 'Copet beraksi di tengah keramaian pasar Youtefa Jayapura.', location: { type: 'Point', coordinates: [140.6600, -2.6100] }, address: 'Abepura, Kota Jayapura, Papua', createdAt: hoursAgo(8) },
  { id: 'r_papuat_07', category: 'tawuran', subcategory: 'tawuran', description: 'Bentrok warga antarkampung menggunakan panah dan busur tradisional di Timika.', location: { type: 'Point', coordinates: [136.8850, -4.5450] }, address: 'Mimika Baru, Kabupaten Mimika, Papua Tengah', createdAt: daysAgo(1) },
  { id: 'r_papuat_08', category: 'pencurian', subcategory: 'maling_barang', description: 'Pencurian kabel tembaga instalasi industri tambang di Mimika.', location: { type: 'Point', coordinates: [136.9020, -4.5650] }, address: 'Kuala Kencana, Kabupaten Mimika, Papua Tengah', createdAt: daysAgo(3) },
  { id: 'r_papuat_09', category: 'kekerasan', subcategory: 'penodongan', description: 'Penodongan bersenjata di kawasan perbatasan Merauke malam hari.', location: { type: 'Point', coordinates: [140.4050, -8.5050] }, address: 'Merauke, Kabupaten Merauke, Papua Selatan', createdAt: hoursAgo(15) },
  { id: 'r_papuat_10', category: 'vandalisme', subcategory: 'vandalisme', description: 'Perusakan rambu lalu lintas di dekat bandara Mopah Merauke.', location: { type: 'Point', coordinates: [140.4200, -8.4900] }, address: 'Merauke, Kabupaten Merauke, Papua Selatan', createdAt: daysAgo(5) }
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
        const apiReports = data.map((r) => ({
          id: r._id || r.id,
          category: r.category,
          subcategory: r.subcategory,
          description: r.description,
          location: r.location,
          address: r.address || '',
          createdAt: new Date(r.createdAt),
        }))

        if (!IS_PROD) {
          // Di development mode, gabungkan data riil API dengan MOCK_REPORTS agar peta selalu terpopulasi penuh
          reports.value = [...apiReports, ...MOCK_REPORTS.map((r) => ({ ...r }))]
          console.log(`[StaySafe Dev] Berhasil memuat ${apiReports.length} laporan riil dari API dan menggabungkannya dengan ${MOCK_REPORTS.length} laporan simulasi lokal.`);
        } else {
          // Di produksi, hanya gunakan data riil asli dari API/Firestore
          reports.value = apiReports
        }
      } else {
        // Jika di produksi tetapi API_BASE kosong, ini adalah kesalahan konfigurasi kritis
        if (IS_PROD) {
          throw new Error('VITE_API_BASE_URL tidak terdefinisi di lingkungan produksi.')
        }
        // Fallback ke data simulasi offline di development
        await new Promise((resolve) => setTimeout(resolve, 300))
        reports.value = MOCK_REPORTS.map((r) => ({ ...r }))
        console.log(`[StaySafe Dev] Mode offline aktif. Menggunakan ${MOCK_REPORTS.length} laporan simulasi lokal.`);
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
