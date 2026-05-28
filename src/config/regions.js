/**
 * StaySafe.my.id — Regions Configuration & Spatial Boundaries
 */

export const REGIONS = {
  national: {
    id: 'national',
    label: 'Seluruh Indonesia',
    center: [-2.5000, 118.0000],
    zoom: 5,
    bbox: '95.0,-11.0,141.0,6.0',
    contains: () => true
  },
  jabodetabekjur: {
    id: 'jabodetabekjur',
    label: 'JABODETABEKJUR',
    center: [-6.2088, 106.8456],
    zoom: 10,
    bbox: '106.3,-7.0,107.5,-5.9',
    contains: (lat, lng) => lat >= -7.0 && lat <= -5.9 && lng >= 106.3 && lng <= 107.5
  },
  diy_jateng: {
    id: 'diy_jateng',
    label: 'DIY & Jawa Tengah',
    center: [-7.8014, 110.3748],
    zoom: 9,
    bbox: '108.5,-8.5,111.7,-6.3',
    contains: (lat, lng) => lat >= -8.5 && lat <= -6.3 && lng >= 108.5 && lng <= 111.7
  },
  jawa_timur: {
    id: 'jawa_timur',
    label: 'Jawa Timur',
    center: [-7.2575, 112.7521],
    zoom: 9,
    bbox: '111.0,-8.9,114.7,-6.7',
    contains: (lat, lng) => lat >= -8.9 && lat <= -6.7 && lng >= 111.0 && lng <= 114.7
  },
  bali_lombok: {
    id: 'bali_lombok',
    label: 'Bali & Lombok (NTB)',
    center: [-8.5500, 115.7000],
    zoom: 9,
    bbox: '114.3,-9.1,116.8,-8.0',
    contains: (lat, lng) => lat >= -9.1 && lat <= -8.0 && lng >= 114.3 && lng <= 116.8
  }
}

export function getRegionById(id) {
  return REGIONS[id] || REGIONS.national
}

export function detectRegionFromCoords(lat, lng) {
  // Lakukan pencocokan dari wilayah kluster spesifik
  for (const [key, region] of Object.entries(REGIONS)) {
    if (key !== 'national' && region.contains(lat, lng)) {
      return key
    }
  }
  return 'national'
}
