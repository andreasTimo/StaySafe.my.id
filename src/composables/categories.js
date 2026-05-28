/**
 * Crime categories with colors and subcategories for StaySafe.my.id
 */
export const CATEGORIES = [
  {
    id: 'pencurian',
    label: 'Pencurian',
    color: '#f59e0b',
    subcategories: [
      { id: 'jambret', label: 'Jambret' },
      { id: 'copet', label: 'Copet' },
      { id: 'pencurian_kendaraan', label: 'Pencurian Kendaraan' },
      { id: 'pencurian_rumah', label: 'Pencurian Rumah' },
      { id: 'pencurian_lainnya', label: 'Lainnya' },
    ],
  },
  {
    id: 'kekerasan',
    label: 'Kekerasan',
    color: '#ef4444',
    subcategories: [
      { id: 'perampokan', label: 'Perampokan' },
      { id: 'penganiayaan', label: 'Penganiayaan' },
      { id: 'tawuran', label: 'Tawuran' },
      { id: 'kekerasan_lainnya', label: 'Lainnya' },
    ],
  },
  {
    id: 'pelecehan',
    label: 'Pelecehan',
    color: '#a855f7',
    subcategories: [
      { id: 'pelecehan_seksual', label: 'Pelecehan Seksual' },
      { id: 'pelecehan_verbal', label: 'Pelecehan Verbal' },
      { id: 'stalking', label: 'Penguntitan' },
      { id: 'pelecehan_lainnya', label: 'Lainnya' },
    ],
  },
  {
    id: 'penipuan',
    label: 'Penipuan',
    color: '#3b82f6',
    subcategories: [
      { id: 'penipuan_online', label: 'Penipuan Online' },
      { id: 'penipuan_jalanan', label: 'Penipuan Jalanan' },
      { id: 'hipnotis', label: 'Hipnotis' },
      { id: 'penipuan_lainnya', label: 'Lainnya' },
    ],
  },
  {
    id: 'vandalisme',
    label: 'Vandalisme & Gangguan',
    color: '#10b981',
    subcategories: [
      { id: 'perusakan', label: 'Perusakan Properti' },
      { id: 'gangguan_ketertiban', label: 'Gangguan Ketertiban' },
      { id: 'narkoba', label: 'Narkoba' },
      { id: 'vandalisme_lainnya', label: 'Lainnya' },
    ],
  },
]

/**
 * Get category color by ID
 */
export function getCategoryColor(categoryId) {
  const cat = CATEGORIES.find((c) => c.id === categoryId)
  return cat ? cat.color : '#6b7280'
}
