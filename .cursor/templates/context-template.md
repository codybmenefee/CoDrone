# Agent Context Template

## Project Context

**Project**: CoDrone - AI-First Drone Data Copilot
**Architecture**: Modular monorepo with FastAPI backend + React frontend
**Current Phase**: Phase 1 (Core AI Agent + Chat UI)

## Technical Stack

- **Backend**: FastAPI, LangChain, OpenAI, Python 3.11+
- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Agent**: LangChain with OpenAI Functions
- **Tools**: Decorator-based tool registry
- **Storage**: In-memory sessions (Redis planned)

## Code Standards

- **Python**: Black formatting, 88 char line length, type hints
- **TypeScript**: ESLint + Prettier, strict mode
- **Testing**: pytest for backend, vitest for frontend
- **Documentation**: Docstrings, README updates

## Current Architecture

```
apps/
├── api-server/     # FastAPI backend
├── frontend/       # React frontend
packages/
├── agent-tools/    # LangChain tools
data/
└── storage/        # File uploads
```

## Task: [TASK_NAME]

**Description**: [TASK_DESCRIPTION]
**Type**: [Backend/Frontend/Infrastructure/Testing]
**Complexity**: [Simple/Medium/Complex]
**Estimated Time**: [Hours]

### 🎯 Task Objective

[Clear, specific goal for this task]

### 📋 Requirements

- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### 🏗️ Implementation Approach

[Suggested approach with code examples]

### 🔧 Files to Modify

- `path/to/file1.py` - [Specific changes needed]
- `path/to/file2.tsx` - [Specific changes needed]
- `path/to/file3.md` - [Specific changes needed]

### 🧪 Testing Requirements

- [ ] Unit tests for new functionality
- [ ] Integration tests if applicable
- [ ] Manual testing steps
- [ ] Update existing tests if needed

### 📚 References

- [Relevant documentation links]
- [Example code patterns to follow]
- [Similar implementations in the codebase]

## Constraints & Guidelines

- Maintain existing code patterns and conventions
- Follow established naming conventions
- Add appropriate tests for new functionality
- Update documentation where necessary
- Consider backward compatibility
- Use existing error handling patterns
- Follow the established project structure

## Quality Gates

- [ ] Code passes linting (`make lint`)
- [ ] All tests pass (`make test`)
- [ ] Code is properly formatted (`make format`)
- [ ] Documentation is updated
- [ ] No breaking changes to existing APIs
