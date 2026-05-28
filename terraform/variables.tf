# ─── StaySafe.my.id — Terraform Variables ───

variable "project_id" {
  type        = string
  description = "ID Proyek Google Cloud Anda"
  default     = "staysafe-project-497610"
}

variable "region" {
  type        = string
  description = "Region default untuk resource GCP"
  default     = "asia-southeast2" # Jakarta
}

variable "mongodb_uri" {
  type        = string
  description = "Connection URI Firestore MongoDB-compatible Anda"
  sensitive   = true
}

variable "cloudflare_zone_id" {
  type        = string
  description = "Cloudflare Zone ID untuk domain staysafe.my.id"
  default     = ""
}

variable "cloudflare_api_token" {
  type        = string
  description = "Cloudflare API Token dengan izin Cache Purge"
  default     = ""
  sensitive   = true
}

variable "cloudflare_turnstile_secret_key" {
  type        = string
  description = "Cloudflare Turnstile Secret Key untuk verifikasi server-side"
  default     = ""
  sensitive   = true
}

variable "resend_api_key" {
  type        = string
  description = "API Key Resend untuk pengiriman email feedback"
  default     = ""
  sensitive   = true
}

variable "resend_to_email" {
  type        = string
  description = "Email tujuan penerima feedback"
  default     = "support@staysafe.my.id"
}

variable "resend_from_email" {
  type        = string
  description = "Email pengirim feedback (default onboarding@resend.dev jika belum verifikasi domain)"
  default     = "onboarding@resend.dev"
}
