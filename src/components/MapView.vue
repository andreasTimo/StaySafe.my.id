<script setup>
import { onMounted, watch } from 'vue'
import { useMap } from '../composables/useMap'
import { useReports } from '../composables/useReports'

const { initMap, updateLayers } = useMap()
const { filteredReports, fetchReports } = useReports()

onMounted(async () => {
  initMap('map')
  await fetchReports()
  updateLayers(filteredReports.value)
})

// Watch filteredReports so layers re-render instantly on filter toggles
watch(filteredReports, (newReports) => {
  updateLayers(newReports)
}, { deep: true })
</script>

<template>
  <div id="map" class="w-full h-full z-0"></div>
</template>
