/**
 * StaySafe.my.id — Crime Category Definitions
 *
 * 5 categories × 11 subcategories with Indonesian labels,
 * gradient color scales, and emoji icons.
 */

export const CATEGORIES = {
  kekerasan: {
    id: 'kekerasan',
    label: 'Kejahatan dengan Kekerasan',
    color: {
      light: '#FCA5A5',
      DEFAULT: '#EF4444',
      dark: '#991B1B',
    },
    icon: 'fa-solid fa-hand-fist',
    subcategories: [
      { id: 'begal', label: 'Begal' },
      { id: 'penodongan', label: 'Penodongan' },
      { id: 'penganiayaan', label: 'Penganiayaan' },
      { id: 'pelecehan_seksual', label: 'Pelecehan Seksual' },
    ],
  },

  pencurian: {
    id: 'pencurian',
    label: 'Kejahatan Pencurian',
    color: {
      light: '#FDBA74',
      DEFAULT: '#F97316',
      dark: '#9A3412',
    },
    icon: 'fa-solid fa-user-secret',
    subcategories: [
      { id: 'jambret', label: 'Jambret' },
      { id: 'copet', label: 'Copet' },
      { id: 'maling_kendaraan', label: 'Maling Kendaraan' },
      { id: 'maling_barang', label: 'Maling Barang' },
    ],
  },

  penipuan: {
    id: 'penipuan',
    label: 'Penipuan',
    color: {
      light: '#D8B4FE',
      DEFAULT: '#A855F7',
      dark: '#581C87',
    },
    icon: 'fa-solid fa-comments-dollar',
    subcategories: [
      { id: 'penipuan', label: 'Penipuan' },
    ],
  },

  vandalisme: {
    id: 'vandalisme',
    label: 'Vandalisme',
    color: {
      light: '#93C5FD',
      DEFAULT: '#3B82F6',
      dark: '#1E3A5F',
    },
    icon: 'fa-solid fa-spray-can',
    subcategories: [
      { id: 'vandalisme', label: 'Vandalisme' },
    ],
  },

  tawuran: {
    id: 'tawuran',
    label: 'Tawuran',
    color: {
      light: '#BBF7D0',
      DEFAULT: '#22C55E',
      dark: '#14532D',
    },
    icon: 'fa-solid fa-people-group',
    subcategories: [
      { id: 'tawuran', label: 'Tawuran' },
    ],
  },
}

// ---------------------------------------------------------------------------
// Helper: look up a category by id
// ---------------------------------------------------------------------------
export function getCategoryById(id) {
  return CATEGORIES[id] || null
}

// ---------------------------------------------------------------------------
// Helper: interpolate between light ↔ dark color based on density (0 – 1)
// ---------------------------------------------------------------------------
function hexToRgb(hex) {
  const n = parseInt(hex.replace('#', ''), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex(r, g, b) {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.round(v).toString(16).padStart(2, '0'))
      .join('')
  )
}

function lerpColor(hexA, hexB, t) {
  const a = hexToRgb(hexA)
  const b = hexToRgb(hexB)
  return rgbToHex(
    a[0] + (b[0] - a[0]) * t,
    a[1] + (b[1] - a[1]) * t,
    a[2] + (b[2] - a[2]) * t,
  )
}

/**
 * Return an interpolated hex color for a category given a density value.
 * density 0 → light color, density 1 → dark color.
 */
export function getCategoryColor(id, density = 0.5) {
  const cat = getCategoryById(id)
  if (!cat) return '#888888'
  const t = Math.max(0, Math.min(1, density))
  return lerpColor(cat.color.light, cat.color.dark, t)
}

// ---------------------------------------------------------------------------
// Helper: resolve a subcategory label
// ---------------------------------------------------------------------------
export function getSubcategoryLabel(categoryId, subcategoryId) {
  const cat = getCategoryById(categoryId)
  if (!cat) return subcategoryId
  const sub = cat.subcategories.find((s) => s.id === subcategoryId)
  return sub ? sub.label : subcategoryId
}

// ---------------------------------------------------------------------------
// Flat list of every subcategory (handy for dropdowns, filters, etc.)
// ---------------------------------------------------------------------------
export const ALL_SUBCATEGORIES = Object.values(CATEGORIES).flatMap((cat) =>
  cat.subcategories.map((sub) => ({
    categoryId: cat.id,
    subcategoryId: sub.id,
    label: sub.label,
    color: cat.color.DEFAULT,
  })),
)
