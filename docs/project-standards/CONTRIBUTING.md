# Contributing to Canopy Copilot

Thank you for your interest in contributing to Canopy Copilot! This document provides guidelines and information for contributors.

## 🚀 Quick Start

1. **Fork and Clone**

   ```bash
   git clone https://github.com/your-username/CoDrone.git
   cd CoDrone
   ```

2. **Setup Development Environment**

   ```bash
   make install-dev
   cp .env.example .env
   # Edit .env with your API keys
   ```

3. **Create Feature Branch**

   ```bash
   git checkout -b feature/your-feature-name
   ```

4. **Make Changes and Test**

   ```bash
   make quality-check  # Run all checks
   make test           # Run tests
   make start          # Start development servers
   ```

5. **Commit and Push**

   ```bash
   git add .
   git commit -m "feat: add your feature description"
   git push origin feature/your-feature-name
   ```

6. **Create Pull Request**
   - Go to GitHub and create a PR
   - Fill out the PR template
   - Wait for CI checks to pass

## 📋 Development Workflow

### Code Quality Standards

- **Python**: Follow PEP 8, use type hints, maintain 80%+ test coverage
- **TypeScript**: Use strict mode, avoid `any` types, maintain 90%+ test coverage
- **Documentation**: Update README, add docstrings, include examples

### Commit Message Convention

We use [Conventional Commits](https://www.conventionalcommits.org/):

```
type(scope): description

feat(api): add new drone data analysis endpoint
fix(frontend): resolve chat message display issue
docs(readme): update installation instructions
test(backend): add unit tests for file upload
refactor(tools): simplify agent tool registry
```

Types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

### Pre-commit Hooks

The project uses pre-commit hooks to maintain code quality:

```bash
# Install pre-commit hooks
pre-commit install

# Run manually
pre-commit run --all-files
```

### Testing Strategy

- **Unit Tests**: Test individual functions and components
- **Integration Tests**: Test API endpoints and database interactions
- **E2E Tests**: Test complete user workflows
- **Performance Tests**: Test under load and measure response times

## 🏗️ Architecture Guidelines

### Backend (FastAPI)

- Use dependency injection for services
- Implement proper error handling and logging
- Add input validation with Pydantic models
- Use async/await for I/O operations
- Implement rate limiting and security headers

### Frontend (React)

- Use functional components with hooks
- Implement proper error boundaries
- Use TypeScript for type safety
- Follow component composition patterns
- Implement proper loading states

### Agent Tools

- Keep tools focused and single-purpose
- Implement proper error handling
- Add comprehensive documentation
- Include usage examples
- Test with various input scenarios

## 🔧 Development Tools

### Essential Commands

```bash
# Quality Assurance
make quality-check     # Run all checks
make lint             # Lint code
make format           # Format code
make test             # Run tests

# Development
make start            # Start development servers
make start-backend    # Start only backend
make start-frontend   # Start only frontend

# Docker
make docker-build     # Build containers
make docker-run       # Run with Docker
make docker-stop      # Stop containers

# Security
make security-check   # Check dependencies
make security-scan    # Run bandit scan
```

### IDE Setup

**VS Code Extensions:**

- Python
- TypeScript and JavaScript
- ESLint
- Prettier
- GitLens
- Docker

**PyCharm/IntelliJ:**

- Enable type checking
- Configure code formatting
- Set up run configurations

## 🐛 Bug Reports

When reporting bugs, please include:

1. **Environment**: OS, Python version, Node version
2. **Steps to Reproduce**: Clear, step-by-step instructions
3. **Expected vs Actual**: What you expected vs what happened
4. **Logs**: Relevant error messages and stack traces
5. **Screenshots**: If applicable

## 💡 Feature Requests

When requesting features, please include:

1. **Use Case**: What problem does this solve?
2. **Proposed Solution**: How should it work?
3. **Alternatives**: What other approaches were considered?
4. **Mockups**: UI/UX examples if applicable

## 🔒 Security

- Never commit API keys or secrets
- Report security issues privately to the maintainers
- Follow secure coding practices
- Keep dependencies updated

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [React Documentation](https://react.dev/)
- [LangChain Documentation](https://python.langchain.com/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Community

- Join our [Discord](https://discord.gg/canopycopilot)
- Follow us on [Twitter](https://twitter.com/canopycopilot)
- Check out our [Blog](https://blog.canopycopilot.com)

Thank you for contributing to Canopy Copilot! 🚁
