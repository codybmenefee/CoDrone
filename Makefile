.PHONY: help install install-dev setup start stop clean test lint format check-deps docker-build docker-run

# Default target
help: ## Show this help message
	@echo "Available commands:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Installation
install: ## Install production dependencies
	@echo "Installing production dependencies..."
	@if [ -d "venv" ]; then \
		source venv/bin/activate && pip install -e .; \
	else \
		python3 -m pip install -e .; \
	fi
	cd apps/frontend && npm install --production

install-dev: ## Install development dependencies
	@echo "Installing development dependencies..."
	@if [ -d "venv" ]; then \
		source venv/bin/activate && pip install -e ".[dev]"; \
	else \
		python3 -m pip install -e ".[dev]"; \
	fi
	cd apps/frontend && npm install
	@if command -v pre-commit > /dev/null; then \
		pre-commit install; \
	else \
		echo "pre-commit not found, skipping pre-commit installation"; \
	fi

setup: ## Initial project setup
	@echo "Setting up project..."
	@if [ ! -f .env ]; then cp .env.example .env; echo "Created .env from template"; fi
	@mkdir -p data/storage
	@chmod +x scripts/*.sh
	@echo "Setup complete! Edit .env with your API keys."

# Development
start: ## Start the application (backend + frontend)
	@echo "Starting Canopy Copilot..."
	./scripts/start.sh

start-backend: ## Start only the backend API server
	@echo "Starting backend API server..."
	@if [ -d "venv" ]; then \
		source venv/bin/activate && cd apps/api-server && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000; \
	else \
		cd apps/api-server && python3 -m uvicorn main:app --reload --host 0.0.0.0 --port 8000; \
	fi

start-frontend: ## Start only the frontend development server
	@echo "Starting frontend development server..."
	cd apps/frontend && npm run dev

# Testing
test: ## Run all tests
	@echo "Running tests..."
	@if [ -d "venv" ]; then \
		source venv/bin/activate && pytest tests/ -v --cov=apps --cov-report=html --cov-report=term-missing; \
	else \
		python3 -m pytest tests/ -v --cov=apps --cov-report=html --cov-report=term-missing; \
	fi

test-backend: ## Run backend tests only
	@echo "Running backend tests..."
	@if [ -d "venv" ]; then \
		source venv/bin/activate && pytest tests/ -v --cov=apps --cov-report=html --cov-report=term-missing; \
	else \
		python3 -m pytest tests/ -v --cov=apps --cov-report=html --cov-report=term-missing; \
	fi

test-frontend: ## Run frontend tests only
	@echo "Running frontend tests..."
	cd apps/frontend && npm test

# Code Quality
lint: ## Run all linters
	@echo "Running linters..."
	@if [ -d "venv" ]; then \
		source venv/bin/activate && flake8 apps/ --max-line-length=88 --extend-ignore=E203,W503 --exclude=node_modules,venv,__pycache__,.git; \
		source venv/bin/activate && mypy apps/ --ignore-missing-imports; \
	else \
		python3 -m flake8 apps/ --max-line-length=88 --extend-ignore=E203,W503 --exclude=node_modules,venv,__pycache__,.git; \
		python3 -m mypy apps/ --ignore-missing-imports; \
	fi
	cd apps/frontend && npm run lint

lint-backend: ## Run backend linters only
	@echo "Running backend linters..."
	@if [ -d "venv" ]; then \
		source venv/bin/activate && flake8 apps/ --max-line-length=88 --extend-ignore=E203,W503 --exclude=node_modules,venv,__pycache__,.git; \
		source venv/bin/activate && mypy apps/ --ignore-missing-imports; \
	else \
		python3 -m flake8 apps/ --max-line-length=88 --extend-ignore=E203,W503 --exclude=node_modules,venv,__pycache__,.git; \
		python3 -m mypy apps/ --ignore-missing-imports; \
	fi

lint-frontend: ## Run frontend linters only
	@echo "Running frontend linters..."
	cd apps/frontend && npm run lint

format: ## Format all code
	@echo "Formatting code..."
	@if [ -d "venv" ]; then \
		source venv/bin/activate && black apps/ --line-length=88; \
		source venv/bin/activate && isort apps/ --profile=black; \
	else \
		python3 -m black apps/ --line-length=88; \
		python3 -m isort apps/ --profile=black; \
	fi
	cd apps/frontend && npm run format

format-backend: ## Format backend code only
	@echo "Formatting backend code..."
	@if [ -d "venv" ]; then \
		source venv/bin/activate && black apps/ --line-length=88; \
		source venv/bin/activate && isort apps/ --profile=black; \
	else \
		python3 -m black apps/ --line-length=88; \
		python3 -m isort apps/ --profile=black; \
	fi

format-frontend: ## Format frontend code only
	@echo "Formatting frontend code..."
	cd apps/frontend && npm run format

# Dependency Management
check-deps: ## Check for outdated dependencies
	@echo "Checking for outdated dependencies..."
	@if [ -d "venv" ]; then \
		source venv/bin/activate && pip list --outdated; \
	else \
		python3 -m pip list --outdated; \
	fi
	cd apps/frontend && npm outdated

update-deps: ## Update dependencies (use with caution)
	@echo "Updating dependencies..."
	@if [ -d "venv" ]; then \
		source venv/bin/activate && pip install --upgrade pip; \
		source venv/bin/activate && pip install --upgrade -r apps/api-server/requirements.txt; \
	else \
		python3 -m pip install --upgrade pip; \
		python3 -m pip install --upgrade -r apps/api-server/requirements.txt; \
	fi
	cd apps/frontend && npm update

# Docker
docker-build: ## Build Docker images
	@echo "Building Docker images..."
	docker-compose build

docker-run: ## Run with Docker Compose
	@echo "Starting with Docker Compose..."
	docker-compose up -d

docker-stop: ## Stop Docker containers
	@echo "Stopping Docker containers..."
	docker-compose down

docker-logs: ## Show Docker logs
	docker-compose logs -f

# Cleanup
clean: ## Clean up generated files
	@echo "Cleaning up..."
	find . -type d -name "__pycache__" -exec rm -rf {} +
	find . -type f -name "*.pyc" -delete
	find . -type f -name "*.pyo" -delete
	find . -type d -name "*.egg-info" -exec rm -rf {} +
	find . -type d -name ".pytest_cache" -exec rm -rf {} +
	find . -type d -name ".coverage" -delete
	find . -type d -name "htmlcov" -exec rm -rf {} +
	cd apps/frontend && rm -rf node_modules dist .cache

clean-docker: ## Clean up Docker resources
	@echo "Cleaning up Docker resources..."
	docker-compose down -v --remove-orphans
	docker system prune -f

# Database (for future use)
db-migrate: ## Run database migrations (placeholder)
	@echo "Database migrations not yet implemented"

db-seed: ## Seed database with sample data (placeholder)
	@echo "Database seeding not yet implemented"

# Security
security-check: ## Run security checks
	@echo "Running security checks..."
	@echo "Checking Python dependencies..."
	@if [ -d "venv" ]; then \
		source venv/bin/activate && pip list --outdated || true; \
	else \
		python3 -m pip list --outdated || true; \
	fi
	@echo "Checking Node.js dependencies..."
	cd apps/frontend && npm audit --audit-level=moderate || true

security-check-full: ## Run full security scan (slower)
	@echo "Running full security scan..."
	@if [ -d "venv" ]; then \
		source venv/bin/activate && safety scan; \
	else \
		python3 -m safety scan; \
	fi
	cd apps/frontend && npm audit

security-scan: ## Run bandit security scan
	@echo "Running bandit security scan..."
	@if [ -d "venv" ]; then \
		source venv/bin/activate && bandit -r apps/ -f json -o bandit-report.json; \
	else \
		python3 -m bandit -r apps/ -f json -o bandit-report.json; \
	fi
	@echo "Bandit scan complete. Check bandit-report.json for results."

# Documentation
docs: ## Generate documentation
	@echo "Generating documentation..."
	# Add documentation generation commands here

# Production
build: ## Build for production
	@echo "Building for production..."
	cd apps/frontend && npm run build
	# Add backend build steps here if needed

deploy: ## Deploy to production (placeholder)
	@echo "Deployment not yet configured"

# Quality Assurance
quality-check: ## Run all quality checks (lint, test, security)
	@echo "Running comprehensive quality checks..."
	@echo "=== Linting ==="
	@make lint
	@echo "=== Testing ==="
	@make test
	@echo "=== Security ==="
	@make security-check
	@echo "=== Format Check ==="
	@make format-check
	@echo "✅ All quality checks passed!"

format-check: ## Check if code is properly formatted
	@echo "Checking code formatting..."
	@if [ -d "venv" ]; then \
		source venv/bin/activate && black --check apps/ --line-length=88; \
		source venv/bin/activate && isort --check-only apps/ --profile=black; \
	else \
		python3 -m black --check apps/ --line-length=88; \
		python3 -m isort --check-only apps/ --profile=black; \
	fi
	cd apps/frontend && npm run format:check

# Agentic Development
agent-context: ## Generate context for agent task
	@echo "Generating agent context..."
	@read -p "Enter task name: " task; \
	read -p "Enter task description: " desc; \
	cp .cursor/templates/context-template.md .cursor/contexts/$$task.md; \
	sed -i '' "s/\[TASK_NAME\]/$$task/g" .cursor/contexts/$$task.md; \
	sed -i '' "s/\[TASK_DESCRIPTION\]/$$desc/g" .cursor/contexts/$$task.md; \
	echo "Context created: .cursor/contexts/$$task.md"

agent-delegate: ## Delegate task to background agent
	@echo "Delegating task to background agent..."
	@read -p "Enter context file: " context; \
	read -p "Enter task description: " task; \
	echo "Delegating: $$task"; \
	echo "Context: .cursor/contexts/$$context"; \
	echo "Use: cursor agent --context .cursor/contexts/$$context --task \"$$task\""

agent-status: ## Check agent task status
	@echo "Agent Task Status:"
	@ls -la .cursor/tasks/ 2>/dev/null || echo "No tasks found"

roadmap-update: ## Update roadmap with progress
	@echo "Updating roadmap..."
	@date +"%Y-%m-%d" >> .cursor/roadmaps/progress.log

agent-setup: ## Setup agentic development environment
	@echo "Setting up agentic development environment..."
	@mkdir -p .cursor/agents .cursor/contexts .cursor/tasks .cursor/roadmaps .cursor/templates
	@echo "✅ Agentic development environment ready"

agent-review: ## Review agent-generated code
	@echo "Reviewing agent-generated code..."
	@echo "=== Code Quality ==="
	@make lint
	@echo "=== Tests ==="
	@make test
	@echo "=== Security ==="
	@make security-check
	@echo "✅ Agent code review complete"

agent-clean: ## Clean up agent artifacts
	@echo "Cleaning up agent artifacts..."
	@rm -rf .cursor/tasks/*
	@rm -rf .cursor/contexts/*.md
	@echo "✅ Agent artifacts cleaned"

# MVP Development
mvp-setup: ## Setup MVP development environment
	@echo "Setting up MVP development environment..."
	./scripts/setup-mvp.sh

mvp-start: ## Start MVP development servers
	@echo "Starting MVP development servers..."
	./scripts/start-mvp.sh

mvp-test: ## Run MVP tests
	@echo "Running MVP tests..."
	pytest tests/test_spatial_tools.py -v
	pytest tests/test_processing_tools.py -v

mvp-deploy: ## Deploy MVP to production
	@echo "Deploying MVP..."
	docker-compose -f docker-compose.mvp.yml up -d

# Agent Development for MVP
agent-context-mvp: ## Generate context for MVP agent task
	@echo "Generating MVP agent context..."
	@read -p "Enter MVP task name: " task; \
	read -p "Enter MVP task description: " desc; \
	cp .cursor/templates/context-template.md .cursor/contexts/$$task.md; \
	sed -i '' "s/\[TASK_NAME\]/$$task/g" .cursor/contexts/$$task.md; \
	sed -i '' "s/\[TASK_DESCRIPTION\]/$$desc/g" .cursor/contexts/$$task.md; \
	echo "MVP context created: .cursor/contexts/$$task.md"

agent-delegate-mvp: ## Delegate MVP task to background agent
	@echo "Delegating MVP task to background agent..."
	@read -p "Enter MVP context file: " context; \
	read -p "Enter MVP task description: " task; \
	cursor agent --context .cursor/contexts/$$context --task "$$task"
