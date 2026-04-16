# Datenmanagement NoSQL Documentstore – Dokumentation

## 1) Installation und Bereitstellung der Couchbase Instanz

- Docker Compose liegt unter `/home/runner/work/wasd/wasd/docker/docker-compose.yml`.
- Start:
  - `cp /home/runner/work/wasd/wasd/docker/example.env /home/runner/work/wasd/wasd/docker/.env`
  - `cd /home/runner/work/wasd/wasd/docker && docker compose up --build`
- Couchbase UI: `http://<HOST_ODER_PUBLIC_IP>:8091`
- Für verteilte Architektur kann ein Host mit öffentlicher IP genutzt werden; Backend verbindet sich über `COUCHBASE_CONNECTION_STRING`.

## 2) Grundlegende Funktionsweise von Couchbase

- Couchbase ist ein verteilbarer NoSQL Document Store.
- Dokumente werden JSON-basiert in Buckets gespeichert.
- Zugriff erfolgt über SDKs (hier: Spring Data Couchbase).
- Skalierung ist über Clusterknoten möglich (Replikation/Sharding je nach Konfiguration).

## 3) Cluster-Funktionalität

- Ein Cluster kann aus mehreren Nodes bestehen.
- Replikate erhöhen Verfügbarkeit.
- Bei Ausfall eines Knotens bleiben Daten über Replikate verfügbar (abhängig von Replikationsgrad).
- Deployment über öffentliche IP erlaubt externe Services/Nodes anzubinden.

## 4) Implementierung und Dokumentation der CRUD Funktionen

Backend (`/backend`) stellt bereit:
- `GET /api/notes` – Read alle Dokumente
- `POST /api/notes` – Create
- `PUT /api/notes/{id}` – Update
- `DELETE /api/notes/{id}` – Delete

Frontend (`/frontend`) bietet einen einfachen Prototyp zur Bedienung dieser CRUD-Endpunkte.

## 5) Erweiterte Anforderungen

- Verteiltes Deployment der SDK-Implementierung: möglich durch externe Couchbase-Adresse (`COUCHBASE_CONNECTION_STRING`).
- HA-Prototyp: durch Couchbase-Cluster mit Replikation + stateless Backend-Instanzen hinter Reverse Proxy erweiterbar.
- Globale Erreichbarkeit: über Deployment auf Host/VM mit öffentlicher IP und geöffneten Ports.
