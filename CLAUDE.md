# Development Guidelines for Claude

## STRICT REQUIREMENTS

### 1. Follow Project Structure
- **ALWAYS** adhere to the directory structure defined in readme.md
- **NEVER** deviate from the established folder organization
- Frontend code goes in `/frontend` directory only
- Backend code goes in `/backend` directory only

### 2. Code Reuse Policy
- **ALWAYS** check for existing code before creating new files
- **REUSE** existing components, utilities, and services completely
- **EXTEND** existing modules rather than creating duplicates
- **NEVER** create new files if functionality already exists

### 3. Modular Code Architecture

#### Frontend (React)
- Components must be modular and reusable
- Place components in appropriate subdirectories:
  - `/frontend/src/components/Chat/` - Chat-related components
  - `/frontend/src/components/Upload/` - Upload-related components
  - `/frontend/src/components/Common/` - Shared/reusable components
- Services for API calls go in `/frontend/src/services/`
- Custom hooks in `/frontend/src/hooks/`
- Utility functions in `/frontend/src/utils/`

#### Backend (FastAPI)
- Strict separation of concerns:
  - `/backend/app/api/routes/` - API endpoint definitions only
  - `/backend/app/core/` - Business logic implementation
  - `/backend/app/services/` - Service layer for complex operations
  - `/backend/app/models/` - Data models and schemas

#### LangChain Integration
- **ISOLATE** LangChain agents in `/backend/app/core/rag/`
- Create separate modules for:
  - Document processing pipelines
  - Embedding generation
  - Vector store operations
  - Query processing
  - Response generation
- Keep LangChain dependencies contained within the RAG module

### 4. API Design
- RESTful endpoints in `/backend/app/api/routes/`
- Clear separation between API routes and business logic
- API routes should only handle:
  - Request validation
  - Calling appropriate services
  - Response formatting
- Business logic must be in services or core modules

### 5. Development Workflow
1. **BEFORE** creating any new file:
   - Search for existing similar functionality
   - Check if the feature can be added to existing modules
   - Review the current codebase structure
2. **WHEN** implementing features:
   - Follow existing patterns and conventions
   - Maintain consistency with current code style
   - Use established utilities and helpers
3. **AFTER** making changes:
   - Ensure code remains modular and reusable
   - Verify adherence to the project structure
   - Check that frontend/backend separation is maintained

### 6. Key Principles
- **Modularity**: Each module should have a single, well-defined purpose
- **Reusability**: Write components and functions that can be used multiple times
- **Separation**: Keep frontend, backend, and LangChain logic strictly separated
- **Consistency**: Follow existing patterns and conventions throughout the codebase

## Testing Commands
- Frontend: `npm run test` (when available)
- Backend: `pytest` (when available)
- Linting: Check package.json and requirements for linting commands

## Design Guidelines

### Color Scheme (DevSwarm Theme)
Use the following color palette inspired by https://devswarm.ai/:
- **Primary Background**: Dark theme with deep blacks (#0A0A0B, #111111)
- **Secondary Background**: Dark grays (#1A1A1B, #222222)
- **Accent Color**: Bright yellow/gold (#FFD700, #FFC107)
- **Text Primary**: White (#FFFFFF) and light gray (#E0E0E0)
- **Text Secondary**: Medium gray (#9CA3AF, #6B7280)
- **Success**: Green (#10B981)
- **Error**: Red (#EF4444)
- **Border Colors**: Dark gray (#2D2D2D, #333333)
- **Hover States**: Slightly lighter backgrounds with accent highlights

### UI Components Style
- Modern, minimalist design with dark theme
- Rounded corners for cards and buttons
- Subtle shadows and borders
- Clean typography with good contrast
- Smooth transitions and hover effects

## Remember
- This is a RAG application for research papers
- All data is stored in-memory (no persistent database)
- Local development only
- Follow the tech stack specified in readme.md