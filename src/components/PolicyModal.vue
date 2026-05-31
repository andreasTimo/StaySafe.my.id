<script setup>
import { ref, watch, nextTick } from 'vue'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false
  },
  section: {
    type: String,
    default: 'privacy' // 'privacy' or 'terms'
  }
})

const emit = defineEmits(['update:modelValue'])

const dialogRef = ref(null)

// Watch modelValue to open/close native dialog element
watch(() => props.modelValue, async (open) => {
  await nextTick()
  if (!dialogRef.value) return
  if (open) {
    dialogRef.value.showModal()
  } else {
    dialogRef.value.close()
  }
})

function handleDialogClose() {
  emit('update:modelValue', false)
}

function handleBackdropClick(e) {
  if (e.target === dialogRef.value) {
    emit('update:modelValue', false)
  }
}
</script>

<template>
  <dialog
    ref="dialogRef"
    @close="handleDialogClose"
    @click="handleBackdropClick"
    class="fixed inset-0 z-[3000] bg-transparent p-0 m-0 max-w-none max-h-none w-full h-full overflow-hidden outline-none"
  >
    <!-- Center wrapper -->
    <div class="flex items-center justify-center min-h-full p-4">
      <div
        class="w-full max-w-[560px] bg-slate-900/90 backdrop-blur-2xl rounded-2xl border border-white/10 shadow-2xl overflow-hidden flex flex-col max-h-[85vh] transition-all duration-300"
        @click.stop
      >
        <!-- Header -->
        <div class="flex items-center justify-between px-6 py-5 border-b border-white/[0.06] flex-shrink-0">
          <div>
            <h2 class="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span v-if="section === 'privacy'" class="flex items-center gap-2">
                <i class="fa-solid fa-shield-halved text-emerald-400"></i> Kebijakan Privasi
              </span>
              <span v-else class="flex items-center gap-2">
                <i class="fa-solid fa-scroll text-emerald-400"></i> Syarat & Ketentuan
              </span>
            </h2>
            <p class="text-[10px] text-white/40 mt-0.5 uppercase tracking-wider font-semibold">StaySafe.my.id — Peta Indonesia</p>
          </div>
          <button
            @click="emit('update:modelValue', false)"
            class="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-all duration-200 cursor-pointer"
            title="Tutup"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Scrollable Content Area -->
        <div class="p-6 overflow-y-auto custom-scrollbar flex-1 text-slate-300 space-y-6 text-xs leading-relaxed select-text">
          
          <!-- SECTION 1: PRIVACY POLICY -->
          <div v-if="section === 'privacy'" class="space-y-5 animate-fadeIn">
            <div class="p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 text-emerald-400/90 flex gap-3">
              <span class="text-emerald-400 text-sm flex items-center"><i class="fa-solid fa-seedling"></i></span>
              <p class="font-medium text-[11px] leading-relaxed">
                Prinsip utama kami sangat sederhana: <strong>Kami tidak tertarik untuk mengumpulkan data pribadi Anda.</strong> Aplikasi ini dirancang agar sepenuhnya anonim demi kenyamanan bersama.
              </p>
            </div>

            <div class="space-y-3.5">
              <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-user-secret text-emerald-400 text-[11px]"></i> Laporan Anda 100% Anonim
              </h3>
              <ul class="list-disc pl-5 space-y-1.5 text-white/70">
                <li>Kami <strong>tidak meminta</strong> nama, nomor telepon, alamat rumah, atau media sosial Anda saat melapor.</li>
                <li>Data yang kami simpan hanya jenis insiden, deskripsi kejadian, waktu pelaporan, dan koordinat peta lokasi kejadian.</li>
                <li>Laporan Anda akan tampil secara publik di peta tanpa ada informasi identitas siapa pengirimnya.</li>
              </ul>
            </div>

            <div class="space-y-3.5">
              <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-location-crosshairs text-emerald-400 text-[11px]"></i> GPS & Akses Lokasi Anda Aman
              </h3>
              <p class="text-white/70">
                Untuk mempermudah Anda melihat lokasi saat ini (ditandai dengan titik biru berdenyut):
              </p>
              <ul class="list-disc pl-5 space-y-1.5 text-white/70">
                <li>Aplikasi akan meminta izin akses geolokasi/GPS dari browser Anda.</li>
                <li><strong>Secara Teknis:</strong> Lokasi GPS Anda hanya diproses di dalam browser HP atau laptop Anda sendiri. Data lokasi pribadi Anda <strong>tidak pernah dikirim ke server kami dan tidak pernah kami simpan</strong>.</li>
              </ul>
            </div>

            <div class="space-y-3.5">
              <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-envelope text-emerald-400 text-[11px]"></i> Masukan / Saran (Feedback)
              </h3>
              <p class="text-white/70">
                Jika Anda mengirimkan saran, kritik, atau bug melalui tab Saran:
              </p>
              <ul class="list-disc pl-5 space-y-1.5 text-white/70">
                <li>Kolom email bersifat <strong>opsional (tidak wajib)</strong>.</li>
                <li>Alamat email tersebut hanya akan kami gunakan jika kami perlu menghubungi Anda kembali untuk menanggapi masukan Anda.</li>
              </ul>
            </div>

            <div class="space-y-3.5">
              <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-lock text-emerald-400 text-[11px]"></i> Layanan Pihak Ketiga (Peta & Keamanan)
              </h3>
              <p class="text-white/70">
                Agar aplikasi berjalan dengan lancar dan aman, kami menggunakan bantuan luar tepercaya:
              </p>
              <ul class="list-disc pl-5 space-y-1.5 text-white/70">
                <li><strong>Layanan Gambar Peta:</strong> Gambar peta dimuat langsung dari server peta pihak ketiga agar peta interaktif dapat tampil di layar Anda.</li>
                <li><strong>Sistem Keamanan Anti-Spam:</strong> Kami menggunakan sistem pelindung bot di formulir untuk mencegah spam laporan. Sistem ini memverifikasi bahwa Anda manusia asli melalui telemetri browser dasar tanpa melacak riwayat jelajah internet Anda.</li>
                <li><strong>Sistem Dukungan & Donasi (Ko-fi):</strong> Jika Anda membuka tab Dukung, kami memuat modul eksternal dari <strong>Ko-fi</strong> untuk donasi sukarela. Ko-fi memproses data transaksi Anda secara aman jika Anda berdonasi, dan dapat menggunakan <em>cookies</em> fungsional mereka sendiri untuk memfasilitasi pembayaran tersebut.</li>
              </ul>
            </div>
          </div>

          <!-- SECTION 2: TERMS OF SERVICE -->
          <div v-else class="space-y-5 animate-fadeIn">
            <div class="p-4 rounded-xl bg-amber-500/5 border border-amber-500/10 text-amber-400/90 flex gap-3">
              <span class="text-amber-400 text-sm flex items-center"><i class="fa-solid fa-handshake"></i></span>
              <p class="font-medium text-[11px] leading-relaxed">
                Demi kenyamanan dan keselamatan warga Jakarta, mohon untuk mematuhi aturan penggunaan sederhana ini agar informasi tetap akurat dan bermanfaat.
              </p>
            </div>

            <div class="space-y-3.5">
              <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-circle-check text-emerald-400 text-[11px]"></i> Gunakan Secara Bijak & Jujur
              </h3>
              <ul class="list-disc pl-5 space-y-1.5 text-white/70">
                <li><strong>Dilarang Membuat Laporan Palsu (Hoax):</strong> Peta ini dibuat untuk keselamatan publik. Menyebarkan laporan bohong dapat memicu ketakutan massal yang tidak perlu.</li>
                <li><strong>Jaga Kesopanan & Privasi Orang Lain:</strong> Jangan menyebutkan nama pribadi, alamat spesifik seseorang, atau menuduh pihak/kelompok tertentu secara langsung dalam deskripsi laporan.</li>
                <li><strong>Dilarang Merusak Sistem:</strong> Upaya meretas, menyepam laporan secara massal, atau merusak server backend StaySafe sangat dilarang.</li>
              </ul>
            </div>

            <div class="space-y-3.5">
              <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-bell-slash text-rose-500 text-[11px]"></i> Bukan Saluran Darurat Utama
              </h3>
              <p class="text-white/70 font-semibold text-white/90">
                StaySafe.my.id adalah alat pemantauan komunitas dan bukan pengganti layanan darurat instansi berwenang.
              </p>
              <p class="text-white/70">
                Jika Anda sedang berada dalam bahaya nyata atau memerlukan bantuan darurat penyelamatan nyawa secara instan, segera hubungi nomor resmi:
              </p>
              <div class="grid grid-cols-2 gap-3 text-center pt-1">
                <div class="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                  <p class="text-[10px] text-white/40 uppercase">Kepolisian RI</p>
                  <p class="text-sm font-bold text-emerald-400 mt-0.5"><i class="fa-solid fa-phone mr-1"></i> 110</p>
                </div>
                <div class="p-2.5 rounded-xl bg-slate-950/60 border border-white/5">
                  <p class="text-[10px] text-white/40 uppercase">Jakarta Siaga</p>
                  <p class="text-sm font-bold text-emerald-400 mt-0.5"><i class="fa-solid fa-phone mr-1"></i> 112</p>
                </div>
              </div>
            </div>

            <div class="space-y-3.5">
              <h3 class="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <i class="fa-solid fa-scale-balanced text-emerald-400 text-[11px]"></i> Batasan Tanggung Jawab
              </h3>
              <ul class="list-disc pl-5 space-y-1.5 text-white/70">
                <li><strong>Data Crowdsourced:</strong> Karena data peta dikirim oleh masyarakat, pengelola tidak dapat menjamin 100% kebenaran faktual secara instan di lapangan.</li>
                <li><strong>Risiko Penggunaan:</strong> Pengelola website tidak bertanggung jawab atas kerugian fisik, materiil, atau keputusan pribadi yang diambil setelah membaca informasi di website ini. Selalu utamakan logika sehat dan keselamatan pribadi.</li>
              </ul>
            </div>
          </div>

        </div>

        <!-- Footer -->
        <div class="px-6 py-4.5 border-t border-white/[0.06] flex-shrink-0 flex justify-end bg-slate-950/20">
          <button
            @click="emit('update:modelValue', false)"
            class="px-5 py-2.5 bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white rounded-xl font-bold text-xs shadow-md shadow-emerald-500/10 active:scale-95 transition-all duration-200 cursor-pointer"
          >
            Saya Mengerti
          </button>
        </div>
      </div>
    </div>
  </dialog>
</template>

<style scoped>
dialog::backdrop {
  background: rgba(2, 6, 23, 0.7);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

dialog[open] {
  animation: dialogFadeIn 0.35s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes dialogFadeIn {
  from {
    opacity: 0;
    transform: scale(0.96);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-fadeIn {
  animation: fadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Custom premium dark scrollbar styling */
.custom-scrollbar::-webkit-scrollbar {
  width: 5px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 99px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(255, 255, 255, 0.2);
}
</style>
