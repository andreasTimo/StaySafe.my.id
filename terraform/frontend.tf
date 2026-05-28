# ─── StaySafe.my.id — Terraform Cloud Run Frontend ───

# Mendefinisikan Cloud Run Service untuk meluncurkan Frontend Vue 3 + Nginx
resource "google_cloud_run_v2_service" "frontend" {
  name     = "frontend"
  location = var.region
  ingress  = "INGRESS_TRAFFIC_ALL"

  template {
    # Alokasi resource minimal untuk website statis
    max_instance_request_concurrency = 80

    containers {
      # Alamat image Docker di Artifact Registry
      image = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.frontend_repo.repository_id}/frontend-image:latest"

      ports {
        container_port = 8080 # Sesuai dengan EXPOSE port di Dockerfile Nginx kita
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "512Mi"
        }
      }

    }
  }

  depends_on = [
    google_artifact_registry_repository.frontend_repo
  ]
}

# Membuat agar Frontend dapat diakses publik oleh seluruh pengguna internet
resource "google_cloud_run_service_iam_member" "frontend_public" {
  location = google_cloud_run_v2_service.frontend.location
  service  = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
