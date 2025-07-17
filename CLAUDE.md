# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

LifeControl is an AI-powered personal life management system built with an "Agent First" design philosophy. All functionality is accessible through natural language interaction with an AI assistant that uses a structured tool system.

## Key Architecture Principles

1. **Agent-First Design**: The ChatAgent (lib/agents/chat-agent-v2.ts) is the primary interface. Users interact via natural language, and the agent routes requests to appropriate tools.

2. **Tool Registry Pattern**: All operations are implemented as tools registered in lib/tools/registry.ts. Each tool has:
   - Unique name and category
   - Structured parameters (Zod schemas)
   - Handler function that interacts with the store
   - Type-safe interfaces

3. **State Management**: Zustand store (lib/store.ts) manages all application state with persistence. Domain models include Goal, Project, Task, and Review.

## Common Development Commands

```bash
# Development
npm run dev         # Start development server on localhost:3000

# Build & Production
npm run build       # Create production build
npm run start       # Start production server

# Code Quality
npm run lint        # Run ESLint (errors ignored in builds)
```

## Critical Development Notes

1. **Environment Setup**: 
   - Copy `.env.example` to `.env.local`
   - Add `OPENAI_API_KEY` for AI features to work
   - API key is server-side only (never expose client-side)

2. **Tool Development**:
   - Add new tools to appropriate category file (e.g., lib/tools/project-tools.ts)
   - Register in the tool module's import
   - Follow existing patterns for parameter schemas and handlers
   - Tools must return structured ToolResult objects

3. **TypeScript Configuration**:
   - Strict mode is enabled
   - Path alias: `@/*` maps to repository root
   - Build errors are ignored (see next.config.mjs)

4. **Testing Approach**:
   - Manual testing through ChatAgent interface
   - Test scenarios documented in docs/testing-guide.md
   - No automated test framework currently configured

## Key File Locations

- **Chat Agent**: `lib/agents/chat-agent-v2.ts` - Main AI integration
- **Tool Registry**: `lib/tools/registry.ts` - Central tool management
- **State Store**: `lib/store.ts` - Zustand state management
- **API Route**: `app/api/chat/route.ts` - Chat endpoint
- **UI Components**: `components/ui/` - shadcn/ui components

## Working with the Codebase

1. **Adding Features**:
   - Create tool in appropriate category file
   - Update store if new state is needed
   - UI updates automatically via Zustand subscriptions

2. **Modifying AI Behavior**:
   - System prompt in chat-agent-v2.ts
   - Tool descriptions affect when they're selected
   - Context management in ChatAgent class

3. **UI Development**:
   - Use existing shadcn/ui components
   - Follow Tailwind CSS patterns
   - Components in components/ directory

## Important Constraints

- ESLint and TypeScript errors are ignored during builds
- No automated testing framework - rely on manual testing
- Images are unoptimized for development ease
- Tool handlers must be synchronous (async operations wrapped)

## Development Workflow

1. Make changes to tools/handlers
2. Test via ChatAgent interface
3. Verify state persistence works
4. Check cross-module interactions
5. Run `npm run lint` to catch issues (optional)