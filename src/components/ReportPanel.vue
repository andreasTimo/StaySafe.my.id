<script setup>
import { ref } from 'vue'
import { CATEGORIES, getCategoryById, getSubcategoryLabel } from '../config/categories.js'
import { useReports } from '../composables/useReports.js'
import { useMap } from '../composables/useMap.js'

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['close', 'select-report'])

// Destructure filteredReports and recentReports to prevent undefined crash on Laporan Terbaru tab
const { activeFilters, toggleFilter, filteredReports, recentReports } = useReports()
const { visualMode, setVisualMode } = useMap()

const activeTab = ref('filter') // 'filter' or 'recent'

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

  <!-- Left Sidebar Panel Drawer -->
  <div
    class="fixed top-0 left-0 h-full w-[360px] max-w-[calc(100vw-16px)] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
    :class="[isOpen ? 'translate-x-0' : '-translate-x-full', 'z-[1200] md:z-[1050]']"
    @click.stop
    @mousedown.stop
    @mouseup.stop
    @touchstart.stop
    @touchmove.stop
    @wheel.stop
  >
    <div class="h-full bg-slate-950/80 backdrop-blur-2xl border-r border-white/10 shadow-2xl flex flex-col pt-0 md:pt-[110px]">
      
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
          class="w-8 h-8 flex items-center justify-center rounded-lg text-white/45 hover:text-white hover:bg-white/10 border border-white/5 hover:border-white/15 transition-all duration-200 cursor-pointer md:hidden"
          title="Tutup Menu"
        >
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      <!-- Custom Styled Tab Switcher (Legenda, Laporan, Dukung) -->
      <div class="flex px-2 pt-3 pb-1 border-b border-white/5 flex-shrink-0 gap-1 bg-white/[0.01]">
        <!-- TAB 1: LEGENDA -->
        <button
          @click="activeTab = 'filter'"
          class="flex-1 py-2 px-1 text-[10.5px] font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer"
          :class="activeTab === 'filter' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner' 
            : 'text-white/45 hover:text-white/80 hover:bg-white/5 border border-transparent'"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Legenda
        </button>

        <!-- TAB 2: LAPORAN TERBARU -->
        <button
          @click="activeTab = 'recent'"
          class="flex-1 py-2 px-1 text-[10.5px] font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer"
          :class="activeTab === 'recent' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner' 
            : 'text-white/45 hover:text-white/80 hover:bg-white/5 border border-transparent'"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Laporan
        </button>

        <!-- TAB 3: DUKUNG SAYA -->
        <button
          @click="activeTab = 'support'"
          class="flex-1 py-2 px-1 text-[10.5px] font-bold rounded-lg transition-all duration-200 flex items-center justify-center gap-1 cursor-pointer"
          :class="activeTab === 'support' 
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-inner' 
            : 'text-white/45 hover:text-white/80 hover:bg-white/5 border border-transparent'"
        >
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          Dukung saya
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
                    class="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    :style="{ background: cat.color.DEFAULT }"
                  ></div>
                  <span class="text-sm leading-none">{{ cat.icon }}</span>
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
            <p class="text-[10px] text-white/30 mt-2.5 leading-relaxed pl-1">
              * Mode <strong>Otomatis</strong> akan menyesuaikan tampilan heatmap atau marker secara dinamis saat Anda memperbesar/memperkecil peta.
            </p>
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
                <div class="flex items-center gap-1.5 mb-1">
                  <span class="text-xs leading-none">{{ getCategoryMeta(report.category).icon }}</span>
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
                <div v-if="report.address || report.location" class="flex items-start gap-1 text-[11px] text-white font-bold leading-normal mt-1 border-t border-white/5 pt-1.5">
                  <span class="text-white/70">📍</span>
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
