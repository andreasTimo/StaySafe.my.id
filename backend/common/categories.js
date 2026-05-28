/**
 * StaySafe.my.id — Crime Categories Backend Validation Helper
 */

const VALID_CATEGORIES = {
  kekerasan: ['begal', 'penodongan', 'penganiayaan', 'pelecehan_seksual'],
  pencurian: ['jambret', 'copet', 'maling_kendaraan', 'maling_barang'],
  penipuan: ['penipuan'],
  vandalisme: ['vandalisme'],
  tawuran: ['tawuran']
};

function isValidCategory(category) {
  return Object.prototype.hasOwnProperty.call(VALID_CATEGORIES, category);
}

function isValidSubcategory(category, subcategory) {
  if (!isValidCategory(category)) return false;
  return VALID_CATEGORIES[category].includes(subcategory);
}

module.exports = {
  VALID_CATEGORIES,
  isValidCategory,
  isValidSubcategory
};
