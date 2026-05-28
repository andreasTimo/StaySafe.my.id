# ─── StaySafe.my.id — Terraform Cloud Run Functions (Consolidated) ───

# 1. Bucket GCS untuk Menyimpan Source Code Backend sebelum Di-deploy
resource "google_storage_bucket" "source_bucket" {
  name                        = "staysafe-functions-source-${var.project_id}"
  location                    = var.region
  uniform_bucket_level_access = true
  force_destroy               = true # Hapus seluruh isi bucket jika terraform destroy dijalankan
}

# 2. Membuat Arsip ZIP untuk Fungsi API Tunggal Secara Otomatis
data "archive_file" "api_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../backend/api"
  output_path = "${path.module}/files/api.zip"
}

# 3. Mengunggah Berkas ZIP ke Bucket GCS
resource "google_storage_bucket_object" "api_upload" {
  name   = "api-${data.archive_file.api_zip.output_md5}.zip"
  bucket = google_storage_bucket.source_bucket.name
  source = data.archive_file.api_zip.output_path
}

# 4. Mendefinisikan Cloud Run Function (Gen 2) API Tunggal: staysafe-api
resource "google_cloudfunctions2_function" "api" {
  name        = "staysafe-api"
  location    = var.region
  description = "StaySafe API: Monolith Endpoint untuk GET/POST Reports & Stats"

  build_config {
    runtime     = "nodejs22"
    entry_point = "api" # Menunjuk ke exports.api di index.js
    source {
      storage_source {
        bucket = google_storage_bucket.source_bucket.name
        object = google_storage_bucket_object.api_upload.name
      }
    }
  }

  service_config {
    max_instance_count    = 10
    min_instance_count    = 0
    available_memory      = "256Mi"
    timeout_seconds       = 60
    service_account_email = google_service_account.backend_sa.email

    environment_variables = {
      CLOUDFLARE_ZONE_ID   = var.cloudflare_zone_id
      CLOUDFLARE_API_TOKEN = var.cloudflare_api_token
    }

    # Membaca MONGODB_URI dari Secret Manager secara aman!
    secret_environment_variables {
      key        = "MONGODB_URI"
      project_id = var.project_id
      secret     = google_secret_manager_secret.mongodb_uri_secret.secret_id
      version    = "latest"
    }
  }

  depends_on = [
    google_project_service.gcp_services,
    google_secret_manager_secret_iam_member.secret_accessor,
    google_service_account_iam_member.user_act_as,
    google_service_account_iam_member.cloudbuild_act_as,
    google_service_account_iam_member.gcf_act_as
  ]
}

# 5. Mengatur agar Endpoint Cloud Run Functions dapat diakses secara publik (Unauthenticated)
resource "google_cloud_run_service_iam_member" "api_public" {
  location = google_cloudfunctions2_function.api.location
  service  = google_cloudfunctions2_function.api.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
