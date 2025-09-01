# DEPRECATED Docker Compose Files

These docker-compose files in the root directory are **DEPRECATED** and should not be used.

## Migration Notice

All deployment configurations have been moved to a professional structure under:
```
deployment/coolify/
```

## Old Files (DO NOT USE):
- docker-compose.alertmanager.yml
- docker-compose.api.yml  
- docker-compose.backup.yml
- docker-compose.elasticsearch.yml
- docker-compose.frontend.yml
- docker-compose.grafana.yml
- docker-compose.infrastructure.yml
- docker-compose.mailhog.yml
- docker-compose.minio-coolify.yml
- docker-compose.monitoring-coolify.yml
- docker-compose.prometheus.yml
- docker-compose.rabbitmq.yml
- docker-compose.seq.yml

## New Structure:

Use the organized deployment structure:
```
deployment/coolify/
├── infrastructure/    # Core services (DB, Redis, Seq)
├── applications/      # API and Web apps
├── monitoring/        # Prometheus, Grafana
├── backup/           # Backup solutions
└── scripts/          # Deployment automation
```

## How to Deploy:

1. **Via Coolify UI**: Deploy each service separately
2. **Via Script**: Run `deployment/coolify/scripts/deploy.sh`

## Why Deprecated:

1. **Unorganized**: All files mixed in root directory
2. **No clear deployment order**: Dependencies not clear
3. **Duplicate configurations**: Same services defined multiple times
4. **Not production-ready**: Missing health checks, labels, proper networking

## Action Required:

These files will be removed in the next major version. Please migrate to the new structure.

---
Deprecated: December 2024
Removal planned: v2.0.0