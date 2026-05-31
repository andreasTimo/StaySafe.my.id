<script setup>
import { ref, watch, nextTick, onBeforeUnmount } from 'vue'
import { CATEGORIES, getCategoryById, getSubcategoryLabel } from '../config/categories.js'
import { useReports } from '../composables/useReports.js'
import { useMap } from '../composables/useMap.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'select-report', 'start-tour', 'open-policy'])

// Destructure filteredReports and recentReports to prevent undefined crash on Laporan Terbaru tab
const { activeFilters, toggleFilter, filteredReports, recentReports } = useReports()
const { visualMode, setVisualMode } = useMap()

const activeTab = ref('filter') // 'filter', 'recent', 'support', 'feedback'

// Feedback & Saran States
const feedbackType = ref('') // '', 'saran', 'bug', 'apresiasi', 'lainnya'
const feedbackEmail = ref('')
const feedbackMessage = ref('')
const feedbackSending = ref(false)
const feedbackSuccess = ref(false)
const feedbackError = ref('')

const feedbackTurnstileToken = ref('')
const feedbackTurnstileWidgetId = ref(null)
const siteKey = import.meta.env.VITE_TURNSTILE_SITEKEY || '1x00000000000000000000AA' // Fallback testing key

function resetFeedbackTurnstile() {
  feedbackTurnstileToken.value = ''
  if (window.turnstile && feedbackTurnstileWidgetId.value !== null) {
    try {
      window.turnstile.reset(feedbackTurnstileWidgetId.value)
    } catch (e) {
      feedbackTurnstileWidgetId.value = null
    }
  }
}

function removeFeedbackTurnstile() {
  feedbackTurnstileToken.value = ''
  if (window.turnstile && feedbackTurnstileWidgetId.value !== null) {
    try {
      if (typeof window.turnstile.remove === 'function') {
        window.turnstile.remove(feedbackTurnstileWidgetId.value)
      } else {
        window.turnstile.reset(feedbackTurnstileWidgetId.value)
      }
    } catch (e) {}
  }
  feedbackTurnstileWidgetId.value = null
}

function renderFeedbackTurnstile() {
  if (window.turnstile && document.getElementById('feedback-turnstile-container')) {
    try {
      if (feedbackTurnstileWidgetId.value !== null) {
        window.turnstile.reset(feedbackTurnstileWidgetId.value)
        return
      }
      
      feedbackTurnstileWidgetId.value = window.turnstile.render('#feedback-turnstile-container', {
        sitekey: siteKey,
        theme: 'dark',
        callback: (token) => {
          feedbackTurnstileToken.value = token
          feedbackError.value = ''
        },
        'expired-callback': () => {
          feedbackTurnstileToken.value = ''
        },
        'error-callback': () => {
          feedbackTurnstileToken.value = ''
        }
      })
    } catch (err) {
      console.warn('[StaySafe Turnstile] Gagal me-render widget Turnstile feedback:', err)
    }
  }
}

// Watch feedbackType to load Turnstile when type is selected
watch(feedbackType, async (newType) => {
  if (newType) {
    await nextTick()
    setTimeout(renderFeedbackTurnstile, 50)
  } else {
    removeFeedbackTurnstile()
  }
})

// Watch activeTab to load/reset Turnstile
watch(activeTab, (newTab) => {
  if (newTab !== 'feedback') {
    feedbackType.value = ''
    removeFeedbackTurnstile()
  }
})

// Watch isOpen to load/reset Turnstile
watch(() => props.isOpen, (open) => {
  if (!open) {
    feedbackType.value = ''
    removeFeedbackTurnstile()
  }
})

async function submitFeedback() {
  if (!feedbackType.value) {
    feedbackError.value = 'Silakan pilih tipe masukan terlebih dahulu.'
    return
  }
  if (!feedbackMessage.value || feedbackMessage.value.trim().length === 0) {
    feedbackError.value = 'Pesan masukan tidak boleh kosong.'
    return
  }

  const API_BASE = import.meta.env.VITE_API_BASE_URL
  if (API_BASE && !feedbackTurnstileToken.value) {
    feedbackError.value = 'Harap selesaikan tantangan verifikasi Turnstile.'
    return
  }

  feedbackSending.value = true
  feedbackError.value = ''

  try {
    const payload = {
      type: feedbackType.value,
      email: feedbackEmail.value || '',
      message: feedbackMessage.value,
      turnstileToken: feedbackTurnstileToken.value
    }

    if (API_BASE) {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}))
        throw new Error(errData.error || 'Gagal mengirim saran.')
      }
    } else {
      // Simulasi delay lokal jika offline/dev
      await new Promise(resolve => setTimeout(resolve, 800))
    }

    // Ubah status sukses
    feedbackSuccess.value = true
    feedbackEmail.value = ''
    feedbackMessage.value = ''
    feedbackType.value = ''
    removeFeedbackTurnstile()
  } catch (err) {
    console.error('[Feedback] Gagal mengirim:', err)
    feedbackError.value = err.message || 'Gagal mengirim saran. Coba beberapa saat lagi.'
    resetFeedbackTurnstile()
  } finally {
    feedbackSending.value = false
  }
}

function resetFeedbackForm() {
  feedbackSuccess.value = false
  feedbackError.value = ''
  feedbackType.value = ''
  removeFeedbackTurnstile()
}

onBeforeUnmount(removeFeedbackTurnstile)

function getCategoryMeta(categoryId) {
  return getCategoryById(categoryId) || Object.values(CATEGORIES)[0]
}

function getSubLabel(categoryId, subcategoryId) {
  return getSubcategoryLabel(categoryId, subcategoryId)
}

function relativeTime(date) {
  const now = Date.now()
  const then = date instanceof Date ? date.getTime() : new Date(date).getTime()
  const diffMs = now - then

  const seconds = Math.floor(diffMs / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit lalu`
  if (hours < 24) return `${hours} jam lalu`
  if (days < 7) return `${days} hari lalu`
  if (days < 30) return `${Math.floor(days / 7)} minggu lalu`
  return `${Math.floor(days / 30)} bulan lalu`
}

function handleSelect(report) {
  emit('select-report', report)
}
</script>

<template>
  <!-- Backdrop for mobile viewport -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/60 z-[1100] lg:hidden"
      @click="emit('close')"
    ></div>
  </Transition>

  <div
    id="report-panel"
    class="fixed top-0 left-0 bottom-0 w-[360px] max-w-[calc(100vw-16px)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
    :class="[isOpen ? 'translate-x-0' : '-translate-x-full', 'z-[1200] lg:z-[1050]']"
    @click.stop
    @mousedown.stop
    @mouseup.stop
    @touchstart.stop
    @touchmove.stop
    @wheel.stop
  >
    <div class="h-full bg-slate-950/80 backdrop-blur-2xl border-r border-white/10 shadow-2xl flex flex-col pt-0 lg:pt-[110px]">
      
      <!-- Top Title Bar -->
      <div class="flex items-center justify-between px-5 py-5 border-b border-white/10 flex-shrink-0">
        <div class="flex items-center gap-3">
          <div class="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <div class="flex items-baseline">
              <span class="text-white font-bold text-base tracking-tight">StaySafe</span>
              <span class="text-emerald-400 font-semibold text-base">.my.id</span>
            </div>
            <p class="text-[10px] text-white/40 -mt-0.5 tracking-wide font-medium">Peta Pemantauan Kerawanan</p>
          </div>
        </div>

        <!-- Global Close button (X) — Always Visible on Mobile for outstanding UX, hidden on Desktop -->
        <button
          @click="emit('close')"
          class="w-8 h-8 flex items-center justify-center rounded-lg text-white/45 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all duration-200 cursor-pointer lg:hidden"
          title="Tutup Menu"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Custom Styled Tab Switcher (Legenda, Laporan, Dukung, Saran) -->
      <div id="sidebar-tabs" class="flex px-2 pt-3 pb-1 border-b border-white/5 flex-shrink-0 gap-1 bg-white/[0.01]">
        <!-- TAB 1: LEGENDA -->
        <button
          @click="activeTab = 'filter'"
          class="flex-1 py-2 px-0.5 text-[9.5px] font-bold rounded-lg transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer"
          :class="activeTab === 'filter' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner' 
            : 'text-white/45 hover:text-white/80 hover:bg-white/5 border border-transparent'"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          <span>Legenda</span>
        </button>

        <!-- TAB 2: LAPORAN TERBARU -->
        <button
          @click="activeTab = 'recent'"
          class="flex-1 py-2 px-0.5 text-[9.5px] font-bold rounded-lg transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer"
          :class="activeTab === 'recent' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner' 
            : 'text-white/45 hover:text-white/80 hover:bg-white/5 border border-transparent'"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span>Laporan</span>
        </button>

        <!-- TAB 3: DUKUNG SAYA -->
        <button
          @click="activeTab = 'support'"
          class="flex-1 py-2 px-0.5 text-[9.5px] font-bold rounded-lg transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer"
          :class="activeTab === 'support' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner' 
            : 'text-white/45 hover:text-white/80 hover:bg-white/5 border border-transparent'"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>Dukung</span>
        </button>

        <!-- TAB 4: SARAN & FEEDBACK -->
        <button
          @click="activeTab = 'feedback'"
          class="flex-1 py-2 px-0.5 text-[9.5px] font-bold rounded-lg transition-all duration-200 flex flex-col sm:flex-row items-center justify-center gap-1 cursor-pointer"
          :class="activeTab === 'feedback' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner' 
            : 'text-white/45 hover:text-white/80 hover:bg-white/5 border border-transparent'"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span>Saran</span>
        </button>
      </div>

      <!-- Tab Content Area -->
      <div class="flex-1 overflow-y-auto custom-scrollbar p-5">
        
        <!-- ── TAB 1: LEGENDA & FILTERS ─────────────────────────────────── -->
        <div v-if="activeTab === 'filter'" class="space-y-6 animate-fadeIn">
          
          <!-- Category Explanation List -->
          <div>
            <h3 class="text-xs font-bold text-white/40 uppercase tracking-widest mb-4">Informasi Jenis Kerawanan:</h3>
            <div class="space-y-4">
              <div
                v-for="cat in CATEGORIES"
                :key="cat.id"
                class="rounded-2xl p-4 bg-white/[0.02] border border-white/5 shadow-sm space-y-3"
              >
                <!-- Category Title with Dot and Emoji -->
                <div class="flex items-center gap-2.5">
                  <div
                    class="w-1.5 h-1.5 rounded-full flex-shrink-0"
                    :style="{ background: cat.color.DEFAULT }"
                  ></div>
                  <i :class="[cat.icon, 'text-[11px]']" :style="{ color: cat.color.DEFAULT }"></i>
                  <h4 class="text-xs font-bold text-white/95 leading-tight tracking-wide">
                    {{ cat.label }}
                  </h4>
                </div>

                <!-- Subcategories as beautifully styled pills -->
                <div class="flex flex-wrap gap-1.5 pt-0.5">
                  <span
                    v-for="sub in cat.subcategories"
                    :key="sub.id"
                    class="px-2.5 py-1 rounded-full text-[10px] font-bold border transition-all duration-300 select-none tracking-wide"
                    :style="{
                      background: cat.color.DEFAULT + '0E',
                      borderColor: cat.color.DEFAULT + '20',
                      color: cat.color.DEFAULT
                    }"
                  >
                    {{ sub.label }}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <hr class="border-white/5" />

          <!-- Map Visualization Modes (AwasBegal Style) -->
          <div>
            <h3 class="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Tampilan Visual Peta:</h3>
            <div class="bg-slate-900/60 border border-white/5 p-1 rounded-xl flex gap-1">
              <button
                @click="setVisualMode('auto')"
                class="flex-1 py-2 px-1 text-[11px] font-semibold rounded-lg transition-all duration-200 text-center cursor-pointer"
                :class="visualMode === 'auto'
                  ? 'bg-white/10 text-white shadow'
                  : 'text-white/45 hover:text-white/80'"
              >
                Otomatis
              </button>
              <button
                @click="setVisualMode('heatmap')"
                class="flex-1 py-2 px-1 text-[11px] font-semibold rounded-lg transition-all duration-200 text-center cursor-pointer"
                :class="visualMode === 'heatmap'
                  ? 'bg-white/10 text-white shadow'
                  : 'text-white/45 hover:text-white/80'"
              >
                Heatmap
              </button>
              <button
                @click="setVisualMode('markers')"
                class="flex-1 py-2 px-1 text-[11px] font-semibold rounded-lg transition-all duration-200 text-center cursor-pointer"
                :class="visualMode === 'markers'
                  ? 'bg-white/10 text-white shadow'
                  : 'text-white/45 hover:text-white/80'"
              >
                Titik Lokasi
              </button>
            </div>
            <p class="text-[10px] text-white/30 mt-2.5 leading-relaxed pl-1 mb-4">
              * Mode <strong>Otomatis</strong> akan menyesuaikan tampilan heatmap atau marker secara dinamis saat Anda memperbesar/memperkecil peta.
            </p>
          </div>

          <!-- Panduan Pengguna (Onboarding Tour Trigger) -->
          <div class="border-t border-white/5 pt-4">
            <h3 class="text-xs font-bold text-white/40 uppercase tracking-widest mb-3">Panduan Pengguna:</h3>
            <button
              @click="emit('start-tour')"
              class="w-full py-2.5 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/15 text-xs text-white/90 font-bold transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer select-none"
            >
              <i class="fa-solid fa-compass text-emerald-400"></i> Mulai Tur Panduan
            </button>
          </div>

        </div>

        <!-- ── TAB 2: RECENT LOGS ──────────────────────────────────────── -->
        <div v-else-if="activeTab === 'recent'" class="space-y-3 animate-fadeIn">
          <!-- Loop over recentReports (sorted, filtered list) to prevent crashes -->
          <template v-if="recentReports.length">
            <button
              v-for="report in recentReports"
              :key="report.id"
              @click="handleSelect(report)"
              class="w-full text-left relative rounded-xl p-4 bg-white/[0.02] hover:bg-white/[0.06] border border-white/5 hover:border-white/10 transition-all duration-200 cursor-pointer block group shadow-sm"
            >
              <!-- Colored Left Border indicator -->
              <div
                class="absolute left-0 top-3.5 bottom-3.5 w-[3.5px] rounded-full"
                :style="{ background: getCategoryMeta(report.category).color.DEFAULT }"
              ></div>

              <div class="pl-2">
                <!-- Subcategory & Emoji icon -->
                <div class="flex items-center gap-2 mb-1">
                  <i :class="[getCategoryMeta(report.category).icon, 'text-[11px]']" :style="{ color: getCategoryMeta(report.category).color.DEFAULT }"></i>
                  <h3 class="text-[13px] font-bold text-white/90 group-hover:text-white leading-tight">
                    {{ getSubLabel(report.category, report.subcategory) }}
                  </h3>
                </div>

                <!-- Short description -->
                <p class="text-[11.5px] text-white/50 group-hover:text-white/70 line-clamp-2 leading-relaxed mb-2">
                  {{ report.description }}
                </p>

                <!-- Relative Time Row -->
                <div class="flex items-center text-[9.5px] text-white/40 pl-0.5 mb-1.5">
                  <span class="flex items-center gap-1">
                    <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {{ relativeTime(report.createdAt) }}
                  </span>
                </div>

                <!-- Full Address (Mencolok, White, Bold) on a separate row -->
                <div v-if="report.address || report.location" class="flex items-start gap-1.5 text-[11px] text-white font-bold leading-normal mt-1 border-t border-white/5 pt-1.5">
                  <i class="fa-solid fa-location-dot text-emerald-400 text-[10px] mt-0.5"></i>
                  <span class="text-white tracking-wide">{{ report.address || `${report.location.coordinates[1].toFixed(4)}, ${report.location.coordinates[0].toFixed(4)}` }}</span>
                </div>
              </div>
            </button>
          </template>

          <div v-else class="flex flex-col items-center justify-center text-center py-20">
            <div class="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center mb-4">
              <svg class="w-6 h-6 text-white/25" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <p class="text-white/35 text-xs font-semibold">Belum Ada Laporan Aktif</p>
            <p class="text-white/20 text-[10px] mt-1 px-4 leading-relaxed">Ketuk tombol merah Lapor di bawah untuk meletakkan titik laporan di peta.</p>
          </div>
        </div>

        <!-- ── TAB 3: DUKUNG SAYA ──────────────────────────────────────── -->
        <div v-else-if="activeTab === 'support'" class="space-y-5 animate-fadeIn text-center py-2 px-1">
          <div class="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-rose-500/5">
            <svg class="w-8 h-8 text-rose-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
              <path stroke-linecap="round" stroke-linejoin="round" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>

          <div>
            <h3 class="text-sm font-bold text-white tracking-wide">Dukung Kelangsungan Server</h3>
            <p class="text-xs text-white/50 mt-2 leading-relaxed px-2">
              StaySafe.my.id adalah aplikasi independen non-profit yang dibuat demi membantu masyarakat memantau dan menghindari titik kerawanan di jalanan.
            </p>
            <p class="text-[11px] text-white/40 mt-1 leading-relaxed px-2">
              Dukungan Anda sangat berarti untuk membantu kami membayar biaya sewa server peta & database agar tetap aktif dan bebas iklan.
            </p>
          </div>

          <div class="pt-2">
            <!-- Premium Animated Ko-fi Button -->
            <a
              href="https://ko-fi.com/B0B01TXCEA"
              target="_blank"
              class="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-[#72a4f2] text-white font-extrabold text-xs shadow-lg shadow-blue-500/20 hover:bg-[#5b8ddb] hover:shadow-blue-500/35 active:scale-98 transition-all duration-300 w-full justify-center group cursor-pointer"
            >
              <!-- Ko-fi Tea/Coffee Cup icon in SVG -->
              <svg class="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.881 8.948c-.773-4.085-4.859-4.593-4.859-4.593H.723c-.604 0-.679.798-.679.798s-.082 7.324-.022 11.822c.164 12.424 10.516 12.13 10.516 12.13s9.883.235 10.424-9.351c.083-1.467.038-2.61.038-2.61s3.6-.33 3.659-3.929c.045-2.738-.798-4.267-.798-4.267zm-3.251 4.141c-.171 2.338-2.186 2.384-2.186 2.384h-1.385s.08-3.056.026-5.505c-.027-1.222-.053-2.228-.053-2.228h1.462s1.538-.024 1.95 1.36c.325 1.096.357 2.378.186 3.989z" />
              </svg>
              Support me on Ko-fi
            </a>
          </div>

          <div class="border-t border-white/5 pt-4">
            <p class="text-[10px] text-white/30 uppercase tracking-widest font-bold mb-3">Dukungan Cepat (Embed Widget)</p>
            <div class="rounded-xl overflow-hidden border border-white/10 bg-slate-950/60 shadow-inner h-[380px]">
              <iframe
                src="https://ko-fi.com/B0B01TXCEA/?hidefeed=true&widget=true&embed=true"
                style="width: 100%; height: 100%; border: none; background: #020617;"
                title="Dukungan Ko-fi StaySafe"
              ></iframe>
            </div>
          </div>
        </div>

        <!-- ── TAB 4: FEEDBACK & SARAN ───────────────────────────────────── -->
        <div v-else-if="activeTab === 'feedback'" class="space-y-5 animate-fadeIn">
          <!-- Success State -->
          <div v-if="feedbackSuccess" class="text-center py-8 px-4 space-y-4">
            <div class="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto text-emerald-400 shadow-lg shadow-emerald-500/5 animate-pulse">
              <svg class="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </div>
            <div class="space-y-2">
              <h3 class="text-sm font-bold text-white">Saran Berhasil Dikirim!</h3>
              <p class="text-xs text-white/50 leading-relaxed">
                Terima kasih atas masukan Anda. Kami sangat menghargai kontribusi Anda untuk membantu StaySafe.my.id menjadi lebih baik dan bermanfaat bagi masyarakat luas.
              </p>
            </div>
            <button
              @click="resetFeedbackForm"
              class="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/15 text-xs text-white/70 font-bold transition-all duration-200 cursor-pointer"
            >
              Kirim Masukan Lain
            </button>
          </div>

          <!-- Form State -->
          <div v-else class="space-y-4">
            <div class="space-y-1">
              <h3 class="text-sm font-bold text-white">Feedback & Saran</h3>
              <p class="text-[11px] text-white/40 leading-relaxed">
                Punya ide fitur baru, menemukan bug, atau ingin memberikan apresiasi? Berikan masukan Anda secara langsung di bawah ini.
              </p>
            </div>

            <form @submit.prevent="submitFeedback" class="space-y-4">
              <!-- Error Alert -->
              <div v-if="feedbackError" class="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                {{ feedbackError }}
              </div>

              <!-- Feedback Type -->
              <div class="space-y-1.5">
                <label class="text-[10px] uppercase tracking-wider font-bold text-white/35">Tipe Masukan</label>
                <div class="grid grid-cols-2 gap-2">
                  <button
                    v-for="t in [
                      { id: 'saran', label: 'Saran Fitur', icon: 'fa-solid fa-lightbulb text-yellow-400' },
                      { id: 'bug', label: 'Laporan Bug', icon: 'fa-solid fa-bug text-rose-500' },
                      { id: 'apresiasi', label: 'Apresiasi', icon: 'fa-solid fa-thumbs-up text-sky-400' },
                      { id: 'lainnya', label: 'Lainnya', icon: 'fa-solid fa-circle-question text-slate-400' }
                    ]"
                    :key="t.id"
                    type="button"
                    @click="feedbackType = t.id"
                    class="h-8.5 rounded-xl border text-[10px] font-bold transition-all duration-150 flex items-center justify-center gap-1.5 cursor-pointer select-none"
                    :class="feedbackType === t.id
                      ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-extrabold shadow-sm'
                      : 'bg-white/[0.01] border-white/5 text-white/50 hover:text-white/80 hover:bg-white/5'"
                  >
                    <i :class="t.icon"></i>
                    <span>{{ t.label }}</span>
                  </button>
                </div>
              </div>

              <!-- Email (Optional) -->
              <div class="space-y-1.5">
                <label for="feedback_email" class="text-[10px] uppercase tracking-wider font-bold text-white/35 flex justify-between">
                  <span>Email Anda</span>
                  <span class="text-white/20 capitalize font-medium">Opsional</span>
                </label>
                <input
                  id="feedback_email"
                  v-model="feedbackEmail"
                  type="email"
                  placeholder="nama@email.com (jika ingin dibalas)"
                  class="w-full h-10 px-3 rounded-xl bg-slate-950/60 border border-white/10 focus:border-emerald-500/30 focus:outline-none text-xs text-white placeholder-white/20 transition-all font-semibold"
                />
              </div>

              <!-- Message -->
              <div class="space-y-1.5">
                <label for="feedback_msg" class="text-[10px] uppercase tracking-wider font-bold text-white/35 flex justify-between">
                  <span>Pesan Masukan</span>
                  <span :class="feedbackMessage.length > 1000 ? 'text-rose-400' : 'text-white/20'">{{ feedbackMessage.length }}/1000</span>
                </label>
                <textarea
                  id="feedback_msg"
                  v-model="feedbackMessage"
                  rows="5"
                  maxlength="1000"
                  placeholder="Ceritakan ide, keluhan, atau apresiasi Anda kepada pengembang StaySafe..."
                  class="w-full p-3 rounded-xl bg-slate-950/60 border border-white/10 focus:border-emerald-500/30 focus:outline-none text-xs text-white placeholder-white/20 transition-all resize-none font-semibold leading-relaxed"
                ></textarea>
              </div>

              <!-- Cloudflare Turnstile Verification -->
              <div v-show="feedbackType" class="flex flex-col items-center py-1">
                <div id="feedback-turnstile-container"></div>
              </div>

              <!-- Submit Button -->
              <button
                type="submit"
                :disabled="feedbackSending"
                class="w-full h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-98 transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed select-none"
              >
                <svg v-if="feedbackSending" class="animate-spin h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span v-else><i class="fa-solid fa-paper-plane mr-1"></i> Kirim Masukan</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Persistent Sidebar Footer for Privacy & Terms (Google Maps Responsive Style) -->
      <div class="px-5 py-4 border-t border-white/[0.06] flex items-center justify-between text-[10px] text-white/30 flex-shrink-0 bg-slate-950/40 select-none">
        <span class="font-medium">© 2026 StaySafe.my.id</span>
        <div class="flex gap-2.5 items-center">
          <button
            @click="emit('open-policy', 'privacy')"
            class="hover:text-emerald-400 active:scale-95 transition-all duration-150 cursor-pointer font-bold uppercase tracking-wider"
          >
            Privasi
          </button>
          <span>•</span>
          <button
            @click="emit('open-policy', 'terms')"
            class="hover:text-emerald-400 active:scale-95 transition-all duration-150 cursor-pointer font-bold uppercase tracking-wider"
          >
            Ketentuan
          </button>
        </div>
      </div>

    </div>
  </div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fadeIn {
  animation: fadeIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}
</style>
