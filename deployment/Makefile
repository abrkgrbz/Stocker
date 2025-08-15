.PHONY: help test-local coolify-test deploy clean logs health

# Default target
help:
	@echo "Stocker Deployment Commands:"
	@echo "  make test-local   - Test deployment locally"
	@echo "  make coolify-test - Test Coolify compatibility"
	@echo "  make deploy       - Deploy to Coolify"
	@echo "  make clean        - Clean Docker resources"
	@echo "  make logs         - Show logs"
	@echo "  make health       - Health check"

# Test locally
test-local:
	@echo "Testing local deployment..."
	docker compose up -d
	@sleep 10
	@make health

# Test for Coolify
coolify-test:
	@echo "Testing Coolify deployment..."
	docker build -f deployment/Dockerfile.api -t stocker-api-test .
	@echo "✓ Build test passed"

# Deploy to Coolify
deploy:
	@echo "Deploying to Coolify..."
	@echo "1. Push to GitHub: git push origin main"
	@echo "2. In Coolify: Click Deploy button"
	@echo "3. Monitor deployment logs"

# Clean everything
clean:
	docker compose down -v
	docker system prune -af

# Show logs
logs:
	docker compose logs -f

# Health check
health:
	@echo "Checking services..."
	@curl -f http://localhost:5104/health 2>/dev/null && echo "✓ API is healthy" || echo "✗ API is down"
	@docker exec stocker-db pg_isready -U postgres 2>/dev/null && echo "✓ Database is healthy" || echo "✗ Database is down"
	@docker exec stocker-redis redis-cli -a Redis2024! ping 2>/dev/null | grep -q PONG && echo "✓ Redis is healthy" || echo "✗ Redis is down"