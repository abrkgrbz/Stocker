# Stocker Deployment Makefile

.PHONY: help build up down restart logs clean test deploy-dev deploy-prod

# Variables
COMPOSE_DEV = docker-compose -f docker-compose.coolify.yml
COMPOSE_PROD = docker-compose -f docker-compose.production.yml
ENV_DEV = --env-file .env.development
ENV_PROD = --env-file .env.production

help: ## Show this help message
	@echo 'Usage: make [target]'
	@echo ''
	@echo 'Available targets:'
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development Commands
dev-build: ## Build development containers
	$(COMPOSE_DEV) $(ENV_DEV) build

dev-up: ## Start development environment
	$(COMPOSE_DEV) $(ENV_DEV) up -d

dev-down: ## Stop development environment
	$(COMPOSE_DEV) down

dev-restart: ## Restart development environment
	$(COMPOSE_DEV) $(ENV_DEV) restart

dev-logs: ## Show development logs
	$(COMPOSE_DEV) logs -f

# Production Commands
prod-build: ## Build production containers
	$(COMPOSE_PROD) $(ENV_PROD) build

prod-up: ## Start production environment
	$(COMPOSE_PROD) $(ENV_PROD) up -d

prod-down: ## Stop production environment
	$(COMPOSE_PROD) down

prod-restart: ## Restart production environment
	$(COMPOSE_PROD) $(ENV_PROD) restart

prod-logs: ## Show production logs
	$(COMPOSE_PROD) logs -f

# Database Commands
db-migrate: ## Run database migrations
	docker exec stocker-api dotnet ef database update --context MasterDbContext
	docker exec stocker-api dotnet ef database update --context TenantDbContext

db-seed: ## Seed database with test data
	docker exec stocker-api dotnet run --seed

db-backup: ## Backup database
	docker exec stocker-db pg_dumpall -U postgres > backup/db_backup_$$(date +%Y%m%d_%H%M%S).sql

db-restore: ## Restore database from backup
	docker exec -i stocker-db psql -U postgres < $(FILE)

# Utility Commands
clean: ## Clean all containers, volumes and images
	docker-compose -f docker-compose.coolify.yml down -v --remove-orphans
	docker-compose -f docker-compose.production.yml down -v --remove-orphans
	docker system prune -af --volumes

test: ## Run tests
	docker exec stocker-api dotnet test

health: ## Check health status
	@echo "Checking services health..."
	@curl -f http://localhost:5104/health || echo "API is down"
	@curl -f http://localhost:3000 || echo "Web is down"
	@docker exec stocker-db pg_isready -U postgres || echo "Database is down"
	@docker exec stocker-redis redis-cli -a Redis2024! ping || echo "Redis is down"

# Deployment Commands
deploy-coolify: ## Deploy to Coolify
	@echo "Deploying to Coolify..."
	@echo "1. Push to GitHub: git push origin main"
	@echo "2. In Coolify Dashboard: Click Deploy"
	@echo "3. Monitor logs in Coolify"

deploy-vps: ## Deploy to VPS manually
	@echo "Deploying to VPS..."
	ssh root@$(VPS_IP) "cd /opt/stocker && git pull && make prod-up"

# Quick Commands
up: dev-up ## Quick start development
down: dev-down ## Quick stop development
logs: dev-logs ## Quick show logs
restart: dev-restart ## Quick restart