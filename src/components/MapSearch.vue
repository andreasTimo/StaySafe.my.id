<script setup>
import { ref, watch } from 'vue'
import { useMap } from '../composables/useMap'
import { useReports } from '../composables/useReports'
import { getCategoryById, getSubcategoryLabel } from '../config/categories.js'

const props = defineProps({
  isMenuOpen: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['toggle-menu'])

const { map, showReportDetail } = useMap()
const { filteredReports } = useReports()

const searchQuery = ref('')
const searchMode = ref('place') // 'place' (General) or 'incident' (Crime Data)
const suggestions = ref([])
const showSuggestions = ref(false)
const loading = ref(false)
let debounceTimer = null

// Fungsi pencarian lokasi umum menggunakan Nominatim OSM API dengan batasan wilayah Jakarta
async function fetchPlaceSuggestions(query) {
  if (!query || query.trim().length < 3) {
    suggestions.value = []
    return
  }

  loading.value = true
  try {
    const bbox = '106.6,-6.38,107.0,-6.08' // Bounding box Jabodetabek
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&countrycodes=id&viewbox=${bbox}&bounded=1&limit=5&addressdetails=1`
    
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'StaySafe.my.id (andreastimotius33@gmail.com)'
      }
    })
    
    if (!res.ok) throw new Error('Search failed')
    
    const data = await res.json()
    suggestions.value = data.map(item => {
      const addr = item.address || {}
      const mainName = item.name || addr.road || addr.suburb || ''
      const subName = addr.suburb || addr.city_district || addr.city || ''
      
      return {
        type: 'place',
        display_name: item.display_name,
        short_name: mainName && subName && mainName !== subName ? `${mainName}, ${subName}` : item.display_name.split(',').slice(0, 2).join(',').trim(),
        lat: parseFloat(item.lat),
        lon: parseFloat(item.lon)
      }
    })
  } catch (err) {
    console.error('[StaySafe Search] Gagal memuat saran lokasi:', err)
  } finally {
    loading.value = false
  }
}

// Fungsi pencarian data kejadian kejahatan lokal secara instan (Mode Kejadian)
function searchIncidentSuggestions(query) {
  if (!query || query.trim().length < 2) {
    suggestions.value = []
    return
  }

  const q = query.toLowerCase().trim()
  
  // Filter laporan berdasarkan kategori, subkategori, deskripsi, atau alamat kelurahan
  const matches = filteredReports.value.filter(r => {
    const cat = getCategoryById(r.category)
    const catLabel = cat ? cat.label.toLowerCase() : ''
    const subLabel = getSubcategoryLabel(r.category, r.subcategory).toLowerCase()
    const desc = r.description.toLowerCase()
    const addr = (r.address || '').toLowerCase()
    
    return catLabel.includes(q) || subLabel.includes(q) || desc.includes(q) || addr.includes(q)
  })

  // Urutkan berdasarkan tanggal terbaru dan batasi maksimal 5 saran
  suggestions.value = matches
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5)
    .map(r => {
      const cat = getCategoryById(r.category)
      return {
        type: 'incident',
        short_name: getSubcategoryLabel(r.category, r.subcategory),
        display_name: r.description,
        icon: cat ? cat.icon : '⚠️',
        color: cat ? cat.color.DEFAULT : '#EF4444',
        rawReport: r
      }
    })
}

// Watch input pencarian dengan debounce untuk pemanggilan API
watch([searchQuery, searchMode], () => {
  clearTimeout(debounceTimer)
  
  const query = searchQuery.value
  if (!query || query.trim().length < 2) {
    suggestions.value = []
    showSuggestions.value = false
    return
  }
  
  if (searchMode.value === 'place') {
    debounceTimer = setTimeout(() => {
      fetchPlaceSuggestions(query)
      showSuggestions.value = true
    }, 450)
  } else {
    // Mode Kejadian diproses instan tanpa delay debounce karena pencarian lokal di client!
    searchIncidentSuggestions(query)
    showSuggestions.value = true
  }
})

// Fungsi memproses klik saran lokasi/kejadian
function handleSelect(item) {
  if (item.type === 'place') {
    if (map.value) {
      map.value.flyTo([item.lat, item.lon], 16, {
        duration: 1.8,
        easeLinearity: 0.2
      })
    }
    searchQuery.value = item.short_name
  } else {
    // Mode Kejadian: panggil showReportDetail untuk meluncurkan peta dan langsung membuka popup Leaflet kejadian tersebut!
    showReportDetail(item.rawReport)
    searchQuery.value = item.short_name
  }
  showSuggestions.value = false
}

function closeSuggestionsDelay() {
  setTimeout(() => {
    showSuggestions.value = false
  }, 250)
}

function handleEnterKey() {
  if (suggestions.value.length > 0) {
    handleSelect(suggestions.value[0])
  }
}
</script>

<template>
  <div class="relative w-full pointer-events-auto">
    <!-- Google Maps Style Navigation Card -->
    <div class="flex flex-col bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl transition-all duration-200 overflow-hidden">
      
      <!-- Top Row: Hamburger + Input + Toggle Mode -->
      <div class="flex items-center h-12 px-2.5 gap-2">
        <!-- 1. Hamburger Menu Toggle Button -->
        <button
          @click="emit('toggle-menu')"
          class="w-9 h-9 rounded-xl flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-colors duration-150 cursor-pointer"
          :title="isMenuOpen ? 'Tutup Menu' : 'Buka Menu'"
        >
          <svg v-if="isMenuOpen" class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
          <svg v-else class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
          </svg>
        </button>

        <!-- Divider -->
        <div class="w-[1px] h-6 bg-white/10 flex-shrink-0"></div>

        <!-- 2. Main Text Input -->
        <input
          v-model="searchQuery"
          type="text"
          :placeholder="searchMode === 'place' ? 'Cari jalan / wilayah di Jakarta...' : 'Ketik jenis kejahatan (begal, copet)...'"
          @focus="showSuggestions = suggestions.length > 0"
          @blur="closeSuggestionsDelay"
          @keydown.enter="handleEnterKey"
          class="flex-1 bg-transparent text-white/90 placeholder-white/35 focus:outline-none text-xs font-semibold h-full px-1 min-w-0"
        />

        <!-- 3. Loading / Search Icon -->
        <div class="w-8 h-8 flex items-center justify-center flex-shrink-0">
          <svg
            v-if="loading"
            class="animate-spin h-4.5 w-4.5 text-emerald-400"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <svg
            v-else
            class="h-4.5 w-4.5 text-white/35"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      <!-- Bottom Row: Sleek Mode Switcher (Google Maps Tab Style) -->
      <div class="flex border-t border-white/5 bg-white/[0.01] h-8.5 p-1 gap-1 flex-shrink-0">
        <button
          @click="searchMode = 'place'"
          class="flex-1 rounded-lg text-[10px] font-bold tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-1"
          :class="searchMode === 'place'
            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/15 shadow-sm'
            : 'text-white/40 hover:text-white/75'"
        >
          <span>🌐</span> Cari Tempat
        </button>
        <button
          @click="searchMode = 'incident'"
          class="flex-1 rounded-lg text-[10px] font-bold tracking-wide transition-all duration-200 cursor-pointer flex items-center justify-center gap-1"
          :class="searchMode === 'incident'
            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/15 shadow-sm'
            : 'text-white/40 hover:text-white/75'"
        >
          <span>⚠️</span> Cari Kejadian
        </button>
      </div>
    </div>

    <!-- Dropdown Suggestions List -->
    <Transition name="slide-up">
      <ul
        v-if="showSuggestions && (suggestions.length > 0 || (searchQuery.trim().length >= 2 && !loading))"
        class="absolute left-0 right-0 mt-2 bg-slate-950/95 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-y-auto shadow-2xl z-[2000] custom-scrollbar max-h-64"
      >
        <template v-if="suggestions.length > 0">
          <li
            v-for="(item, idx) in suggestions"
            :key="idx"
            @mousedown="handleSelect(item)"
            class="px-4 py-3.5 border-b border-white/5 last:border-b-0 hover:bg-white/5 cursor-pointer transition-colors duration-150 group"
          >
            <!-- Mode 1: Cari Tempat Suggestions -->
            <div v-if="item.type === 'place'" class="flex items-start gap-3">
              <span class="text-[13px] mt-0.5 group-hover:scale-110 transition-transform">📍</span>
              <div class="flex-1 min-w-0">
                <p class="text-xs font-bold text-white/90 truncate">{{ item.short_name }}</p>
                <p class="text-[10px] text-white/35 truncate mt-0.5">{{ item.display_name }}</p>
              </div>
            </div>

            <!-- Mode 2: Cari Kejadian Suggestions (Premium visual style) -->
            <div v-else class="flex items-start gap-3">
              <span
                class="w-5 h-5 rounded-lg flex items-center justify-center text-[10px] font-bold text-white shadow-inner flex-shrink-0 group-hover:scale-105 transition-transform"
                :style="{ background: item.color + '20', border: '1px solid ' + item.color + '30', color: item.color }"
              >
                {{ item.icon }}
              </span>
              <div class="flex-1 min-w-0">
                <div class="flex items-baseline justify-between gap-2">
                  <p class="text-xs font-bold text-white/90 truncate" :style="{ color: item.color }">
                    {{ item.short_name }}
                  </p>
                  <span class="text-[8px] text-white/30 font-medium tracking-wide flex-shrink-0">
                    {{ item.rawReport.address ? item.rawReport.address.split(',')[0] : 'Jakarta' }}
                  </span>
                </div>
                <p class="text-[10.5px] text-white/45 truncate mt-0.5 leading-relaxed">{{ item.display_name }}</p>
              </div>
            </div>
          </li>
        </template>
        <!-- Fallback when no results found -->
        <li
          v-else
          class="px-5 py-6 text-center text-white/40 text-xs font-semibold select-none flex flex-col items-center justify-center gap-2"
        >
          <div class="text-xl animate-bounce">🔍</div>
          <div>
            <span v-if="searchMode === 'place'">Tidak ditemukan wilayah/jalan di Jabodetabek</span>
            <span v-else>Tidak ditemukan laporan "{{ searchQuery }}"</span>
          </div>
          <span class="text-[9.5px] text-white/20 font-medium">Coba gunakan kata kunci jalan atau jenis kejadian lain</span>
        </li>
      </ul>
    </Transition>
  </div>
</template>

<style scoped>
.slide-up-enter-active,
.slide-up-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}
.slide-up-enter-from,
.slide-up-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
</style>
