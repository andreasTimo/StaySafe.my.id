<script setup>
import { ref, computed, watch, nextTick } from 'vue'
import { CATEGORIES } from '../config/categories.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  location: {
    type: Object,
    default: null
  }
})

const emit = defineEmits(['update:modelValue', 'submit'])

const dialogRef = ref(null)

// Form state & Cloudflare Turnstile variables
const selectedCategory = ref('')
const selectedSubcategory = ref('')
const description = ref('')
const isSubmitting = ref(false)
const turnstileToken = ref('')
const turnstileWidgetId = ref(null)
const siteKey = import.meta.env.VITE_TURNSTILE_SITEKEY || '1x00000000000000000000AA' // Fallback testing key

// Validation errors
const errors = ref({
  category: '',
  subcategory: '',
  description: '',
  turnstile: ''
})

// Convert CATEGORIES object to array for iteration
const categoryList = computed(() => Object.values(CATEGORIES))

// Inisialisasi dan Render Widget Turnstile
function renderTurnstile() {
  if (window.turnstile && document.getElementById('turnstile-container')) {
    try {
      if (turnstileWidgetId.value !== null) {
        window.turnstile.reset(turnstileWidgetId.value)
      }
      
      turnstileWidgetId.value = window.turnstile.render('#turnstile-container', {
        sitekey: siteKey,
        theme: 'dark',
        callback: (token) => {
          turnstileToken.value = token
          errors.value.turnstile = ''
        },
        'expired-callback': () => {
          turnstileToken.value = ''
        },
        'error-callback': () => {
          turnstileToken.value = ''
        }
      })
    } catch (err) {
      console.warn('[StaySafe Turnstile] Gagal me-render widget Turnstile:', err)
    }
  }
}

// Watch modelValue to open/close dialog
watch(() => props.modelValue, async (open) => {
  await nextTick()
  if (!dialogRef.value) return
  if (open) {
    dialogRef.value.showModal()
    // Berikan delay pendek agar elemen penampung container Turnstile sudah siap di DOM
    setTimeout(renderTurnstile, 150)
  } else {
    dialogRef.value.close()
    resetForm()
  }
})

// Handle dialog close (Escape key or backdrop click)
function handleDialogClose() {
  emit('update:modelValue', false)
}

function handleBackdropClick(e) {
  if (e.target === dialogRef.value) {
    emit('update:modelValue', false)
  }
}

// Category helpers
const currentCategory = computed(() => {
  return CATEGORIES[selectedCategory.value] || null
})

const subcategories = computed(() => {
  return currentCategory.value?.subcategories || []
})

const categoryColor = computed(() => {
  return currentCategory.value?.color.DEFAULT || '#6b7280'
})

// Description char count
const charCount = computed(() => description.value.length)
const charCountColor = computed(() => {
  if (charCount.value > 480) return 'text-red-400'
  if (charCount.value > 400) return 'text-yellow-400'
  return 'text-white/30'
})

// Reset subcategory when switching category
watch(selectedCategory, () => {
  selectedSubcategory.value = ''
  errors.value.category = ''
  errors.value.subcategory = ''
  // Reset token Turnstile karena input berganti
  turnstileToken.value = ''
  if (window.turnstile && turnstileWidgetId.value !== null) {
    try {
      window.turnstile.reset(turnstileWidgetId.value)
    } catch (e) {}
  }
})

// Form actions
function resetForm() {
  selectedCategory.value = ''
  selectedSubcategory.value = ''
  description.value = ''
  isSubmitting.value = false
  turnstileToken.value = ''
  if (window.turnstile && turnstileWidgetId.value !== null) {
    try {
      window.turnstile.reset(turnstileWidgetId.value)
    } catch (e) {}
  }
  errors.value = { category: '', subcategory: '', description: '', turnstile: '' }
}

function validate() {
  let valid = true
  errors.value = { category: '', subcategory: '', description: '', turnstile: '' }

  if (!selectedCategory.value) {
    errors.value.category = 'Pilih kategori kejadian'
    valid = false
  }
  if (!selectedSubcategory.value) {
    errors.value.subcategory = 'Pilih sub-kategori'
    valid = false
  }
  if (!description.value.trim()) {
    errors.value.description = 'Deskripsi tidak boleh kosong'
    valid = false
  } else if (description.value.length > 500) {
    errors.value.description = 'Deskripsi maksimal 500 karakter'
    valid = false
  }

  // Validasi Turnstile wajib terisi jika subkategori dipilih
  if (selectedSubcategory.value && !turnstileToken.value) {
    errors.value.turnstile = 'Harap selesaikan tantangan verifikasi Turnstile'
    valid = false
  }

  return valid
}

async function handleSubmit() {
  if (!validate()) return

  isSubmitting.value = true

  const data = {
    category: selectedCategory.value,
    subcategory: selectedSubcategory.value,
    description: description.value.trim(),
    turnstileToken: turnstileToken.value, // Token Turnstile
    location: {
      type: 'Point',
      coordinates: [
        props.location?.lng || 0,
        props.location?.lat || 0
      ]
    }
  }

  emit('submit', data)
}

function selectSubcategory(subId) {
  selectedSubcategory.value = subId
  errors.value.subcategory = ''
  // Memicu re-render Turnstile agar siap divalidasi
  setTimeout(renderTurnstile, 50)
}
</script>

<template>
  <dialog
    ref="dialogRef"
    @close="handleDialogClose"
    @click="handleBackdropClick"
    class="fixed inset-0 z-[2000] bg-transparent p-0 m-0 max-w-none max-h-none w-full h-full overflow-hidden outline-none"
  >
    <!-- Center wrapper -->
    <div class="flex items-center justify-center min-h-full p-4">
      <div
        class="w-full max-w-[480px] bg-gray-900/80 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 pt-6 pb-4">
          <div>
            <h2 class="text-lg font-bold text-white tracking-tight">Lapor Kejadian</h2>
            <p class="text-xs text-white/40 mt-0.5">Bantu jaga keamanan sekitarmu</p>
          </div>
          <button
            @click="emit('update:modelValue', false)"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="px-6 pb-6 space-y-5 max-h-[70vh] overflow-y-auto custom-scrollbar">
          <!-- Location display -->
          <div v-if="location" class="flex items-center gap-3 p-3 rounded-xl bg-white/[0.04] border border-white/[0.06]">
            <div class="w-9 h-9 rounded-lg bg-emerald-500/10 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <div>
              <p class="text-[11px] text-white/40 uppercase tracking-wider font-medium">Lokasi Kejadian</p>
              <p class="text-sm text-white/80 font-mono tabular-nums">
                {{ location.lat.toFixed(5) }}, {{ location.lng.toFixed(5) }}
              </p>
            </div>
          </div>

          <!-- Category selector (Dropdown style) -->
          <div>
            <label class="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
              Kategori
            </label>
            <div class="relative">
              <select
                v-model="selectedCategory"
                class="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3.5 text-sm text-white/80 focus:text-white focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/10 transition-all duration-200 cursor-pointer appearance-none"
              >
                <option value="" disabled selected class="bg-slate-900 text-white/30">Pilih Kategori...</option>
                <option
                  v-for="cat in categoryList"
                  :key="cat.id"
                  :value="cat.id"
                  class="bg-slate-900 text-white"
                >
                  {{ cat.icon }} &nbsp; {{ cat.label }}
                </option>
              </select>
              <!-- Custom dropdown chevron arrow icon -->
              <div class="absolute inset-y-0 right-4 flex items-center pointer-events-none text-white/40">
                <svg class="w-4.5 h-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
            <p v-if="errors.category" class="text-red-400 text-xs mt-1.5">{{ errors.category }}</p>
          </div>

          <!-- Subcategory chips -->
          <Transition name="slide-fade">
            <div v-if="currentCategory">
              <label class="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
                Sub-kategori
              </label>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="sub in subcategories"
                  :key="sub.id"
                  @click="selectSubcategory(sub.id)"
                  type="button"
                  class="px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border"
                  :style="
                    selectedSubcategory === sub.id
                      ? {
                          background: categoryColor + '20',
                          borderColor: categoryColor + '50',
                          color: categoryColor
                        }
                      : {}
                  "
                  :class="
                    selectedSubcategory === sub.id
                      ? ''
                      : 'bg-white/[0.04] border-white/[0.06] text-white/50 hover:bg-white/[0.08] hover:text-white/70'
                  "
                >
                  {{ sub.label }}
                </button>
              </div>
              <p v-if="errors.subcategory" class="text-red-400 text-xs mt-1.5">{{ errors.subcategory }}</p>
            </div>
          </Transition>

          <!-- Description -->
          <div>
            <label class="block text-xs font-medium text-white/50 mb-2 uppercase tracking-wider">
              Deskripsi
            </label>
            <div class="relative">
              <textarea
                v-model="description"
                maxlength="500"
                rows="4"
                placeholder="Ceritakan kejadian yang Anda alami atau saksikan..."
                class="w-full bg-white/[0.04] border border-white/[0.06] rounded-xl px-4 py-3 text-sm text-white placeholder-white/20 resize-none focus:outline-none focus:ring-2 focus:ring-white/10 focus:border-white/10 transition-all duration-200"
              ></textarea>
              <span
                class="absolute bottom-2.5 right-3 text-[10px] tabular-nums"
                :class="charCountColor"
              >
                {{ charCount }}/500
              </span>
            </div>
            <p v-if="errors.description" class="text-red-400 text-xs mt-1.5">{{ errors.description }}</p>
          </div>

          <!-- Cloudflare Turnstile Verification -->
          <div v-show="selectedSubcategory" class="flex flex-col items-center py-1">
            <div id="turnstile-container"></div>
            <p v-if="errors.turnstile" class="text-red-400 text-xs mt-1.5 text-center font-semibold">{{ errors.turnstile }}</p>
          </div>

          <!-- Submit -->
          <button
            @click="handleSubmit"
            :disabled="isSubmitting"
            type="button"
            class="w-full py-3.5 rounded-xl font-semibold text-sm text-white transition-all duration-300 relative overflow-hidden disabled:opacity-50 disabled:cursor-not-allowed"
            :style="{
              background: currentCategory
                ? `linear-gradient(135deg, ${categoryColor}, ${categoryColor}CC)`
                : 'linear-gradient(135deg, #374151, #1f2937)'
            }"
          >
            <span v-if="!isSubmitting" class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
              Kirim Laporan
            </span>
            <span v-else class="flex items-center justify-center gap-2">
              <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              Mengirim...
            </span>
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
dialog::backdrop {
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
}

dialog[open] {
  animation: dialogFadeIn 0.3s ease-out;
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}
.slide-fade-leave-active {
  transition: all 0.2s ease-in;
}
.slide-fade-enter-from {
  opacity: 0;
  transform: translateY(-8px);
}
.slide-fade-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
