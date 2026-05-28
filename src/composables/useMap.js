/**
 * StaySafe.my.id — useMap composable (Shared Singleton State)
 *
 * Core Leaflet map logic with:
 *   - Shared module-level state (prevents multiple-ref synchronization bugs)
 *   - Semantic Zooming (Zoom < 15 Heatmap, Zoom >= 15 Markers)
 *   - Manual Visual Mode Override ('auto', 'heatmap', 'markers')
 *   - Precision Click-to-Pin Mode (disables panning and overrides cursor to crosshair)
 *   - Recenter with blue-pulse user location mapping
 */

import { shallowRef, ref, computed, onUnmounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.heat'
import 'leaflet.markercluster'

import { CATEGORIES, getCategoryById, getSubcategoryLabel } from '@/config/categories.js'

// ---------------------------------------------------------------------------
// Custom CSS Injections for UI Enhancements
// ---------------------------------------------------------------------------
const STYLES_CSS_ID = 'staysafe-map-injected-styles'
function injectMapStyles() {
  if (document.getElementById(STYLES_CSS_ID)) return
  const style = document.createElement('style')
  style.id = STYLES_CSS_ID
  style.textContent = `
    /* Marker Cluster Styles */
    .marker-cluster-small,
    .marker-cluster-medium,
    .marker-cluster-large {
      background: rgba(15, 15, 20, 0.65);
      backdrop-filter: blur(8px);
      -webkit-backdrop-filter: blur(8px);
      border: 1.5px solid rgba(255,255,255,0.2);
      border-radius: 50%;
    }
    .marker-cluster-small div,
    .marker-cluster-medium div,
    .marker-cluster-large div {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
      font-family: 'Inter', system-ui, sans-serif;
      font-weight: 700;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      text-align: center;
      padding: 2px;
    }
    .marker-cluster-small { width: 56px !important; height: 56px !important; }
    .marker-cluster-small div { width: 48px; height: 48px; }
    .marker-cluster-medium { width: 66px !important; height: 66px !important; }
    .marker-cluster-medium div { width: 56px; height: 56px; }
    .marker-cluster-large { width: 76px !important; height: 76px !important; }
    .marker-cluster-large div { width: 66px; height: 66px; }

    /* Custom Sleek Permanent Tooltip for Markers */
    .staysafe-marker-tooltip {
      background: rgba(15, 23, 42, 0.85) !important;
      backdrop-filter: blur(8px) !important;
      -webkit-backdrop-filter: blur(8px) !important;
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      border-radius: 6px !important;
      color: #fff !important;
      font-family: 'Inter', system-ui, sans-serif;
      font-weight: 700;
      font-size: 9.5px;
      padding: 3px 6px !important;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4) !important;
      border-bottom: 2px solid currentColor !important;
    }
    .staysafe-marker-tooltip::before {
      border-top-color: rgba(15, 23, 42, 0.85) !important;
    }

    /* Pulsing pin for new report location selection */
    @keyframes staysafe-pulse {
      0%   { transform: scale(0.8); opacity: 1; }
      50%  { transform: scale(1.6); opacity: 0.4; }
      100% { transform: scale(0.8); opacity: 1; }
    }
    .staysafe-pulse-pin {
      width: 18px; height: 18px;
      background: #EF4444;
      border: 3.5px solid #fff;
      border-radius: 50%;
      box-shadow: 0 0 16px rgba(239,68,68,0.8);
      animation: staysafe-pulse 1.3s ease-in-out infinite;
    }

    /* Recenter User Blue Dot Pulse */
    @keyframes user-pulse-anim {
      0%   { transform: scale(0.6); opacity: 1; }
      100% { transform: scale(2.6); opacity: 0; }
    }
    .staysafe-user-pulse {
      width: 15px; height: 15px;
      background: #0066FF;
      border: 2px solid #FFFFFF;
      border-radius: 50%;
      box-shadow: 0 0 12px rgba(0,102,255,0.85);
      position: relative;
    }
    .staysafe-user-pulse::after {
      content: '';
      position: absolute;
      width: 35px; height: 35px;
      background: rgba(0,102,255,0.22);
      border: 1px solid rgba(0,102,255,0.35);
      border-radius: 50%;
      top: -12px; left: -12px;
      animation: user-pulse-anim 1.8s infinite ease-out;
    }

    /* Force Crosshair Cursor in Report Mode */
    .report-mode-cursor,
    .report-mode-cursor .leaflet-grab,
    .report-mode-cursor .leaflet-interactive {
      cursor: crosshair !important;
    }

    /* Modern Popup Customization */
    .staysafe-popup .leaflet-popup-content-wrapper {
      background: rgba(17, 24, 39, 0.85) !important;
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
      border: 1px solid rgba(255, 255, 255, 0.08) !important;
      border-radius: 14px !important;
      color: #fff !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5) !important;
    }
    .staysafe-popup .leaflet-popup-tip {
      background: rgba(17, 24, 39, 0.85) !important;
    }
    .staysafe-popup .leaflet-popup-content {
      margin: 14px 16px;
      font-size: 13px;
      line-height: 1.6;
    }
  `
  document.head.appendChild(style)
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function relativeTime(date) {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
  if (seconds < 60) return 'Baru saja'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} menit lalu`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} jam lalu`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days} hari lalu`
  const weeks = Math.floor(days / 7)
  return `${weeks} minggu lalu`
}

function popupHtml(report) {
  const cat = getCategoryById(report.category)
  const subLabel = getSubcategoryLabel(report.category, report.subcategory)
  const color = cat ? cat.color.DEFAULT : '#888'
  return `
    <div style="min-width:210px;max-width:280px">
      <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
        <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${color}"></span>
        <strong style="font-size:14px;color:#fff;font-weight:700">${subLabel}</strong>
      </div>
      <p style="margin:0 0 10px;color:rgba(255,255,255,0.85);font-size:12.5px;font-weight:400;line-height:1.45">${report.description}</p>
      <div style="display:flex;flex-direction:column;gap:5px;font-size:11px;color:rgba(255,255,255,0.5);border-top:1px solid rgba(255,255,255,0.08);padding-top:6px">
        <span style="color:#ffffff;font-weight:700;display:flex;align-items:center;gap:4px;font-size:12px">📍 ${report.address || 'Jakarta'}</span>
        <div style="display:flex;justify-content:between;align-items:center;width:100%">
          <time>${relativeTime(report.createdAt)}</time>
        </div>
      </div>
    </div>
  `
}

function categoryIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background:${color};
      width:13px;height:13px;
      border-radius:50%;
      border:2px solid #fff;
      box-shadow:0 3px 8px rgba(0,0,0,0.35);
    "></div>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  })
}

// ---------------------------------------------------------------------------
// Module-level Singleton State
// ---------------------------------------------------------------------------
const map = shallowRef(null)
const currentZoom = ref(12)
const visualMode = ref('auto') // 'auto', 'heatmap', 'markers'
const pendingLocation = ref(null)
const userLocation = ref(null)

// Non-reactive variables
let heatLayers = []
let clusterLayer = null
let userLocationMarker = null
let reportModeActive = false
let reportModeHandler = null
let pendingPinMarker = null
let resizeObserver = null

const isDetailView = computed(() => currentZoom.value >= 15)

// ---------------------------------------------------------------------------
// Composable Function
// ---------------------------------------------------------------------------
export function useMap() {

  function initMap(containerId) {
    injectMapStyles()

    const instance = L.map(containerId, {
      center: [-6.2088, 106.8456],
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    })

    // CartoDB Positron - Sleek light theme
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      maxZoom: 19,
      subdomains: 'abcd',
    }).addTo(instance)

    // Attribution control
    L.control.attribution({ position: 'bottomleft', prefix: false })
      .addAttribution('© <a href="https://carto.com/">CARTO</a> · © OSM')
      .addTo(instance)

    instance.on('zoomend', () => {
      currentZoom.value = instance.getZoom()
    })

    // Pemicu invalidateSize dengan delay pendek untuk memastikan DOM & layout stabil (first launch fix)
    setTimeout(() => {
      instance.invalidateSize()
    }, 100)

    // Deteksi perubahan ukuran container secara real-time dengan ResizeObserver
    const container = document.getElementById(containerId)
    if (container && typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => {
        if (instance) {
          instance.invalidateSize()
        }
      })
      resizeObserver.observe(container)
    }

    map.value = instance
    return instance
  }

  function updateLayers(reports) {
    const instance = map.value
    if (!instance) return

    // 1. Tear down existing layers
    heatLayers.forEach((l) => { if (instance.hasLayer(l)) instance.removeLayer(l) })
    heatLayers = []
    
    if (clusterLayer) {
      instance.removeLayer(clusterLayer)
      clusterLayer = null
    }

    if (!reports || reports.length === 0) return

    // 2. Group reports for heatmaps
    const grouped = {}
    for (const cat of Object.keys(CATEGORIES)) grouped[cat] = []
    for (const r of reports) {
      if (grouped[r.category]) grouped[r.category].push(r)
    }

    // 3. Rebuild heatmaps
    for (const [catId, catReports] of Object.entries(grouped)) {
      if (catReports.length === 0) continue
      const cat = CATEGORIES[catId]
      const points = catReports.map((r) => [r.location.coordinates[1], r.location.coordinates[0], 1.5])
      const heat = L.heatLayer(points, {
        radius: 30,      // Highly concentrated radius for glowing zones
        blur: 15,        // Seamless yet crisp blending
        maxZoom: 16,
        max: 0.3,        // Reaches full saturation/opacity at much lower density
        gradient: {
          0.15: cat.color.light,
          0.55: cat.color.DEFAULT,
          1.0: cat.color.dark,
        },
      })
      heatLayers.push(heat)
    }

    // 4. Rebuild Cluster layer
    clusterLayer = L.markerClusterGroup({
      maxClusterRadius: 45,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      zoomToBoundsOnClick: true,
      disableClusteringAtZoom: 18,
      iconCreateFunction(cluster) {
        const markers = cluster.getAllChildMarkers()
        const count = markers.length

        // Find the most frequent subcategory (Majority mode) in this cluster
        const subcategoryCounts = {}
        for (const m of markers) {
          const report = m.options.report
          if (report && report.subcategory) {
            const key = `${report.category}:${report.subcategory}`
            subcategoryCounts[key] = (subcategoryCounts[key] || 0) + 1
          }
        }

        let maxCount = 0
        let majorityKey = null
        for (const [key, val] of Object.entries(subcategoryCounts)) {
          if (val > maxCount) {
            maxCount = val
            majorityKey = key
          }
        }

        let majorityLabel = ''
        let majorityColor = '#10b981' // fallback
        if (majorityKey) {
          const [catId, subId] = majorityKey.split(':')
          majorityLabel = getSubcategoryLabel(catId, subId)
          const cat = getCategoryById(catId)
          if (cat) {
            majorityColor = cat.color.DEFAULT
          }
        }

        let size = 'small'
        if (count >= 50) size = 'large'
        else if (count >= 15) size = 'medium'

        return L.divIcon({
          html: `
            <div>
              <span class="text-xs font-extrabold text-white leading-none">${count}</span>
              ${majorityLabel ? `<span class="text-[8px] font-bold mt-0.5 tracking-tight truncate w-full px-1" style="color:${majorityColor}">${majorityLabel}</span>` : ''}
            </div>
          `,
          className: `marker-cluster marker-cluster-${size}`,
          iconSize: size === 'large' ? L.point(76, 76) : size === 'medium' ? L.point(66, 66) : L.point(56, 56),
        })
      },
    })

    for (const r of reports) {
      const cat = getCategoryById(r.category)
      const color = cat ? cat.color.DEFAULT : '#888'
      const marker = L.marker(
        [r.location.coordinates[1], r.location.coordinates[0]],
        { 
          icon: categoryIcon(color),
          report: r // Attaching report data for cluster icon mode analysis
        },
      )

      // Bind a sleek, glassmorphic permanent tooltip showing the specific subcategory name
      const subLabel = getSubcategoryLabel(r.category, r.subcategory)
      marker.bindTooltip(subLabel, {
        permanent: true,
        direction: 'top',
        offset: [0, -10],
        className: 'staysafe-marker-tooltip'
      })

      // Style tooltip text color matching category
      marker.on('add', () => {
        const tooltip = marker.getTooltip()
        if (tooltip && tooltip.getElement()) {
          tooltip.getElement().style.color = color
        }
      })

      marker.bindPopup(popupHtml(r), {
        className: 'staysafe-popup',
        maxWidth: 260,
        closeButton: false,
      })
      clusterLayer.addLayer(marker)
    }

    // 5. Apply rendering rules
    applyLayerRendering(instance)

    // Set zoom listener
    instance.off('zoomend.rendering')
    instance.on('zoomend.rendering', () => applyLayerRendering(instance))
  }

  function applyLayerRendering(instance) {
    if (!instance) return
    
    // Determine active display mode
    let showHeatmap = false
    let showMarkers = false

    if (visualMode.value === 'heatmap') {
      showHeatmap = true
    } else if (visualMode.value === 'markers') {
      showMarkers = true
    } else {
      // 'auto' - Semantic Zooming
      if (currentZoom.value >= 15) {
        showMarkers = true
      } else {
        showHeatmap = true
      }
    }

    // Render Heatmaps
    if (showHeatmap) {
      heatLayers.forEach((l) => { if (!instance.hasLayer(l)) instance.addLayer(l) })
    } else {
      heatLayers.forEach((l) => { if (instance.hasLayer(l)) instance.removeLayer(l) })
    }

    // Render Markers
    if (showMarkers && clusterLayer) {
      if (!instance.hasLayer(clusterLayer)) instance.addLayer(clusterLayer)
    } else if (clusterLayer) {
      if (instance.hasLayer(clusterLayer)) instance.removeLayer(clusterLayer)
    }
  }

  // Set visual mode ('auto', 'heatmap', 'markers') and refresh map
  function setVisualMode(mode) {
    visualMode.value = mode
    applyLayerRendering(map.value)
  }

  // Geolocation Locator & Recenter
  function locateUser(flyToUser = false) {
    const instance = map.value
    if (!instance) return

    const useSimulatedFallback = (reason) => {
      console.warn(`[StaySafe] Geolocation simulation active: ${reason}`)
      
      // Default fallback to Monas/Thamrin, Central Jakarta (Mock Location)
      const simLat = -6.1754
      const simLng = 106.8272
      userLocation.value = { lat: simLat, lng: simLng }

      if (userLocationMarker) {
        instance.removeLayer(userLocationMarker)
      }

      // Pulse indicator
      const userIcon = L.divIcon({
        className: '',
        html: '<div class="staysafe-user-pulse"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      })

      userLocationMarker = L.marker([simLat, simLng], { icon: userIcon }).addTo(instance)

      if (flyToUser) {
        instance.flyTo([simLat, simLng], 16, {
          duration: 1.5,
          easeLinearity: 0.25,
        })
      }
    }

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords
            userLocation.value = { lat: latitude, lng: longitude }

            // Clean up old marker
            if (userLocationMarker) {
              instance.removeLayer(userLocationMarker)
            }

            // Create custom blue pulse indicator
            const userIcon = L.divIcon({
              className: '',
              html: '<div class="staysafe-user-pulse"></div>',
              iconSize: [16, 16],
              iconAnchor: [8, 8],
            })

            userLocationMarker = L.marker([latitude, longitude], { icon: userIcon }).addTo(instance)

            // Center map with flyTo if requested
            if (flyToUser) {
              instance.flyTo([latitude, longitude], 16, {
                duration: 1.5,
                easeLinearity: 0.25,
              })
            }
          },
          (error) => {
            useSimulatedFallback(`Permission denied or error code ${error.code}: ${error.message}`)
          },
          { enableHighAccuracy: true, timeout: 6000 }
        )
      } else {
        useSimulatedFallback('Geolocation not supported by browser')
      }
    } catch (err) {
      useSimulatedFallback(`Synchronous Geolocation API crash: ${err.message || err}`)
    }
  }

  function recenterMap() {
    locateUser(true)
  }

  // Precision Pin Selection Mode
  function setReportMode(enabled) {
    const instance = map.value
    if (!instance) return

    reportModeActive = enabled

    if (enabled) {
      // 1. Force styling & cursor
      L.DomUtil.addClass(instance.getContainer(), 'report-mode-cursor')
      
      // 2. Temporarily disable dragging and zoom for exact coordinates clicking
      instance.dragging.disable()
      instance.doubleClickZoom.disable()

      reportModeHandler = (e) => {
        if (pendingPinMarker) {
          instance.removeLayer(pendingPinMarker)
        }

        const pulsePinIcon = L.divIcon({
          className: '',
          html: '<div class="staysafe-pulse-pin"></div>',
          iconSize: [20, 20],
          iconAnchor: [10, 10],
        })

        pendingPinMarker = L.marker(e.latlng, { icon: pulsePinIcon }).addTo(instance)
        pendingLocation.value = {
          lat: e.latlng.lat,
          lng: e.latlng.lng,
        }
      }
      instance.on('click', reportModeHandler)
    } else {
      // Remove styles & restore controls
      L.DomUtil.removeClass(instance.getContainer(), 'report-mode-cursor')
      instance.dragging.enable()
      instance.doubleClickZoom.enable()

      if (reportModeHandler) {
        instance.off('click', reportModeHandler)
        reportModeHandler = null
      }
      if (pendingPinMarker) {
        instance.removeLayer(pendingPinMarker)
        pendingPinMarker = null
      }
      pendingLocation.value = null
    }
  }

  function cleanup() {
    if (resizeObserver) {
      resizeObserver.disconnect()
      resizeObserver = null
    }
    const instance = map.value
    if (instance) {
      instance.off()
      instance.remove()
      map.value = null
    }
    heatLayers = []
    clusterLayer = null
    if (userLocationMarker && instance) {
      instance.removeLayer(userLocationMarker)
    }
    userLocationMarker = null
    reportModeActive = false
    reportModeHandler = null
    pendingPinMarker = null
    pendingLocation.value = null
  }

  function showReportDetail(report) {
    const instance = map.value
    if (!instance || !report || !report.location) return

    const [lng, lat] = report.location.coordinates
    
    // Meluncur mulus ke lokasi kejadian
    instance.flyTo([lat, lng], 17, {
      duration: 1.5,
      easeLinearity: 0.25
    })

    // Tampilkan popup informasi detail setelah animasi kamera hampir selesai
    setTimeout(() => {
      L.popup({
        className: 'staysafe-popup',
        closeButton: false,
        maxWidth: 260
      })
      .setLatLng([lat, lng])
      .setContent(popupHtml(report))
      .openOn(instance)
    }, 1200)
  }

  function zoomIn() {
    if (map.value) {
      map.value.zoomIn()
    }
  }

  function zoomOut() {
    if (map.value) {
      map.value.zoomOut()
    }
  }

  return {
    map,
    currentZoom,
    isDetailView,
    visualMode,
    pendingLocation,
    userLocation,
    initMap,
    updateLayers,
    setVisualMode,
    locateUser,
    recenterMap,
    setReportMode,
    cleanup,
    showReportDetail,
    zoomIn,
    zoomOut,
  }
}
