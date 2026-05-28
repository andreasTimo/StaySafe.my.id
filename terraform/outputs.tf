# ─── StaySafe.my.id — Terraform Outputs ───

# Menampilkan URL HTTPS dari fungsi API tunggal yang berhasil dideploy.
# Sangat praktis untuk langsung disalin ke konfigurasi frontend!

output "api_url" {
  value       = google_cloudfunctions2_function.api.url
  description = "URL endpoint tunggal untuk API StaySafe.my.id (staysafe-api)"
}

output "backend_service_account_email" {
  value       = google_service_account.backend_sa.email
  description = "Email dari Service Account Runtime Backend"
}

output "frontend_url" {
  value       = google_cloud_run_v2_service.frontend.uri
  description = "URL HTTPS publik untuk mengakses website Frontend StaySafe.my.id"
}
