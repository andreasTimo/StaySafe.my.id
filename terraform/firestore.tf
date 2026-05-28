# ─── StaySafe.my.id — Terraform Firestore Indexes ───

# Mendefinisikan Composite Index untuk koleksi 'reports' secara otomatis.
# Sangat praktis! Menghilangkan kebutuhan untuk membuat index satu-per-satu di GCP Console.
resource "google_firestore_index" "reports_category_created_at" {
  project    = var.project_id
  database   = "staysafe" # Nama database Firestore Anda
  collection = "reports"

  # Field 1: category (Menaik / ASCENDING)
  fields {
    field_path = "category"
    order      = "ASCENDING"
  }

  # Field 2: createdAt (Menurun / DESCENDING)
  fields {
    field_path = "createdAt"
    order      = "DESCENDING"
  }

  # Menjamin API Firestore sudah aktif sebelum membuat index
  depends_on = [google_project_service.gcp_services["firestore.googleapis.com"]]
}
