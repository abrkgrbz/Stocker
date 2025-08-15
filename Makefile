# Makefile for Stocker Project

.PHONY: help build run stop clean logs test migrate

# Variables
DOCKER_COMPOSE = docker-compose
DOCKER_COMPOSE_FILE = docker-compose.yml
DOCKER_COMPOSE_COOLIFY = docker-compose.coolify.yml

# Colors for output
GREEN = \033[0;32m
NC = \033[0m # No Color

help: ## Show this help message
	@echo "$(GREEN)Available commands:$(NC)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-20s %s\n", $$1, $$2}'

build: ## Build all Docker images
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) build

build-coolify: ## Build for Coolify deployment
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_COOLIFY) build

run: ## Run all services
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up -d

run-dev: ## Run in development mode
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) up

stop: ## Stop all services
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down

clean: ## Stop and remove all containers, networks, volumes
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) down -v

logs: ## Show logs for all services
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs -f

logs-api: ## Show API logs
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs -f api

logs-web: ## Show Web logs
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) logs -f web

test: ## Run tests
	@echo "Running API tests..."
	docker exec stocker-api dotnet test

migrate: ## Run database migrations
	docker exec stocker-api dotnet ef database update --context MasterDbContext

migrate-tenant: ## Run tenant database migrations
	docker exec stocker-api dotnet ef database update --context TenantDbContext

backup-db: ## Backup database
	docker exec stocker-postgres pg_dump -U stocker stocker_master > backup_$$(date +%Y%m%d_%H%M%S).sql

restore-db: ## Restore database from backup (usage: make restore-db FILE=backup.sql)
	docker exec -i stocker-postgres psql -U stocker stocker_master < $(FILE)

shell-api: ## Open shell in API container
	docker exec -it stocker-api /bin/bash

shell-web: ## Open shell in Web container
	docker exec -it stocker-web /bin/sh

shell-db: ## Open PostgreSQL shell
	docker exec -it stocker-postgres psql -U stocker stocker_master

restart: ## Restart all services
	$(MAKE) stop
	$(MAKE) run

rebuild: ## Rebuild and restart all services
	$(MAKE) stop
	$(MAKE) build
	$(MAKE) run

status: ## Show status of all services
	$(DOCKER_COMPOSE) -f $(DOCKER_COMPOSE_FILE) ps

env-setup: ## Setup environment file
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(GREEN).env file created from .env.example$(NC)"; \
		echo "Please update the values in .env file"; \
	else \
		echo ".env file already exists"; \
	fi