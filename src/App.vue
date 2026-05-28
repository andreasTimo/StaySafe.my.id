<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue'
import MapView from './components/MapView.vue'
import ReportPanel from './components/ReportPanel.vue'
import ReportForm from './components/ReportForm.vue'
import MapLegend from './components/MapLegend.vue'
import { useMap } from './composables/useMap'
import { useReports } from './composables/useReports'
import MapSearch from './components/MapSearch.vue'

const { map, setReportMode, pendingLocation, updateLayers, recenterMap, locateUser, zoomIn, zoomOut } = useMap()
const { filteredReports, fetchReports, submitReport } = useReports()

// Responsive initial drawer state: closed on all viewports by default
const panelOpen = ref(false)
const windowWidth = ref(window.innerWidth)
const showHamburger = computed(() => !panelOpen.value || windowWidth.value < 1024)
const formOpen = ref(false)
const toastMessage = ref('')
const toastVisible = ref(false)
let toastTimer = null

const totalCount = computed(() => filteredReports.value.length)

// Toast notifications helper
function showToast(message, duration = 4000) {
  toastMessage.value = message
  toastVisible.value = true
  clearTimeout(toastTimer)
  toastTimer = setTimeout(() => {
    toastVisible.value = false
  }, duration)
}

// Enable report click-to-pin mode
function startReport() {
  setReportMode(true)
  showToast('📍 Ketuk lokasi kejadian di peta untuk meletakkan pin.')
}

// Watch for clicked map coordinates to trigger form modal
watch(pendingLocation, (loc) => {
  if (loc) {
    formOpen.value = true
  }
})

// Disable map pin mode when form closes
watch(formOpen, (open) => {
  if (!open) {
    setReportMode(false)
  }
})

// Submit new incident report
async function handleSubmit(data) {
  try {
    await submitReport(data)
    formOpen.value = false
    showToast('✅ Laporan Anda sukses terkirim!')
  } catch (err) {
    showToast('❌ Gagal mengirim laporan. Silakan coba kembali.')
  }
}

// Smooth pan map to a specific report
function handleFlyTo(report) {
  if (map.value && report.location) {
    const [lng, lat] = report.location.coordinates
    map.value.flyTo([lat, lng], 17, {
      duration: 1.5,
      easeLinearity: 0.25,
    })
  }
  // Only auto-close sidebar on mobile, keep open on desktop for continuous logs browsing
  if (window.innerWidth < 1024) {
    panelOpen.value = false
  }
}

let pollingInterval = null

onMounted(async () => {
  await fetchReports()
  // Locate the user immediately on startup to draw the pulsing blue dot indicator
  locateUser(false)
  
  // Track window resizing for HMR/responsive safety
  window.addEventListener('resize', () => {
    windowWidth.value = window.innerWidth
  })

  // Sinkronisasi data real-time: polling periodik setiap 10 detik
  pollingInterval = setInterval(async () => {
    try {
      await fetchReports()
    } catch (err) {
      console.warn('[StaySafe Sync] Gagal menyelaraskan data periodik:', err)
    }
  }, 10000)
})

onUnmounted(() => {
  if (pollingInterval) {
    clearInterval(pollingInterval)
  }
})

// Watch map initialization to draw pulsing blue dot user location as soon as map finishes mounting
watch(map, (newMap) => {
  if (newMap) {
    locateUser(false)
  }
})
</script>

<template>
  <div id="app-root" class="relative w-screen h-[100dvh] overflow-hidden bg-slate-950 font-sans">
    
    <!-- Fullscreen Leaflet Map -->
    <MapView />

    <!-- Google Maps Style Search & Hamburger Navigation Box (PC & HP Unified) (Moved outside to break stacking context) -->
    <div class="absolute top-4 left-4 z-[1100] w-[calc(100vw-32px)] md:w-[328px] pointer-events-auto">
      <MapSearch :is-menu-open="panelOpen" @toggle-menu="panelOpen = !panelOpen" />
    </div>

    <!-- Floating Map Controls & Overlays -->
    <div class="absolute inset-0 pointer-events-none z-[1000]">
      
      <!-- Center-Bottom: Circular Red Pulsing "LAPOR" Button -->
      <div class="pointer-events-auto fixed bottom-[calc(3rem+env(safe-area-inset-bottom))] lg:bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1.5">
        <button
          @click="startReport"
          class="relative w-15 h-15 rounded-full bg-gradient-to-br from-red-500 to-rose-600 text-white shadow-xl shadow-red-500/40 hover:shadow-red-500/60 hover:scale-105 active:scale-95 transition-all duration-200 flex items-center justify-center group cursor-pointer"
          title="Lapor Kejahatan"
        >
          <!-- Expanding pulsing border ring -->
          <span class="absolute inset-0 rounded-full bg-red-500/45 animate-pulse-ring"></span>
          
          <!-- Cross plus icon -->
          <svg class="w-6 h-6 relative z-10 group-hover:rotate-90 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
        </button>
        <span class="text-[10px] font-bold text-white/50 uppercase tracking-[0.2em] shadow-sm select-none">Lapor</span>
      </div>

      <!-- Bottom-Right: Google Maps Style Controls Stack (Recenter + Zoom +/-) -->
      <div class="pointer-events-auto fixed bottom-[calc(3rem+env(safe-area-inset-bottom))] lg:bottom-8 right-4 flex flex-col gap-2.5 items-center z-[1100]">
        
        <!-- Recenter Button (Premium Dark Glassmorphism) -->
        <button
          id="btn-my-location"
          @click="recenterMap"
          class="w-10 h-10 rounded-xl bg-slate-900/90 backdrop-blur-xl border border-white/10 text-emerald-400 shadow-2xl flex items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 group hover:bg-white/10 hover:text-white"
          title="Lokasi Saya Saat Ini"
        >
          <i class="fa-solid fa-location-crosshairs text-base group-hover:scale-110 transition-transform duration-200"></i>
        </button>

        <!-- Vertical Zoom Capsule (Premium Dark Glassmorphism) -->
        <div class="flex flex-col rounded-xl bg-slate-900/90 backdrop-blur-xl border border-white/10 overflow-hidden w-10 shadow-2xl">
          <!-- Zoom In -->
          <button
            @click="zoomIn"
            class="h-10 w-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 border-b border-white/10 transition-colors duration-150 cursor-pointer active:scale-95"
            title="Perbesar"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
          </button>
          
          <!-- Zoom Out -->
          <button
            @click="zoomOut"
            class="h-10 w-10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-150 cursor-pointer active:scale-95"
            title="Perkecil"
          >
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2.5">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 12h-15" />
            </svg>
          </button>
        </div>

      </div>

      <!-- Bottom-Left: Interactive Collapsible Map Legend (Dynamic Sliding Offset) -->
      <MapLegend
        :reports="filteredReports"
        class="fixed bottom-[calc(2.5rem+env(safe-area-inset-bottom))] lg:bottom-6 z-[1000] transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)]"
        :class="panelOpen ? 'left-4 md:left-[376px]' : 'left-4'"
      />
    </div>

    <!-- Unified Left Sidebar Panel -->
    <ReportPanel
      :is-open="panelOpen"
      @close="panelOpen = false"
      @select-report="handleFlyTo"
    />

    <!-- Incident Creation Form Modal -->
    <ReportForm
      v-model="formOpen"
      :location="pendingLocation"
      @submit="handleSubmit"
    />

    <!-- Global Toast Alert Box -->
    <Transition name="toast">
      <div
        v-if="toastVisible"
        class="fixed bottom-[calc(8.5rem+env(safe-area-inset-bottom))] lg:bottom-28 left-1/2 -translate-x-1/2 z-[3000] bg-slate-900/85 backdrop-blur-xl border border-white/10 rounded-xl px-5 py-3.5 text-xs font-semibold text-white/90 shadow-2xl max-w-[90vw] text-center"
      >
        {{ toastMessage }}
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.toast-enter-active {
  animation: toastIn 0.3s ease-out;
}
.toast-leave-active {
  animation: toastIn 0.3s ease-in reverse;
}
@keyframes toastIn {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(16px);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(0);
  }
}

.fade-btn-enter-active,
.fade-btn-leave-active {
  transition: opacity 0.25s ease, transform 0.25s ease;
}
.fade-btn-enter-from,
.fade-btn-leave-to {
  opacity: 0;
  transform: scale(0.9);
}
</style>
