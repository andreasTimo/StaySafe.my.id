<script setup>
import { computed } from 'vue'
import { CATEGORIES } from '../config/categories.js'
import { useReports } from '../composables/useReports.js'

const props = defineProps({
  reports: {
    type: Array,
    default: () => []
  }
})

const { activeFilters, toggleFilter } = useReports()
const isExpanded = defineModel('expanded', { default: false })

function toggleExpand() {
  isExpanded.value = !isExpanded.value
}

const categoryList = computed(() => Object.values(CATEGORIES))

const categoryCounts = computed(() => {
  const counts = {}
  for (const cat of categoryList.value) {
    counts[cat.id] = props.reports.filter(r => r.category === cat.id).length
  }
  return counts
})
</script>

<template>
  <div class="select-none pointer-events-auto">
    <div
      class="bg-slate-900/60 backdrop-blur-lg rounded-xl border border-white/10 shadow-2xl overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]"
      :style="{
        maxHeight: isExpanded ? '320px' : '40px',
        width: isExpanded ? '230px' : '110px'
      }"
    >
      <!-- Header / Toggle -->
      <button
        @click="toggleExpand"
        class="flex items-center justify-between w-full px-3.5 py-2.5 text-white/90 hover:text-white transition-colors duration-200 cursor-pointer"
      >
        <span class="text-xs font-bold tracking-wider uppercase flex items-center gap-1.5">
          <span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          Legenda
        </span>
        <svg
          class="w-3.5 h-3.5 transition-transform duration-300"
          :class="{ 'rotate-180': isExpanded }"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <!-- Category list with toggle features -->
      <div class="px-3.5 pb-3.5 space-y-2.5">
        <button
          v-for="cat in categoryList"
          :key="cat.id"
          @click="toggleFilter(cat.id)"
          class="flex items-center gap-3 w-full text-left transition-all duration-200 cursor-pointer group"
          :class="activeFilters[cat.id] ? 'opacity-100 scale-100' : 'opacity-35 scale-95'"
          :title="activeFilters[cat.id] ? `Sembunyikan ${cat.label}` : `Tampilkan ${cat.label}`"
        >
          <!-- Gradient scale bar -->
          <div
            class="w-5 h-2 rounded-full flex-shrink-0"
            :style="{
              background: `linear-gradient(90deg, ${cat.color.light}, ${cat.color.DEFAULT}, ${cat.color.dark})`
            }"
          ></div>

          <!-- Label -->
          <span class="text-[10.5px] text-white/70 font-semibold group-hover:text-white/95 leading-tight flex-1">
            {{ cat.label.replace('Kejahatan dengan ', '').replace('Kejahatan ', '') }}
          </span>

          <!-- Count -->
          <span
            class="text-[9.5px] font-bold min-w-[20px] text-center rounded-full px-1.5 py-0.5"
            :style="{
              color: cat.color.DEFAULT,
              background: cat.color.DEFAULT + '20'
            }"
          >
            {{ categoryCounts[cat.id] || 0 }}
          </span>
        </button>
      </div>
    </div>
  </div>
</template>
