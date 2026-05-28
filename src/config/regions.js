/**
 * StaySafe.my.id — Regions Configuration & Spatial Boundaries
 * 
 * Pengelompokan 15 wilayah regional di seluruh Indonesia untuk 
 * mendukung visualisasi, pembatasan pencarian alamat (bbox), dan auto-detection GPS.
 */

export const REGIONS = {
  // ── 1. Pulau Jawa & Bali (Kepadatan Tinggi) ─────────────────────────
  jabodetabekjur: {
    id: 'jabodetabekjur',
    label: 'Jabodetabekjur',
    shortLabel: 'Jabodetabek',
    center: [-6.2088, 106.8456],
    zoom: 10,
    bbox: '106.3,-7.0,107.5,-5.9',
    contains: (lat, lng) => lat >= -7.0 && lat <= -5.9 && lng >= 106.3 && lng <= 107.5
  },
  jbar_banten: {
    id: 'jbar_banten',
    label: 'Jabar & Banten',
    shortLabel: 'Jabar',
    center: [-6.9000, 107.6000],
    zoom: 8,
    bbox: '105.0,-7.8,108.8,-5.8',
    contains: (lat, lng) => lat >= -7.8 && lat <= -5.8 && lng >= 105.0 && lng <= 108.8
  },
  diy_jateng: {
    id: 'diy_jateng',
    label: 'DIY & Jawa Tengah',
    shortLabel: 'DIY & Jateng',
    center: [-7.8014, 110.3748],
    zoom: 9,
    bbox: '108.5,-8.5,111.7,-6.3',
    contains: (lat, lng) => lat >= -8.5 && lat <= -6.3 && lng >= 108.5 && lng <= 111.7
  },
  jawa_timur: {
    id: 'jawa_timur',
    label: 'Jawa Timur',
    shortLabel: 'Jatim',
    center: [-7.2575, 112.7521],
    zoom: 9,
    bbox: '111.0,-8.9,114.7,-6.7',
    contains: (lat, lng) => lat >= -8.9 && lat <= -6.7 && lng >= 111.0 && lng <= 114.7
  },
  bali_lombok: {
    id: 'bali_lombok',
    label: 'Bali & Lombok',
    shortLabel: 'Bali & Lombok',
    center: [-8.5500, 115.7000],
    zoom: 9,
    bbox: '114.3,-9.1,116.8,-8.0',
    contains: (lat, lng) => lat >= -9.1 && lat <= -8.0 && lng >= 114.3 && lng <= 116.8
  },

  // ── 2. Region Sumatera (Kepadatan Menengah - Tinggi) ────────────────
  sumatera_utara: {
    id: 'sumatera_utara',
    label: 'Sumatera Utara',
    shortLabel: 'Sumut',
    center: [2.5000, 99.0000],
    zoom: 7,
    bbox: '95.0,0.0,100.5,6.2',
    contains: (lat, lng) => lat >= 0.0 && lat <= 6.2 && lng >= 95.0 && lng <= 100.5
  },
  sumatera_tengah: {
    id: 'sumatera_tengah',
    label: 'Sumatera Tengah',
    shortLabel: 'Sumatera Tengah',
    center: [-0.5000, 101.5000],
    zoom: 7,
    bbox: '98.5,-2.0,109.0,2.5',
    contains: (lat, lng) => lat >= -2.0 && lat <= 2.5 && lng >= 98.5 && lng <= 109.0
  },
  sumatera_selatan: {
    id: 'sumatera_selatan',
    label: 'Sumatera Selatan',
    shortLabel: 'Sumsel',
    center: [-3.5000, 104.0000],
    zoom: 7,
    bbox: '101.0,-6.2,109.0,-0.8',
    contains: (lat, lng) => lat >= -6.2 && lat <= -0.8 && lng >= 101.0 && lng <= 109.0
  },

  // ── 3. Region Kalimantan (Luas, Terpusat di Pesisir) ─────────────────
  kalimantan_barat: {
    id: 'kalimantan_barat',
    label: 'Kalbar & Kalteng',
    shortLabel: 'Kalbar',
    center: [-0.5000, 111.5000],
    zoom: 6,
    bbox: '108.0,-3.8,116.0,2.5',
    contains: (lat, lng) => lat >= -3.8 && lat <= 2.5 && lng >= 108.0 && lng <= 116.0
  },
  kalimantan_timur: {
    id: 'kalimantan_timur',
    label: 'Kaltim, Kalsel, IKN',
    shortLabel: 'Kaltim-IKN',
    center: [0.5000, 116.0000],
    zoom: 6,
    bbox: '114.0,-4.5,119.5,4.5',
    contains: (lat, lng) => lat >= -4.5 && lat <= 4.5 && lng >= 114.0 && lng <= 119.5
  },

  // ── 4. Region Sulawesi, Maluku, & Nusa Tenggara ─────────────────────
  sulawesi_utara: {
    id: 'sulawesi_utara',
    label: 'Sulut, Gorontalo, Sulteng',
    shortLabel: 'Sulut',
    center: [1.0000, 121.5000],
    zoom: 7,
    bbox: '119.0,-2.5,127.5,5.0',
    contains: (lat, lng) => lat >= -2.5 && lat <= 5.0 && lng >= 119.0 && lng <= 127.5
  },
  sulawesi_selatan: {
    id: 'sulawesi_selatan',
    label: 'Sulsel, Sulbar, Sultra',
    shortLabel: 'Sulsel',
    center: [-4.0000, 121.0000],
    zoom: 7,
    bbox: '118.5,-7.0,125.0,-1.0',
    contains: (lat, lng) => lat >= -7.0 && lat <= -1.0 && lng >= 118.5 && lng <= 125.0
  },
  ntt_sumbawa: {
    id: 'ntt_sumbawa',
    label: 'NTT & Sumbawa',
    shortLabel: 'NTT',
    center: [-8.6000, 121.0000],
    zoom: 7,
    bbox: '116.5,-11.5,125.5,-8.0',
    contains: (lat, lng) => lat >= -11.5 && lat <= -8.0 && lng >= 116.5 && lng <= 125.5
  },
  kep_maluku: {
    id: 'kep_maluku',
    label: 'Kepulauan Maluku',
    shortLabel: 'Maluku',
    center: [-3.0000, 129.0000],
    zoom: 6,
    bbox: '124.0,-8.5,132.0,3.5',
    contains: (lat, lng) => lat >= -8.5 && lat <= 3.5 && lng >= 124.0 && lng <= 132.0
  },

  // ── 5. Region Papua (Sangat Luas) ───────────────────────────────────
  papua_barat: {
    id: 'papua_barat',
    label: 'Papua Barat',
    shortLabel: 'Papua Barat',
    center: [-1.5000, 132.5000],
    zoom: 6,
    bbox: '129.0,-4.5,135.5,1.5',
    contains: (lat, lng) => lat >= -4.5 && lat <= 1.5 && lng >= 129.0 && lng <= 135.5
  },
  papua_timur: {
    id: 'papua_timur',
    label: 'Papua Induk & Selatan',
    shortLabel: 'Papua Timur',
    center: [-4.5000, 139.0000],
    zoom: 6,
    bbox: '134.5,-9.5,141.2,-1.0',
    contains: (lat, lng) => lat >= -9.5 && lat <= -1.0 && lng >= 134.5 && lng <= 141.2
  },

  // ── 6. Fallback Nasional (Seluruh Indonesia) ───────────────────────
  national: {
    id: 'national',
    label: 'Seluruh Indonesia',
    shortLabel: 'Nasional',
    center: [-2.5000, 118.0000],
    zoom: 5,
    bbox: '95.0,-11.0,141.0,6.0',
    contains: () => true
  }
}

export function getRegionById(id) {
  return REGIONS[id] || REGIONS.national
}

export function detectRegionFromCoords(lat, lng) {
  // Lakukan pencocokan dari wilayah kluster spesifik (cari yang lebih sempit dulu)
  // Evaluasi jabodetabekjur sebelum jbar_banten agar terdeteksi secara tepat
  const orderOfDetection = [
    'jabodetabekjur',
    'jbar_banten',
    'diy_jateng',
    'jawa_timur',
    'bali_lombok',
    'sumatera_utara',
    'sumatera_tengah',
    'sumatera_selatan',
    'kalimantan_barat',
    'kalimantan_timur',
    'sulawesi_utara',
    'sulawesi_selatan',
    'ntt_sumbawa',
    'kep_maluku',
    'papua_barat',
    'papua_timur'
  ]

  for (const key of orderOfDetection) {
    const region = REGIONS[key]
    if (region && region.contains(lat, lng)) {
      return key
    }
  }

  return 'national'
}
