<script setup>
import { ref, computed, onMounted, onUnmounted, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue', 'complete', 'step-change'])

const currentStep = ref(0)
const targetRect = ref(null)
const windowWidth = ref(window.innerWidth)
const windowHeight = ref(window.innerHeight)

// Steps Configuration
const steps = [
  {
    title: 'Selamat Datang di StaySafe! 👋',
    desc: 'StaySafe.my.id adalah platform pemantauan keamanan jalan raya secara real-time. Mari ikuti tur panduan singkat ini selama 1 menit untuk mempelajari cara memantau & melaporkan titik kerawanan di sekitar Anda.',
    target: null
  },
  {
    title: '🌐 Cari & Filter Wilayah',
    desc: 'Gunakan kotak pencarian ini untuk mencari nama jalan, tempat, atau jenis kriminalitas secara instan. Anda juga dapat beralih kluster regional (seperti Bandung, Surabaya, dll.) lewat tombol selector regional hijau di pojok kiri.',
    target: '#map-search-container'
  },
  {
    title: '📋 4 Fitur Utama Sidebar',
    desc: 'Di menu sidebar ini terdapat 4 tab fitur penting yang dapat Anda akses:\n\n' +
          '1. 🗺️ Legenda: Memantau sebaran kerawanan & menyaring visualisasi peta (titik vs heatmap).\n' +
          '2. 📑 Laporan: Meninjau log laporan kejahatan jalanan terbaru yang dikirim oleh warga.\n' +
          '3. 💖 Dukung: Membantu kelangsungan biaya sewa server & database secara sukarela.\n' +
          '4. 💡 Saran: Tempat mengirim ide fitur baru atau laporan bug langsung ke pengembang.',
    target: '#sidebar-tabs'
  },
  {
    title: '📍 Laporkan Kejadian',
    desc: 'Melihat atau menjadi korban kejahatan jalanan? Laporkan secara anonim demi menjaga keselamatan warga lain! Cukup klik tombol merah besar ini, lalu ketuk lokasi kejadian di peta untuk meletakkan pin & mengisi formulir laporan.',
    target: '#btn-lapor'
  },
  {
    title: '🧭 Navigasi & GPS Lokasi',
    desc: 'Gunakan tombol GPS crosshair ini untuk mensejajarkan dan memusatkan peta kembali ke posisi Anda saat ini. Di bawahnya terdapat tombol zoom (+ / -) untuk memperbesar atau memperkecil visualisasi daerah rawan.',
    target: '#map-controls-container'
  },
  {
    title: '📊 Legenda Kerawanan Peta',
    desc: 'Tingkat kerawanan jalan dihitung otomatis berdasarkan intensitas kejahatan terbaru di daerah tersebut. Di sini Anda dapat memantau kode warna tingkat kerawanan dan menyembunyikannya agar pandangan peta lebih luas.',
    target: '#map-legend'
  },
  {
    title: '🎉 Anda Siap Menjelajah!',
    desc: 'Luar biasa, Anda telah menguasai seluruh fitur utama! Selalu pantau kondisi jalan raya sebelum bepergian, tetap waspada, dan mari bersama-sama berkontribusi menciptakan lingkungan jalan raya yang lebih aman.',
    target: null
  }
]

// Re-calculate target element boundaries
let trackingInterval = null

// Re-calculate target element boundaries
function updateTargetRect() {
  if (!props.modelValue) return

  const step = steps[currentStep.value]
  if (!step || !step.target) {
    targetRect.value = null
    return
  }

  const el = document.querySelector(step.target)
  if (el) {
    el.scrollIntoView({ block: 'nearest', inline: 'nearest' })
    const rect = el.getBoundingClientRect()
    targetRect.value = {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height
    }
  } else {
    // Fallback if target element not found
    targetRect.value = null
  }
}

// Track coordinates continuously during transition and resize
function startCoordinateTracking() {
  stopCoordinateTracking()
  
  // Update coordinates immediately
  updateTargetRect()

  // Track continuously for 720ms (covers both mobile/desktop 500ms sidebar sliding transitions)
  let count = 0
  trackingInterval = setInterval(() => {
    updateTargetRect()
    count++
    if (count > 24) { // 24 * 30ms = 720ms
      stopCoordinateTracking()
    }
  }, 30)
}

function stopCoordinateTracking() {
  if (trackingInterval) {
    clearInterval(trackingInterval)
    trackingInterval = null
  }
}

// Window size trackers for coordinates safety
function handleResize() {
  windowWidth.value = window.innerWidth
  windowHeight.value = window.innerHeight
  updateTargetRect()
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  window.addEventListener('keydown', handleKeyDown)
  if (props.modelValue) {
    currentStep.value = 0
    emit('step-change', 0)
    nextTick(() => {
      startCoordinateTracking()
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  window.removeEventListener('keydown', handleKeyDown)
  stopCoordinateTracking()
})

// Listeners for escape / arrow key navigation
function handleKeyDown(e) {
  if (!props.modelValue) return
  if (e.key === 'Escape') {
    skipTour()
  } else if (e.key === 'ArrowRight' || e.key === 'Enter') {
    nextStep()
  } else if (e.key === 'ArrowLeft') {
    prevStep()
  }
}

// Watchers
watch(() => props.modelValue, (newVal) => {
  if (newVal) {
    currentStep.value = 0
    emit('step-change', 0)
    nextTick(() => {
      startCoordinateTracking()
    })
  } else {
    stopCoordinateTracking()
  }
})

watch(currentStep, (newStep) => {
  emit('step-change', newStep)
  // Langsung update koordinat target baru tanpa me-reset ke null.
  // Ini menghindari efek spotlight mengecil ke tengah (flashing) dan kartu ditarik dari tengah (pulling).
  // Dengan ini, spotlight dan kartu akan meluncur secara elegan dari posisi sebelumnya langsung ke posisi baru!
  nextTick(() => {
    startCoordinateTracking()
  })
})

// Handlers
function nextStep() {
  if (currentStep.value < steps.length - 1) {
    currentStep.value++
  } else {
    completeTour()
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--
  }
}

function skipTour() {
  localStorage.setItem('staysafe_onboarded', 'true')
  emit('update:modelValue', false)
  emit('complete')
}

function completeTour() {
  localStorage.setItem('staysafe_onboarded', 'true')
  emit('update:modelValue', false)
  emit('complete')
}

// Spotlight CSS Calculations (with responsive padding)
const spotlightStyle = computed(() => {
  if (!props.modelValue || currentStep.value === 0 || currentStep.value === steps.length - 1 || !targetRect.value) {
    return {
      top: '50%',
      left: '50%',
      width: '0px',
      height: '0px',
      opacity: 0,
      pointerEvents: 'none',
      boxShadow: 'none'
    }
  }

  const padding = windowWidth.value < 768 ? 6 : 10
  return {
    top: `${targetRect.value.top - padding}px`,
    left: `${targetRect.value.left - padding}px`,
    width: `${targetRect.value.width + padding * 2}px`,
    height: `${targetRect.value.height + padding * 2}px`,
    opacity: 1,
    position: 'fixed',
    zIndex: 2500,
    boxShadow: '0 0 0 9999px rgba(2, 6, 23, 0.82)',
    borderRadius: '16px',
    transition: 'all 0.35s cubic-bezier(0.25, 1, 0.5, 1)',
    pointerEvents: 'none'
  }
})

// Floating Explanation Card Positioning (resilient to margins and dimensions)
const cardStyle = computed(() => {
  if (!props.modelValue) return { display: 'none' }

  // Centered step 0 & step end
  if (currentStep.value === 0 || currentStep.value === steps.length - 1 || !targetRect.value) {
    return {
      position: 'fixed',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      width: '90%',
      maxWidth: '420px',
      zIndex: 2600
    }
  }

  // Desktop positioning logic
  if (windowWidth.value >= 1024) {
    const rect = targetRect.value
    const gap = 16
    const screenHeight = windowHeight.value
    const screenWidth = windowWidth.value
    
    let style = {
      position: 'fixed',
      width: '360px',
      zIndex: 2600,
      transform: 'none', // Reset translate dari step center!
      transition: 'all 0.35s cubic-bezier(0.25, 1, 0.5, 1)'
    }

    // Vertical placement
    if (rect.top > screenHeight / 2) {
      // Place ABOVE
      style.bottom = `${screenHeight - rect.top + gap}px`
    } else {
      // Place BELOW
      style.top = `${rect.bottom + gap}px`
    }

    // Horizontal placement
    if (rect.left > screenWidth / 2) {
      // Right half element: align right edges
      const rightDistance = screenWidth - (rect.left + rect.width)
      style.right = `${Math.max(20, rightDistance - 8)}px`
    } else {
      // Left half element: align left edges
      style.left = `${Math.max(20, rect.left - 8)}px`
    }

    return style
  }

  // Mobile positioning (sticky elegant bottom/top sheet to prevent covering active bottom element)
  const rect = targetRect.value
  const isTargetInBottomHalf = rect && rect.top > windowHeight.value / 2

  if (isTargetInBottomHalf) {
    // Jika target ada di paruh bawah layar (seperti Lapor/GPS), tempatkan kartu di ATAS layar HP agar target tidak tertutup!
    return {
      position: 'fixed',
      top: 'calc(1rem + env(safe-area-inset-top))',
      left: '16px',
      right: '16px',
      transform: 'none', // Reset translate dari step center!
      width: 'auto',
      zIndex: 2600
    }
  }

  // Jika target di paruh atas layar, tempatkan kartu di bawah
  return {
    position: 'fixed',
    bottom: 'calc(1.5rem + env(safe-area-inset-bottom))',
    left: '16px',
    right: '16px',
    transform: 'none', // Reset translate dari step center!
    width: 'auto',
    zIndex: 2600
  }
})

const activeStep = computed(() => steps[currentStep.value])
</script>

<template>
  <Transition name="fade">
    <div v-if="modelValue" class="fixed inset-0 z-[2300] overflow-hidden select-none">
      
      <!-- Fullscreen Centered Dim Backdrop for Step 0 & Final Step -->
      <div
        v-if="currentStep === 0 || currentStep === steps.length - 1 || !targetRect"
        class="absolute inset-0 bg-slate-950/80 backdrop-blur-[2px] z-[2400] transition-opacity duration-300 pointer-events-auto"
        @click="skipTour"
      ></div>

      <!-- Interactive Highlight Spotlight Mask Container -->
      <div
        :style="spotlightStyle"
        class="border border-emerald-400/40 animate-spotlight-pulse"
      ></div>

      <!-- Onboarding Explanation Card (Premium Dark Glassmorphic Design) -->
      <div
        :style="cardStyle"
        class="bg-slate-900/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-5 md:p-6 shadow-[0_20px_50px_rgba(0,0,0,0.5)] pointer-events-auto flex flex-col gap-4"
      >
        <!-- Header: Title and Skip -->
        <div class="flex items-start justify-between gap-3">
          <h2 class="text-white font-extrabold text-sm md:text-base leading-tight tracking-wide">
            {{ activeStep.title }}
          </h2>
          <button
            @click="skipTour"
            class="text-[10px] md:text-xs font-bold text-white/40 hover:text-white/80 hover:bg-white/5 px-2 py-1 rounded-lg border border-transparent hover:border-white/5 transition-all duration-150 cursor-pointer select-none"
            title="Lewati Tur"
          >
            Lewati
          </button>
        </div>

        <!-- Body: Description -->
        <p class="text-xs text-white/60 leading-relaxed font-medium">
          {{ activeStep.desc }}
        </p>

        <!-- Footer: Progress Indicators and Navigation Actions -->
        <div class="flex items-center justify-between gap-4 mt-1 pt-3 border-t border-white/5">
          
          <!-- Progress dots navigation indicator -->
          <div class="flex items-center gap-1.5">
            <span
              v-for="(step, idx) in steps"
              :key="idx"
              class="w-1.5 h-1.5 rounded-full transition-all duration-300"
              :class="idx === currentStep ? 'bg-emerald-400 w-3' : 'bg-white/20'"
            ></span>
          </div>

          <!-- Navigation Action buttons -->
          <div class="flex items-center gap-2">
            <!-- Back Button -->
            <button
              v-if="currentStep > 0"
              @click="prevStep"
              class="h-8 px-3.5 rounded-xl border border-white/10 hover:border-white/20 hover:bg-white/5 text-[10px] md:text-xs font-bold text-white/70 hover:text-white transition-all cursor-pointer select-none"
            >
              Kembali
            </button>

            <!-- Next / Finish Button -->
            <button
              @click="nextStep"
              class="h-8 px-4 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-[10px] md:text-xs font-extrabold text-white shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 active:scale-95 transition-all cursor-pointer select-none"
            >
              {{ currentStep === steps.length - 1 ? 'Selesai' : 'Lanjut' }}
            </button>
          </div>

        </div>

      </div>

    </div>
  </Transition>
</template>

<style scoped>
/* Glowing ring breathing animation around spotlight */
@keyframes border-pulse {
  0%, 100% {
    border-color: rgba(52, 211, 153, 0.4);
    box-shadow: 0 0 0 9999px rgba(2, 6, 23, 0.82), 0 0 0 2px rgba(52, 211, 153, 0.15);
  }
  50% {
    border-color: rgba(16, 185, 129, 0.7);
    box-shadow: 0 0 0 9999px rgba(2, 6, 23, 0.82), 0 0 0 6px rgba(16, 185, 129, 0.35);
  }
}

.animate-spotlight-pulse {
  animation: border-pulse 2s infinite ease-in-out;
}

/* Vue Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
