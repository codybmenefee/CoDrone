# 🤖 Agentic Development Framework for CoDrone

This document outlines the optimized workflow for using Cursor background agents to
build features for the CoDrone project.

## 🎯 Overview

The agentic development workflow enables you to:

- **Plan features** with AI as a companion
- **Delegate tasks** to background agents with curated context
- **Track progress** through structured roadmaps and task management
- **Maintain quality** through automated checks and reviews

## 📋 Workflow Overview

```mermaid
1. Feature Planning (AI Companion) → 2. Task Breakdown → 3. Context Curation →
4. Agent Delegation → 5. Review & Integration
```

## 🛠️ Setup Requirements

### 1. Project Structure Enhancements

```bash
# Create agentic development directories
mkdir -p .cursor/agents
mkdir -p .cursor/contexts
mkdir -p .cursor/tasks
mkdir -p .cursor/roadmaps
mkdir -p .cursor/templates
```

### 2. Required Tools

- **Cursor** with background agent capabilities
- **Git** for version control and collaboration
- **Make** for automated workflows (already configured)
- **GitHub Issues/Projects** for task tracking (optional)

## 📝 Feature Planning Process

### Step 1: AI Companion Planning Session

Use this template for feature planning:

```markdown
# Feature Planning Template

## Feature: [Feature Name]

**Priority**: [High/Medium/Low]
**Estimated Effort**: [Story Points/Time]
**Dependencies**: [List any dependencies]

### 🎯 Objective

[Clear, measurable goal]

### 📋 Requirements

- [ ] Requirement 1
- [ ] Requirement 2
- [ ] Requirement 3

### 🏗️ Technical Design

[Architecture decisions, API changes, database schema, etc.]

### 🧪 Acceptance Criteria

- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Criterion 3

### 🔍 Risk Assessment

- **Technical Risks**: [List]
- **Mitigation Strategies**: [List]

### 📊 Success Metrics

- [Metric 1]
- [Metric 2]
```

### Step 2: Task Breakdown

Break features into atomic tasks:

```markdown
# Task Breakdown Template

## Task: [Task Name]

**Type**: [Backend/Frontend/Infrastructure/Testing]
**Complexity**: [Simple/Medium/Complex]
**Estimated Time**: [Hours]

### 🎯 Objective

[Specific, measurable goal]

### 📋 Subtasks

- [ ] Subtask 1
- [ ] Subtask 2
- [ ] Subtask 3

### 🔧 Technical Details

[Code changes, files to modify, APIs to implement]

### 🧪 Testing Requirements

- [ ] Unit tests
- [ ] Integration tests
- [ ] Manual testing

### 📁 Files to Modify

- `path/to/file1.py`
- `path/to/file2.tsx`
- `path/to/file3.md`
```

## 🎭 Context Curation for Agents

### Context Template Structure

````markdown
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

```bash
apps/
├── api-server/ # FastAPI backend
├── frontend/ # React frontend
packages/
├── agent-tools/ # LangChain tools
data/
└── storage/ # File uploads
```
````

## Task-Specific Context

[Add task-specific information here]

## Constraints & Guidelines

- Maintain existing code patterns
- Follow established naming conventions
- Add appropriate tests
- Update documentation
- Consider backward compatibility

## 🚀 Agent Delegation Process

### 1. Create Task Context

```bash
# Generate context for specific task
make agent-context TASK="implement-user-authentication"
```

### 2. Curate Context Prompt

```markdown
# Curated Context for [Task Name]

## 🎯 Task Objective

[Clear, specific goal]

## 📋 Requirements

[Detailed requirements]

## 🏗️ Implementation Approach

[Suggested approach with code examples]

## 🔧 Files to Modify

[List of files with specific changes]

## 🧪 Testing Strategy

[Testing approach and requirements]

## 📚 References

[Links to relevant documentation, examples, etc.]
```

### 3. Delegate to Background Agent

Use Cursor's background agent with the curated context:

```bash
# Example delegation command
cursor agent --context .cursor/contexts/user-auth.md \
  --task "Implement user authentication system"
```

## 📊 Progress Tracking

### Roadmap Management

```markdown
# CoDrone Development Roadmap

## 🎯 Phase 1: Core Platform ✅

- [x] AI Agent with LangChain
- [x] Chat UI with React
- [x] File upload system
- [x] Tool registry
- [x] Session management

## 🚀 Phase 2: Drone Workflow Automation

- [ ] Async background job queue
- [ ] ODM integration
- [ ] NDVI analysis tools
- [ ] GeoTIFF generation
- [ ] Real drone data processing

## 📊 Phase 3: Report Building

- [ ] GrapesJS integration
- [ ] Template system
- [ ] PDF export
- [ ] Custom report components

## 🗺️ Phase 4: Spatial Intelligence

- [ ] Map-based polygon drawing
- [ ] Area calculations
- [ ] Layer annotations
- [ ] GeoJSON storage
```

### Task Status Tracking

```markdown
# Task Status Board

## 🚀 In Progress

- [ ] Task 1: User Authentication
  - **Agent**: Background Agent #1
  - **Started**: 2024-01-15
  - **ETA**: 2024-01-17
  - **Progress**: 60%

## ⏳ Ready for Review

- [ ] Task 2: API Rate Limiting
  - **Agent**: Background Agent #2
  - **Completed**: 2024-01-14
  - **Reviewer**: [Your Name]

## ✅ Completed

- [x] Task 3: File Upload Enhancement
  - **Agent**: Background Agent #3
  - **Completed**: 2024-01-13
  - **Merged**: 2024-01-14
```

## 🔧 Automation Scripts

### Makefile Enhancements

Add these targets to your Makefile:

```bash
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
    @read -p "Enter task description: " task; \
    cursor agent --context .cursor/contexts/$$context --task "$$task"

agent-status: ## Check agent task status
    @echo "Agent Task Status:"
    @ls -la .cursor/tasks/ 2>/dev/null || echo "No tasks found"

roadmap-update: ## Update roadmap with progress
    @echo "Updating roadmap..."
    @date +"%Y-%m-%d" >> .cursor/roadmaps/progress.log
```

## 🎯 Best Practices

### 1. Context Quality

- **Be Specific**: Include exact file paths, function names, and requirements
- **Provide Examples**: Show existing code patterns to follow
- **Set Constraints**: Define what NOT to do
- **Include Context**: Explain why the change is needed

### 2. Task Granularity

- **Atomic Tasks**: Each task should be completable in 2-4 hours
- **Clear Boundaries**: Define start and end points clearly
- **Testable**: Include testing requirements
- **Reviewable**: Tasks should be reviewable as single units

### 3. Progress Tracking

- **Regular Updates**: Update status every 2-4 hours
- **Blockers**: Document any blockers immediately
- **Dependencies**: Track task dependencies
- **Quality Gates**: Define acceptance criteria

### 4. Agent Management

- **Context Rotation**: Use fresh context for each task
- **Feedback Loop**: Provide feedback on agent performance
- **Context Refinement**: Improve context based on results
- **Fallback Plans**: Have manual implementation as backup

## 🚨 Troubleshooting

### Common Issues

1. **Agent Produces Wrong Code**
   - Improve context specificity
   - Add more examples
   - Include error cases

2. **Agent Gets Stuck**
   - Break task into smaller pieces
   - Provide more detailed requirements
   - Add debugging context

3. **Code Quality Issues**
   - Strengthen code standards in context
   - Add linting requirements
   - Include testing requirements

### Quality Assurance

```bash
# Run quality checks after agent work
make quality-check

# Review agent-generated code
make review-agent-code

# Test agent implementations
make test-agent-features
```

## 📚 Resources

- [Cursor Background Agents Documentation](https://cursor.sh/docs)
- [LangChain Agent Development](https://python.langchain.com/docs/use_cases/autonomous_agents/)
- [FastAPI Best Practices](https://fastapi.tiangolo.com/tutorial/best-practices/)
- [React Development Patterns](https://react.dev/learn)

## 🎯 Next Steps

1. **Set up the directory structure** using the provided commands
2. **Create your first context template** for a simple task
3. **Delegate a small task** to test the workflow
4. **Iterate and improve** the context based on results
5. **Scale up** to larger features

---

_This framework is designed to evolve with your project. Update templates, contexts, and
processes based on what works best for your team and project needs._
