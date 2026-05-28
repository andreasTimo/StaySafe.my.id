# ─── StaySafe.my.id — Terraform Main Configuration ───

terraform {
  required_version = ">= 1.0.0"
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "~> 5.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}

# 1. Mengaktifkan API Layanan GCP yang Dibutuhkan (Service Enablement)
# Ini adalah inti dari IaC: mengotomatiskan aktivasi API proyek secara otomatis.
resource "google_project_service" "gcp_services" {
  for_each = toset([
    "firestore.googleapis.com",        # Firestore API
    "cloudfunctions.googleapis.com",   # Cloud Functions API
    "run.googleapis.com",              # Cloud Run API
    "cloudbuild.googleapis.com",       # Cloud Build API (untuk build source code)
    "artifactregistry.googleapis.com", # Artifact Registry
    "secretmanager.googleapis.com"     # Secret Manager untuk MongoDB URI
  ])

  project            = var.project_id
  service            = each.key
  disable_on_destroy = false
}

# 2. Membuat Service Account IAM khusus untuk Backend Runtime
resource "google_service_account" "backend_sa" {
  account_id   = "staysafe-backend-sa"
  display_name = "StaySafe Backend Runtime Service Account"
  depends_on   = [google_project_service.gcp_services]
}

# 3. Membuat Google Secret Manager untuk Menyimpan MONGODB_URI Secara Aman
resource "google_secret_manager_secret" "mongodb_uri_secret" {
  secret_id = "staysafe-mongodb-uri"
  replication {
    auto {}
  }
  depends_on = [google_project_service.gcp_services]
}

resource "google_secret_manager_secret_version" "mongodb_uri_secret_version" {
  secret      = google_secret_manager_secret.mongodb_uri_secret.id
  secret_data = var.mongodb_uri
}

# Memberikan hak akses agar Service Account Backend dapat membaca Secret ini
resource "google_secret_manager_secret_iam_member" "secret_accessor" {
  secret_id = google_secret_manager_secret.mongodb_uri_secret.secret_id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.backend_sa.email}"
}

# 4. Mendapatkan Metadata Proyek untuk Mengambil Project Number
data "google_project" "project" {
  project_id = var.project_id
}

# 5. Memberikan Izin 'Service Account User' (iam.serviceAccounts.actAs)
# Ini wajib agar user Anda dan sistem build GCP dapat men-deploy layanan atas nama Service Account ini.
resource "google_service_account_iam_member" "user_act_as" {
  service_account_id = google_service_account.backend_sa.name
  role               = "roles/iam.serviceAccountUser"
  member             = "user:andreastimotius33@gmail.com"
}

resource "google_service_account_iam_member" "cloudbuild_act_as" {
  service_account_id = google_service_account.backend_sa.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:${data.google_project.project.number}@cloudbuild.gserviceaccount.com"
}

resource "google_service_account_iam_member" "gcf_act_as" {
  service_account_id = google_service_account.backend_sa.name
  role               = "roles/iam.serviceAccountUser"
  member             = "serviceAccount:service-${data.google_project.project.number}@gcf-admin-robot.iam.gserviceaccount.com"
}

# 6. Repository Artifact Registry khusus untuk Frontend Docker Image
resource "google_artifact_registry_repository" "frontend_repo" {
  location      = var.region
  repository_id = "staysafe-frontend"
  description   = "Repository untuk Docker Image Frontend StaySafe.my.id"
  format        = "DOCKER"
  depends_on    = [google_project_service.gcp_services]
}


