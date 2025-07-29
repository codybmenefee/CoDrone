#!/bin/bash

# CoDrone Professional Development Setup Verification
# This script verifies that all development tools are properly configured and working

set -e

echo "🚁 CoDrone Professional Development Setup Verification"
echo "=================================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print status
print_status() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        if [ "$3" != "" ]; then
            echo -e "${YELLOW}   Note: $3${NC}"
        fi
    fi
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

echo -e "${BLUE}1. Checking Prerequisites...${NC}"
echo "--------------------------------"

# Check Python
if command_exists python3; then
    PYTHON_VERSION=$(python3 --version 2>&1 | cut -d' ' -f2)
    print_status 0 "Python $PYTHON_VERSION found"
else
    print_status 1 "Python 3 not found"
fi

# Check Node.js
if command_exists node; then
    NODE_VERSION=$(node --version 2>&1)
    print_status 0 "Node.js $NODE_VERSION found"
else
    print_status 1 "Node.js not found"
fi

# Check npm
if command_exists npm; then
    NPM_VERSION=$(npm --version 2>&1)
    print_status 0 "npm $NPM_VERSION found"
else
    print_status 1 "npm not found"
fi

# Check Docker
if command_exists docker; then
    DOCKER_VERSION=$(docker --version 2>&1 | cut -d' ' -f3 | sed 's/,//')
    print_status 0 "Docker $DOCKER_VERSION found"
else
    print_status 1 "Docker not found" "Docker is optional but recommended"
fi

# Check Docker Compose
if command_exists docker-compose; then
    COMPOSE_VERSION=$(docker-compose --version 2>&1 | cut -d' ' -f3 | sed 's/,//')
    print_status 0 "Docker Compose $COMPOSE_VERSION found"
else
    print_status 1 "Docker Compose not found" "Docker Compose is optional but recommended"
fi

echo ""
echo -e "${BLUE}2. Checking Project Structure...${NC}"
echo "----------------------------------------"

# Check key files exist
FILES_TO_CHECK=(
    "pyproject.toml"
    "Makefile"
    ".env.example"
    "docker-compose.yml"
    "README.md"
    "CONTRIBUTING.md"
    "SECURITY.md"
    "CODE_OF_CONDUCT.md"
    "CHANGELOG.md"
    ".pre-commit-config.yaml"
    ".github/workflows/ci.yml"
)

for file in "${FILES_TO_CHECK[@]}"; do
    if [ -f "$file" ]; then
        print_status 0 "Found $file"
    else
        print_status 1 "Missing $file"
    fi
done

echo ""
echo -e "${BLUE}3. Checking Dependencies...${NC}"
echo "--------------------------------"

# Check if virtual environment exists
if [ -d "venv" ]; then
    print_status 0 "Virtual environment found"
    source venv/bin/activate
else
    print_status 1 "Virtual environment not found" "Run 'make install-dev' to create one"
fi

# Check if node_modules exists
if [ -d "apps/frontend/node_modules" ]; then
    print_status 0 "Frontend dependencies installed"
else
    print_status 1 "Frontend dependencies not installed" "Run 'make install-dev' to install"
fi

echo ""
echo -e "${BLUE}4. Testing Code Quality Tools...${NC}"
echo "----------------------------------------"

# Test Python formatting
echo "Testing Python code formatting..."
if make format-check >/dev/null 2>&1; then
    print_status 0 "Python formatting check passed"
else
    print_status 1 "Python formatting check failed" "Run 'make format' to fix"
fi

# Test Python linting
echo "Testing Python linting..."
if make lint-backend >/dev/null 2>&1; then
    print_status 0 "Python linting passed"
else
    print_status 1 "Python linting failed" "Check the output above for issues"
fi

# Test frontend formatting
echo "Testing frontend formatting..."
if cd apps/frontend && npm run format:check >/dev/null 2>&1; then
    print_status 0 "Frontend formatting check passed"
else
    print_status 1 "Frontend formatting check failed" "Run 'npm run format' in apps/frontend"
fi
cd ../..

# Test frontend linting
echo "Testing frontend linting..."
if make lint-frontend >/dev/null 2>&1; then
    print_status 0 "Frontend linting passed"
else
    print_status 1 "Frontend linting failed" "Check the output above for issues"
fi

echo ""
echo -e "${BLUE}5. Testing Security Tools...${NC}"
echo "--------------------------------"

# Test security check
echo "Testing security checks..."
if make security-check >/dev/null 2>&1; then
    print_status 0 "Basic security check passed"
else
    print_status 1 "Basic security check failed" "Check the output above for issues"
fi

# Test bandit scan
echo "Testing bandit security scan..."
if make security-scan >/dev/null 2>&1; then
    print_status 0 "Bandit security scan completed"
    if [ -f "bandit-report.json" ]; then
        print_status 0 "Bandit report generated"
    else
        print_status 1 "Bandit report not generated"
    fi
else
    print_status 1 "Bandit security scan failed" "Check if bandit is installed"
fi

echo ""
echo -e "${BLUE}6. Testing Docker Setup...${NC}"
echo "--------------------------------"

# Test Docker build
if command_exists docker; then
    echo "Testing Docker build..."
    if make docker-build >/dev/null 2>&1; then
        print_status 0 "Docker build successful"
    else
        print_status 1 "Docker build failed" "Check Dockerfile configurations"
    fi
else
    print_status 1 "Docker not available" "Skipping Docker tests"
fi

echo ""
echo -e "${BLUE}7. Testing Pre-commit Hooks...${NC}"
echo "--------------------------------------"

# Check if pre-commit is installed
if command_exists pre-commit; then
    print_status 0 "Pre-commit found"

    # Test pre-commit hooks
    echo "Testing pre-commit hooks..."
    if pre-commit run --all-files >/dev/null 2>&1; then
        print_status 0 "Pre-commit hooks passed"
    else
        print_status 1 "Pre-commit hooks failed" "Run 'pre-commit run --all-files' to see details"
    fi
else
    print_status 1 "Pre-commit not found" "Run 'pip install pre-commit && pre-commit install'"
fi

echo ""
echo -e "${BLUE}8. Testing Makefile Commands...${NC}"
echo "----------------------------------------"

# Test key make commands
MAKE_COMMANDS=(
    "help"
    "install-dev"
    "setup"
    "clean"
)

for cmd in "${MAKE_COMMANDS[@]}"; do
    echo "Testing 'make $cmd'..."
    if make "$cmd" >/dev/null 2>&1; then
        print_status 0 "make $cmd works"
    else
        print_status 1 "make $cmd failed"
    fi
done

echo ""
echo -e "${BLUE}9. Summary and Recommendations...${NC}"
echo "----------------------------------------"

echo ""
echo -e "${GREEN}🎉 Verification Complete!${NC}"
echo ""
echo "If you see any ❌ errors above, here's what to do:"
echo ""
echo "1. Install missing dependencies:"
echo "   make install-dev"
echo ""
echo "2. Set up pre-commit hooks:"
echo "   pre-commit install"
echo ""
echo "3. Fix formatting issues:"
echo "   make format"
echo ""
echo "4. Fix linting issues:"
echo "   make lint"
echo ""
echo "5. Run all quality checks:"
echo "   make quality-check"
echo ""
echo "6. Test the full application:"
echo "   make start"
echo ""
echo -e "${BLUE}For more information, see the README.md and CONTRIBUTING.md files.${NC}"
