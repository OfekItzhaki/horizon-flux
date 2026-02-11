<<<<<<< HEAD
# 🏆 Architecture & Excellence Blueprint

This document defines the "Golden Rules" and the architectural standards. It is intended for both human developers and AI agents to ensure consistency, scalability, and high code quality.

## 🏗️ Architectural Pillars

### 1. The "Single Source of Truth" API
- **Tooling**: Use **NSwag** or **OpenAPI** to auto-generate TypeScript clients.
- **Models & Structure**: The auto-generated client should include all **Response Models** and **Request Structures**. Never manually define these in the frontend.
- **Rule**: Whenever the backend DTOs change, re-run the client generator.
- **Benefit**: Zero "type mismatch" bugs.

### 2. Standardized Error Handling
- **Backend**: Use a global `ExceptionMiddleware`. No `try-catch` blocks in controllers unless for very specific logic.
- **Responses**: Always return `ProblemDetails` (RFC 7807).
- **Frontend**: Use a central notification system (e.g., `react-hot-toast`) to display these errors.

### 3. Container-First & Infrastructure-as-Code
- **Docker**: Every core dependency (API, Web, DB, **Redis**) must be in `docker-compose.yml`.
- **Environment**: Use `.env` files for secrets. Use `render.yaml` or similar for cloud infrastructure definition.
- **Rules**: Local dev must be "Plug & Play" with a single `docker-compose up`.

### 4. Background Job & Multi-Channel Delivery
- **Offloading**: Never perform slow operations (Email, external API sync) in the request-response cycle. Use **BullMQ** or similar.
- **Reliability**: Jobs should be retriable and traceable.
- **Fallback**: Implement multi-channel defaults (e.g., WebSocket for real-time, Email for fallback).

### 5. Resilient Session Management
- **UX Requirement**: Users should never be kicked out due to expired short-lived tokens.
- **Pattern**: Implement a 401 Interceptor that triggers an automatic `/auth/refresh` and retries the original request seamlessly.

### 6. Universal State & Caching
- **Standard**: Always use `@tanstack/react-query` for data fetching, caching, and state synchronization.
- **Benefit**: Ensures a "snappy" UI with built-in optimistic updates and automated background refetching.
- **Parity**: All frontends (Web, Mobile, etc.) MUST adopt this to ensure consistent behavior.

### 7. Real-time Communication & Presence
- **Technology**: Use **Socket.IO** for bidirectional, real-time communication.
- **Pattern**: Implement room-based communication for scoped updates (e.g., `enter-list`, `leave-list` events).
- **Use Cases**:
  - Collaborative presence (show active users in a list)
  - Live task updates across clients
  - Instant notifications for shared list changes
- **Mobile Integration**: Use a singleton socket instance to manage persistent connections across screens.
- **Fallback**: Always ensure REST APIs are available as fallback for critical operations.

### 8. Observability & Health Monitoring
- **Structured Logging**: Use **Seq** for visual log search and filtering
  - All logs must be structured (JSON format with contextual properties)
  - Query examples: `Level == "Error" && UserId == "123"`, `@Timestamp > DateTime('2026-02-07')`
  - Enables rapid debugging and production issue diagnosis
- **Health Checks**: Implement `/health` endpoint for orchestration and monitoring
  - Check: Database connectivity, Redis availability, Storage accessibility
  - Return: 200 (Healthy) or 503 (Unhealthy) with diagnostic details
  - Used by: Docker, Kubernetes, load balancers for automated recovery
- **Metrics**: Track request counts, error rates, and response times for performance monitoring
- **Transient Fault Handling**: Implement retries and circuit breakers for infrastructure dependencies
  - API must handle slow database/cache startup via connection retries
  - Services must be self-healing with Docker restart policies
  - Ensures high availability in distributed container environments (ADR 007)
- **Persistence Strategy**: All infrastructure data (DB, Cache, Logs) must persist across restarts via Docker volumes.
=======
# 🏆 The Horizon Standard: Universal Architecture & Excellence Blueprint

This document defines **The Horizon Standard** - a universal set of architectural principles and coding standards for **all software projects**, regardless of platform or technology. It is intended for both human developers and AI agents to ensure consistency, scalability, and high code quality across any codebase.

**The Horizon Standard applies to:**
- Web applications (React, Vue, Angular, etc.)
- Backend services (.NET, Node.js, Python, etc.)
- Mobile applications (React Native, Flutter, etc.)
- Desktop applications
- Any software project that values quality and maintainability

---

## 🏗️ Architectural Pillars

These principles apply to **any project** adopting The Horizon Standard:

### 1. The "Single Source of Truth" API
- **Tooling**: Use **NSwag**, **OpenAPI**, or equivalent code generation tools for your stack.
- **Models & Structure**: Auto-generate client code from API definitions. Never manually define these in the frontend.
- **Rule**: Whenever the backend contracts change, re-run the client generator.
- **Benefit**: Zero "type mismatch" bugs.
- **Applies to**: REST APIs, GraphQL, gRPC, or any API-first architecture.

### 2. Standardized Error Handling
- **Backend**: Use a global error handling middleware. No scattered `try-catch` blocks unless for specific logic.
- **Responses**: Return standardized error formats (e.g., `ProblemDetails` RFC 7807, or equivalent for your stack).
- **Frontend**: Use a central notification system to display errors consistently.
- **Applies to**: Any client-server architecture.

### 3. Container-First & Infrastructure-as-Code
- **Docker**: Every core dependency (API, Web, DB, Cache) should be containerized.
- **Environment**: Use `.env` files for configuration. Use infrastructure-as-code tools (Docker Compose, Kubernetes, Terraform, etc.).
- **Rules**: Local dev must be "Plug & Play" with a single helper script that handles setup and service startup.
- **Applies to**: Any project with multiple services or dependencies.

### 4. Background Job & Multi-Channel Delivery
- **Offloading**: Never perform slow operations (Email, external API sync, heavy processing) in the request-response cycle.
- **Tools**: Use job queues appropriate for your stack (BullMQ for Node.js, Hangfire for .NET, Celery for Python, etc.).
- **Reliability**: Jobs should be retriable and traceable.
- **Fallback**: Implement multi-channel defaults (e.g., WebSocket for real-time, Email for fallback).
- **Applies to**: Any application with async operations or background processing.

### 5. Resilient Session Management
- **UX Requirement**: Users should never be kicked out due to expired short-lived tokens.
- **Pattern**: Implement a 401 Interceptor that triggers an automatic renewal (refresh token) and retries the original request seamlessly.

### 6. Universal State & Caching
- **Standard**: Always use a robust data-fetching library with built-in caching.
- **Examples**: `@tanstack/react-query` (React), SWR (React), Apollo Client (GraphQL), RTK Query (Redux), etc.
- **Benefit**: Ensures a "snappy" UI with built-in optimistic updates and automated background refetching.
- **Parity**: All frontends (Web, Mobile) MUST adopt the same caching logic.
- **Applies to**: Any application with API data fetching.

### 7. Real-time Communication & Presence
- **Technology**: Use appropriate real-time tech for your stack (Socket.IO, SignalR, WebSockets, Server-Sent Events, etc.).
- **Pattern**: Implement room-based/hub-based communication for scoped updates.
- **Mobile Integration**: Use singleton instances for persistent connections across screens.
- **Fallback**: Always ensure REST APIs are available as fallback for critical operations.
- **Applies to**: Any application requiring real-time updates.

### 8. Observability & Health Monitoring
- **Structured Logging**: All logs must be structured (JSON format with contextual properties).
- **Log Aggregation**: Use centralized logging (Seq, ELK Stack, Datadog, CloudWatch, etc.).
- **Health Checks**: Implement `/health` endpoints for orchestration and monitoring.
- **Transient Fault Handling**: Implement retries and circuit breakers for infrastructure dependencies.
- **Persistence Strategy**: All infrastructure data (DB, Cache, Logs) must persist across restarts.
- **Applies to**: Any production application.

### 9. Pluggable Storage Abstraction
- **Abstraction**: Applications must interact with storage via an interface (e.g., `IStorageService`, `StorageAdapter`) rather than direct filesystem/cloud calls.
- **Hybrid Support**: The architecture should support multiple providers (Local Disk, S3, Azure Blob, Cloudinary, etc.) switchable via configuration.
- **Path Resolution**: Use a centralized resolver to handle transitions between relative local paths and absolute production URLs.
- **Applies to**: Any application handling file storage.

### 10. Implementation Excellence & Patterns
- **Standardized Onboarding**: Complex flows must be broken into discrete, verifiable steps.
- **Tooling Automation**: Repetitive developer tasks (setup, verification, seeding) MUST be scripted.
- **Dynamic Infrastructure**: Setup scripts should handle environmental conflicts automatically (port allocation, service health checks, etc.).
- **Self-Healing**: Scripts should clear zombie services/orphans before launch.
- **Applies to**: Any project with complex setup or multiple services.

---
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b

## 🚀 DevOps Workflow Patterns

### Northern Workflow (Build & Test)
- **Goal**: Code quality, formatting, and logical correctness.
<<<<<<< HEAD
- **Tools**: VS Code, PowerShell (`setup-dev.ps1`), GitHub Actions, **Prettier**, **ESLint**.
- **Rule**: Never merge if `npm run format:check`, `npm run lint`, or `npm test` fails.

### Southern Workflow (Docker & Deploy)
- **Goal**: Environment parity and deployment reliability.
- **Tools**: Docker Compose, Health Checks.
- **Rule**: A feature is only "Done" when it passes health checks in the container mesh.

## 🌿 Git & Collaboration
- **Branch Naming**: 
  - `feat/feature-name` (new work)
  - `fix/bug-name` (hotfixes)
  - `chore/task-name` (maintenance)
- **Commit Messages**: Use **Conventional Commits** (e.g., `feat: add folder renaming`).
- **PR Strategy**: Always squash-merge to keep the `main` branch history clean.

### Git Tagging & Semantic Versioning
- **Versioning Standard**: Follow **Semantic Versioning** (SemVer): `MAJOR.MINOR.PATCH`
  - **MAJOR**: Breaking changes (e.g., API contract changes, removed features)
  - **MINOR**: New features, backward-compatible additions
  - **PATCH**: Bug fixes, performance improvements
- **Tag Format**: `v{version}` (e.g., `v1.2.3`)
- **Release Process**:
  1. Update version in relevant `package.json` or version files
  2. Create annotated tag: `git tag -a v1.2.3 -m "Release v1.2.3: Feature parity achieved"`
  3. Push tags: `git push origin v1.2.3`
- **Pre-release Tags**: Use `-alpha`, `-beta`, `-rc` suffixes (e.g., `v2.0.0-beta.1`)
- **Changelog**: Maintain `CHANGELOG.md` with version history using conventional commit groupings

### Commit Strategy & Best Practices
- **Atomic Commits**: Each commit should represent a single logical change
- **Commit Frequency**: Commit after completing each distinct feature, fix, or refactor
- **When to Commit**:
  - After completing a phase or major milestone
  - After fixing a bug or completing a feature
  - Before switching contexts or starting new work
  - At natural breakpoints (end of day, before meetings)
- **Commit Message Format**: Use Conventional Commits
  ```
  <type>(<scope>): <subject>
  
  <body>
  
  <footer>
  ```
  - **Types**: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `perf`
  - **Scope**: Optional, e.g., `mobile`, `backend`, `web`, `auth`
  - **Examples**:
    - `feat(mobile): migrate ListsScreen to TanStack Query`
    - `fix(backend): resolve 401 refresh token race condition`
    - `chore(deps): upgrade @tanstack/react-query to v5.90.16`
- **Multi-file Changes**: Group related changes in a single commit with a descriptive scope
- **Breaking Changes**: Use `BREAKING CHANGE:` in footer or `!` after type/scope

### Merge & Integration Strategy
- **Primary Branch**: `main` (or `master`) is the production-ready branch
- **Development Branch**: `develop` for integration of features before release
- **Merge Methods**:
  - **Squash Merge**: Default for feature branches → `develop` (keeps history clean)
  - **Merge Commit**: For `develop` → `main` (preserves release history)
  - **Rebase**: For keeping feature branches up-to-date with `develop` (use with caution)
- **Before Merging**:
  - Ensure all tests pass (CI/CD green)
  - Resolve all merge conflicts locally
  - Update branch with latest `develop`: `git pull origin develop --rebase`
  - Verify TypeScript compilation: `npx tsc --noEmit`
- **Merge Conflicts**:
  - Always test after resolving conflicts
  - Prefer "ours" for formatting conflicts, "theirs" for dependency updates
  - When in doubt, consult the original PR author

### Push & Pull Policies
- **Push Frequency**: Push at least once per day when actively working
- **Before Pushing**:
  - Run local tests and linters
  - Verify no sensitive data (API keys, tokens) in commits
  - Check `.gitignore` is properly configured
- **Force Push**: ⚠️ **NEVER** force push to `main` or `develop`
  - Only use `git push --force-with-lease` on personal feature branches
  - Communicate with team before force-pushing shared branches
- **Pull Strategy**: Use `git pull --rebase` to avoid unnecessary merge commits
- **Stashing**: Use `git stash` before pulling if you have uncommitted changes

### Branch Protection & Code Review
- **Protected Branches**: `main` and `develop` should require:
  - Pull request reviews (minimum 1 approval)
  - Passing CI/CD checks
  - No direct commits allowed
- **Pull Request Guidelines**:
  - **Title**: Use conventional commit format
  - **Description**: Include:
    - What changed and why
    - Testing performed
    - Screenshots for UI changes
    - Breaking changes (if any)
  - **Size**: Keep PRs under 400 lines when possible (easier to review)
  - **Draft PRs**: Use for work-in-progress to get early feedback
- **Code Review Checklist**:
  - ✅ Follows architectural pillars and golden rules
  - ✅ No `any` types or unsafe casts
  - ✅ Proper error handling with ProblemDetails
  - ✅ Tests included for new features
  - ✅ Documentation updated if needed

### Workflow Patterns
- **Feature Development**:
  ```bash
  git checkout develop
  git pull origin develop
  git checkout -b feat/my-feature
  # ... make changes ...
  git add -A
  git commit -m "feat(scope): description"
  git push origin feat/my-feature
  # Create PR: feat/my-feature → develop
  ```
- **Hotfix for Production**:
  ```bash
  git checkout main
  git pull origin main
  git checkout -b fix/critical-bug
  # ... fix bug ...
  git commit -m "fix(scope): description"
  git push origin fix/critical-bug
  # Create PR: fix/critical-bug → main (and cherry-pick to develop)
  ```
- **Syncing Feature Branch**:
  ```bash
  git checkout feat/my-feature
  git fetch origin
  git rebase origin/develop
  # Resolve conflicts if any
  git push --force-with-lease
  ```

### Git Hygiene & Maintenance
- **Clean Up Merged Branches**:
  ```bash
  git branch -d feat/my-feature  # Delete local
  git push origin --delete feat/my-feature  # Delete remote
  ```
- **Prune Stale References**: `git fetch --prune` regularly
- **Avoid Committing**:
  - `node_modules/`, `dist/`, `build/`
  - `.env` files (use `.env.example` instead)
  - IDE-specific files (`.vscode/`, `.idea/`)
  - Large binary files (use Git LFS if needed)
- **Commit History**: Never rewrite public history (no `git rebase -i` on pushed commits)

## 🛡️ Security & Performance

### Security Headers
Implement these HTTP response headers to protect users from common web attacks:

- **CSP (Content-Security-Policy)**: Controls which resources (scripts, styles, images) can load on your page
  - Prevents: XSS (Cross-Site Scripting) attacks where hackers inject malicious JavaScript
  - Example: `default-src 'self'; script-src 'self' 'unsafe-inline';`
  - Impact: Blocks external malicious scripts from executing

- **X-Frame-Options: DENY**: Prevents your site from being embedded in an `<iframe>`
  - Prevents: Clickjacking attacks where hackers overlay invisible iframes to trick users
  - Impact: Stops attackers from embedding your login page on malicious sites

- **X-Content-Type-Options: nosniff**: Stops browsers from "guessing" file types (MIME-sniffing)
  - Prevents: MIME-sniffing attacks where browsers execute disguised files (e.g., `.txt` as JavaScript)
  - Impact: Forces browsers to respect the declared `Content-Type` header

- **Referrer-Policy: no-referrer**: Controls what information is sent in the `Referer` header
  - Prevents: Leaking sensitive URLs (e.g., password reset links with tokens) to third-party sites
  - Impact: Protects user privacy and prevents token exposure

- **Rate Limiting**: Implement IP-based rate limiting (e.g., 100 requests/minute)
  - Prevents: Brute-force attacks, API abuse, DDoS attempts
  - Impact: Ensures service availability and fair resource usage

### Secrets & Configuration
- **Secrets**: Never commit `.env` files. Use `.env.example` as a template.
- **CORS**: Strictly define allowed origins; never use `*` in production.
- **API Keys**: Store in environment variables or secret management services (Azure Key Vault, AWS Secrets Manager)

## 📜 Naming Conventions & Style
- **NestJS / TypeScript**:
  - DTOs end in `Dto` (`CreateTaskDto.ts`).
  - Handlers follow the `Command/Handler` or `Query/Handler` pattern.
  - Services use `camelCase` for methods and avoid `any` at all costs.
- **C# / .NET (Alternative Standard)**:
  - Interfaces start with `I` (e.g., `IStorageService`).
  - Async methods must end in `Async` (e.g., `SaveFileAsync`).
  - Use file-scoped namespaces.
- **TypeScript/React**:
  - Components use PascalCase (`FolderTree.tsx`).
  - Filenames should match the exported component.
  - Constants use UPPER_SNAKE_CASE.

## 🚫 Anti-Patterns (What NOT to do)
- **Lazy API Calls**: Don't use raw `axios` or `fetch` in components; use the generated client.
- **Fat Controllers**: Controllers should not contain business logic. Logic lives in `Handlers`.
- **ViewBag/ViewData**: In ASP.NET, never use dynamic objects like `ViewBag`. Use strongly-typed ViewModels or MediatR results for compile-time safety.
- **Inline Styles**: Avoid `style={{...}}` in React. Use CSS files or Tailwind.

## 📖 Architecture Decision Records (ADR)
- **ADR 001: Database**: Chose Postgres over SQLite to ensure production/development parity and support complex indexing.
- **ADR 002: Error Handling**: Chose Global Middleware + ProblemDetails to provide a consistent mobile/web-friendly error format.
- **ADR 003: Background Jobs**: Chose BullMQ for task offloading to ensure API responsiveness and job reliability.
- **ADR 004: Observability**: Chose Seq for structured logging over ELK Stack for simplicity and superior developer experience.
- **ADR 005: Caching**: Chose Redis for distributed caching to support horizontal scaling and session management.
- **ADR 006: API Versioning**: Chose URI-based versioning (`/api/v1/`) over header-based for simplicity and API discoverability.
- **ADR 007: Resilience**: Chose connection retries + orchestration health checks to solve container startup race conditions and improve robustness.

## ✅ Gold Standard Verification
The project achieves "Gold Standard" via:
1. **Zero-Error Frontend**: No unused vars, no `any` types, Vite build success.
2. **Standardized Formatting**: `npm run format` (Prettier) and `npm run lint:fix` (ESLint) passed project-wide with zero rule violations.
3. **Stable Infrastructure**: Health checks for all services.
4. **Resilient API**: Transient fault handling for DB/Cache.
5. **Comprehensive Docs**: ARCHITECTURE.md and HORIZON_GUARDIAN.md blueprints.

## 🤖 Future Agent Instructions
1. **Read the Blueprint**: Always check this file before implementing new features.
2. **Modularize First**: If a file exceeds 200 lines, search for extraction points before adding more code.
3. **Audit the "Chain"**: When adding a field to the DB, update the Entity -> DTO -> Handler/Query -> API -> Generated Client.
4. **Horizon Guardian**: This architecture serves as the foundation for the **Horizon Guardian** product—a tool that enforces these standards automatically via AI-powered code audits and mentorship.

---
*Created during the Architectural Overhaul of February 2026.*
*This document powers the Horizon Guardian enforcement engine.*
=======
- **Tools**: IDE, Linters (ESLint, Prettier, etc.), CI/CD (GitHub Actions, GitLab CI, Jenkins, etc.).
- **Rule**: Never merge if formatting checks, linting, or tests fail.
- **Pre-Commit Checklist**:
```bash
# Frontend (TypeScript/React/Vue/etc.)
npm run lint          # Check for linting errors
npm run lint -- --fix # Auto-fix linting errors
npm run build         # Ensure build succeeds

# Backend (.NET)
dotnet build          # Ensure build succeeds
dotnet test           # Run all tests

# Backend (Node.js)
npm run lint
npm run build
npm test

# Backend (Python)
flake8 .              # Linting
pytest                # Tests
```

### Southern Workflow (Docker & Deploy)
- **Goal**: Environment parity and deployment reliability.
- **Rules**: A feature is only "Done" when it passes health checks in the container mesh. All infrastructure MUST be ephemeral-ready.
- **Applies to**: Any containerized application.

### Automated Pre-Commit Testing
- **Goal**: Catch errors before they reach CI/CD, ensuring code quality at commit time.
- **Implementation**: Use Git hooks (Husky) with lint-staged to automatically run tests on changed files.
- **What Runs Automatically**:
  - **Linting**: Auto-fix code style issues
  - **Formatting**: Apply Prettier formatting
  - **Testing**: Run tests for modified files only (`--findRelatedTests`)
- **Benefits**:
  - Prevents broken code from being committed
  - Catches test failures immediately
  - Faster feedback loop than waiting for CI/CD
  - Reduces CI/CD failures and build times
- **Configuration Example** (package.json):
```json
"lint-staged": {
  "src/**/*.{ts,tsx}": [
    "prettier --write",
    "eslint --fix",
    "npm test -- --bail --findRelatedTests"
  ]
}
```
- **Applies to**: Any project with automated testing

---

## 🌿 Git & Collaboration

### Git Tagging & Semantic Versioning
- **Versioning Standard**: Follow **Semantic Versioning** (SemVer): `MAJOR.MINOR.PATCH`.
  - **MAJOR**: Breaking changes, incompatible API changes
  - **MINOR**: New features, backward-compatible
  - **PATCH**: Bug fixes, backward-compatible
- **Automated Management**: Use automation tools to manage versions and changelogs:
  - **Node.js**: semantic-release, standard-version
  - **.NET**: GitVersion, Nerdbank.GitVersioning
  - **Universal**: Google's Release Please, conventional-changelog
- **Rule**: Never manually edit `CHANGELOG.md` files managed by automation.

### Commit & PR Strategy
- **Atomic Commits**: Each commit should represent a single logical change. Commits should be kept short and broken into smaller commits by features. If changes are related or dependent, they should be committed together.
- **Conventional Commits**: Use the `type(scope): description` format
  - **Types**:
    - `feat`: New feature
    - `fix`: Bug fix
    - `chore`: Maintenance tasks (dependencies, config)
    - `refactor`: Code restructuring without behavior change
    - `docs`: Documentation changes
    - `style`: Formatting, whitespace (no code change)
    - `test`: Adding or updating tests
    - `perf`: Performance improvements
    - `ci`: CI/CD changes
    - `build`: Build system changes
  - **Examples**:
    - `feat(ui): add dark mode support`
    - `fix(api): resolve file upload timeout issue`
    - `chore(deps): update dependencies`
    - `refactor(auth): simplify token validation logic`
    - `docs(readme): add installation instructions`
- **Squash Merge**: Default for feature branches to keep history clean.
- **Pre-Commit Requirements**:
  1. Run linting and auto-fix: `npm run lint -- --fix` (Frontend)
  2. Ensure builds succeed: `npm run build` or `dotnet build`
  3. Run tests: `npm test` or `dotnet test`
  4. Stage changes: `git add .`
  5. Commit with conventional format: `git commit -m "type(scope): description"`
  6. Push to remote: `git push`

### Code Review Standards
- **Review Checklist**:
  - ✅ Code follows project conventions and standards
  - ✅ No hardcoded secrets or sensitive data
  - ✅ Proper error handling implemented
  - ✅ Tests included for new functionality
  - ✅ Documentation updated if needed
  - ✅ No unnecessary complexity
  - ✅ Performance considerations addressed
  - ✅ Security best practices followed
- **Review Etiquette**:
  - Be constructive and respectful
  - Explain the "why" behind suggestions
  - Distinguish between blocking issues and suggestions
  - Approve when standards are met, even if you'd do it differently

### Branch Strategy
- **Main/Master**: Production-ready code only
- **Develop**: Integration branch for features
- **Feature Branches**: `feature/description` or `feat/description`
- **Bugfix Branches**: `fix/description` or `bugfix/description`
- **Hotfix Branches**: `hotfix/description` for urgent production fixes
- **Release Branches**: `release/version` for release preparation

---

## 🛡️ Security & Performance Standards

### Security Headers
Every project must implement:
- **CSP (Content-Security-Policy)**: Prevent XSS attacks
- **X-Frame-Options: DENY**: Prevent clickjacking
- **X-Content-Type-Options: nosniff**: Prevent MIME sniffing
- **Referrer-Policy: no-referrer**: Protect user privacy
- **Strict-Transport-Security**: Enforce HTTPS
- **Rate Limiting**: IP-based rate limiting to prevent abuse

### Security Best Practices
- **Authentication**: Use industry-standard auth (OAuth 2.0, JWT, etc.)
- **Authorization**: Implement role-based or attribute-based access control
- **Input Validation**: Validate and sanitize all user inputs
- **SQL Injection**: Use parameterized queries or ORMs
- **XSS Prevention**: Escape output, use Content Security Policy
- **CSRF Protection**: Implement CSRF tokens for state-changing operations
- **Secrets Management**: Never commit secrets, use environment variables or secret managers
- **Dependencies**: Regularly update dependencies and scan for vulnerabilities
- **Logging**: Never log sensitive data (passwords, tokens, PII)

### Performance Standards
- **Response Times**:
  - API endpoints: < 200ms for simple queries, < 1s for complex operations
  - Page load: < 3s for initial load, < 1s for subsequent navigation
- **Caching**: Implement appropriate caching strategies
- **Database**: Use indexes, optimize queries, implement connection pooling
- **Assets**: Minify and compress static assets, use CDN
- **Lazy Loading**: Load resources on-demand when appropriate
- **Monitoring**: Track performance metrics and set up alerts

---

## 📚 Documentation Standards

### README.md Requirements
Every project must have a comprehensive README with:
1. **Project Overview**: What the project does and why it exists
2. **Prerequisites**: Required tools, versions, and dependencies
3. **Installation**: Step-by-step setup instructions
4. **Configuration**: Environment variables and configuration options
5. **Usage**: How to run the project locally
6. **Testing**: How to run tests
7. **Deployment**: How to deploy to production
8. **Contributing**: Guidelines for contributors
9. **License**: Project license information

### Code Documentation
- **Functions/Methods**: Document complex logic, parameters, and return values
  - TypeScript: Use JSDoc comments
  - C#: Use XML documentation comments
  - Python: Use docstrings
  - Java: Use Javadoc
- **Classes**: Document purpose and responsibilities
- **APIs**: Use OpenAPI/Swagger for API documentation
- **Architecture**: Maintain architecture diagrams and ADRs

### Documentation Tools
- **API Docs**: Swagger/OpenAPI, Postman, Insomnia
- **Code Docs**: JSDoc, TSDoc, Sphinx, Doxygen
- **Diagrams**: Mermaid, PlantUML, Draw.io, Lucidchart
- **Wiki**: GitHub Wiki, Confluence, Notion

---

## 📜 Naming Conventions & Style

### TypeScript / React
- **Components**: PascalCase (e.g., `FileList`, `Dashboard`)
- **Files**: Match component name (e.g., `FileList.tsx`)
- **Hooks**: Start with `use` (e.g., `useTheme`, `useAuth`)
- **Types/Interfaces**: PascalCase (e.g., `FileItemDto`, `UserProfile`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `API_BASE_URL`, `MAX_FILE_SIZE`)
- **Functions/Variables**: camelCase (e.g., `handleSubmit`, `isLoading`)

### C# / .NET
- **Namespaces**: Use file-scoped namespaces (C#) and consistent directory structures.
- **Interfaces**: Start with `I` (e.g., `IStorageService`, `IRepository`).
- **Async**: Methods must end in `Async` (e.g., `GetFileAsync`, `SaveAsync`).
- **Classes**: PascalCase (e.g., `FileRepository`, `UserService`)
- **Private Fields**: _camelCase with underscore prefix (e.g., `_dbContext`, `_logger`)
- **Properties**: PascalCase (e.g., `FileName`, `CreatedDate`)

### General Rules
- **No `any` types**: Always use proper TypeScript types
- **Descriptive names**: Use meaningful, self-documenting names
- **Avoid abbreviations**: Unless widely understood (e.g., `id`, `url`, `api`)
- **Consistency**: Follow existing patterns in the codebase

---

## 📖 Architecture Decision Records (ADR)

Projects should document project-specific ADRs separately. **The Horizon Standard** provides recommendations for common architectural decisions:

### Database Selection
- **Relational**: PostgreSQL (preferred), MySQL, SQL Server, Oracle
  - Use for: Transactional data, complex relationships, ACID requirements
- **Document**: MongoDB, CouchDB, DynamoDB
  - Use for: Flexible schemas, hierarchical data, high write throughput
- **Key-Value**: Redis, Memcached
  - Use for: Caching, session storage, real-time data
- **Time-Series**: InfluxDB, TimescaleDB
  - Use for: Metrics, logs, IoT data
- **Graph**: Neo4j, ArangoDB
  - Use for: Social networks, recommendation engines, knowledge graphs

### Observability Stack
- **Logging**:
  - Structured logging (JSON format with context)
  - Tools: Seq, ELK Stack (Elasticsearch, Logstash, Kibana), Datadog, Splunk, CloudWatch
- **Metrics**: Prometheus, Grafana, Application Insights, New Relic
- **Tracing**: Jaeger, Zipkin, OpenTelemetry
- **Health Checks**: Implement `/health` and `/ready` endpoints

### Caching Strategy
- **Distributed**: Redis (preferred), Memcached
  - Use for: Horizontally scalable services, shared cache
- **In-Memory**: Built-in caching (MemoryCache, etc.)
  - Use for: Single-instance applications, simple caching needs
- **CDN**: CloudFlare, AWS CloudFront, Azure CDN
  - Use for: Static assets, global distribution

### Message Queues & Event Streaming
- **Message Queues**: RabbitMQ, AWS SQS, Azure Service Bus
  - Use for: Task queues, async processing, decoupling services
- **Event Streaming**: Apache Kafka, AWS Kinesis, Azure Event Hubs
  - Use for: Event sourcing, real-time analytics, high-throughput events
- **Pub/Sub**: Redis Pub/Sub, Google Pub/Sub, MQTT
  - Use for: Real-time notifications, lightweight messaging

### API Architecture
- **REST**: Standard HTTP APIs with JSON
  - Use for: CRUD operations, public APIs, simple integrations
- **GraphQL**: Query language for APIs
  - Use for: Complex data requirements, mobile apps, flexible queries
- **gRPC**: High-performance RPC framework
  - Use for: Microservices communication, high-performance needs
- **WebSockets/SignalR**: Real-time bidirectional communication
  - Use for: Chat, notifications, live updates

### Authentication & Authorization
- **JWT**: JSON Web Tokens for stateless auth
- **OAuth 2.0**: For third-party integrations
- **OpenID Connect**: For identity layer on top of OAuth 2.0
- **Session-based**: For traditional web applications
- **API Keys**: For service-to-service communication

### Storage Solutions
- **Object Storage**: AWS S3, Azure Blob Storage, Google Cloud Storage, Cloudinary
  - Use for: Files, images, videos, backups
- **File System**: Local disk, NFS, SMB
  - Use for: Development, small-scale deployments
- **CDN**: For global content delivery

### Background Jobs
- **Node.js**: BullMQ, Agenda, Bee-Queue
- **.NET**: Hangfire, Quartz.NET
- **Python**: Celery, RQ (Redis Queue)
- **Java**: Quartz, Spring Batch

---

## 🧪 Testing Standards

### Unit Testing
- **Coverage**: Aim for 80%+ code coverage on business logic
- **Naming**: Test names should describe what is being tested and expected outcome
  - Example: `test_user_login_with_invalid_credentials_returns_401`
  - Example: `should_throw_error_when_file_not_found`
- **Arrange-Act-Assert**: Follow AAA pattern for test structure
- **Isolation**: Tests should be independent and not rely on execution order

### Integration Testing
- **API Tests**: Test all API endpoints with various scenarios
- **Database Tests**: Use test databases or in-memory databases
- **External Services**: Mock external dependencies appropriately

### End-to-End Testing
- **Critical Paths**: Test main user journeys
- **Tools**: Use appropriate E2E tools (Playwright, Cypress, Selenium, etc.)
- **CI Integration**: E2E tests should run in CI pipeline

### Testing Tools by Stack
- **JavaScript/TypeScript**: Jest, Vitest, Mocha, Chai, Testing Library
- **.NET**: xUnit, NUnit, MSTest, Moq, FluentAssertions
- **Python**: pytest, unittest, mock
- **Java**: JUnit, Mockito, TestNG

---

## ✅ Gold Standard Verification

### Frontend (TypeScript/React/Vue/Angular)
1. **Zero-Error Build**: Build command succeeds without errors
   - React/Vue: `npm run build`
   - Angular: `ng build`
2. **Zero `any` Types**: No `any` types in codebase (except auto-generated files)
3. **Linting Passes**: Linting returns 0 errors
   - ESLint: `npm run lint`
   - TSLint: `tslint --project .`
4. **Formatted Code**: Code formatted with Prettier or equivalent
   - Auto-fix: `npm run lint -- --fix` or `prettier --write .`
5. **Type Safety**: All props, state, and API responses properly typed
6. **Tests Pass**: All unit and integration tests passing
   - Jest/Vitest: `npm test`
   - Karma: `ng test`

### Backend (.NET)
1. **Zero-Error Build**: `dotnet build` succeeds without errors
2. **Tests Pass**: `dotnet test` all tests passing
3. **No Warnings**: Build produces no warnings (or only acceptable warnings)
4. **Proper DI**: All dependencies injected via constructor
5. **CQRS Pattern**: Commands and Queries properly separated (if applicable)
6. **Validation**: FluentValidation or Data Annotations properly implemented

### Backend (Node.js)
1. **Zero-Error Build**: `npm run build` or `tsc` succeeds without errors
2. **Tests Pass**: `npm test` all tests passing
3. **Linting Passes**: `npm run lint` returns 0 errors
4. **Type Safety**: Proper TypeScript types throughout
5. **Error Handling**: Centralized error middleware implemented

### Backend (Python)
1. **Zero-Error Build**: No syntax errors, imports resolve
2. **Tests Pass**: `pytest` all tests passing
3. **Linting Passes**: `flake8 .` or `pylint` returns 0 errors
4. **Type Hints**: Type hints used throughout (checked with `mypy`)
5. **Formatting**: Code formatted with `black` or `autopep8`

### Infrastructure
1. **Stable Infrastructure**: Health checks green for all services
2. **Container Orchestration**: All services start successfully
   - Docker Compose: `docker-compose up`
   - Kubernetes: `kubectl get pods` all running
3. **Environment Parity**: Local dev matches production architecture
4. **Logs Structured**: All logs in JSON format with context
5. **Secrets Management**: No hardcoded secrets, using environment variables or secret managers

### General
1. **Standardized Formatting**: Ruleset-compliant project-wide
2. **Conventional Commits**: All commits follow `type(scope): description` format
3. **Documentation**: README and architecture docs up to date
4. **Security**: Security headers and best practices implemented
5. **Performance**: No obvious performance bottlenecks or anti-patterns

---

## 🤖 AI Agent Instructions

### Before Starting Work
1. **Read the Blueprint**: Always check this file first to understand the standards
2. **Check Steering Files**: Review `.kiro/steering/` or equivalent for project-specific rules
3. **Understand the Stack**: Identify the technology stack (Frontend framework, Backend language, Database, etc.)
4. **Review Existing Code**: Look at existing patterns and conventions in the codebase
5. **Check Dependencies**: Understand what libraries and tools are already in use

### During Development
1. **Follow Patterns**: Use existing code patterns as reference - consistency is key
2. **Type Everything**:
   - TypeScript: No `any` types - use proper types
   - Python: Use type hints
   - C#: Use strong typing
   - Java: Use generics appropriately
3. **Modularize First**: If a file exceeds 200 lines, extract logic into smaller modules
4. **Audit the Chain**: Ensure changes propagate correctly:
   - Backend: Entity → DTO → Handler/Service → API → Client
   - Frontend: API Client → State Management → Component → UI
5. **Test Locally**: Run builds and tests before committing
6. **Error Handling**: Implement proper error handling at every layer
7. **Security First**: Never commit secrets, always validate inputs, follow security best practices

### Before Committing

**CRITICAL**: Always run these checks before committing:

#### Frontend (JavaScript/TypeScript)
```bash
# React/Vue/Angular
npm run lint -- --fix  # Auto-fix linting errors
npm run build          # Ensure build succeeds
npm test               # Run tests (if applicable)
```

#### Backend (.NET)
```bash
dotnet build           # Ensure build succeeds
dotnet test            # Run all tests
```

#### Backend (Node.js)
```bash
npm run lint -- --fix  # Auto-fix linting errors
npm run build          # Compile TypeScript
npm test               # Run tests
```

#### Backend (Python)
```bash
flake8 .               # Check linting
black .                # Format code
pytest                 # Run tests
mypy .                 # Type checking
```

#### Git Workflow
```bash
git add .
git commit -m "type(scope): description"
git push
```

### Code Quality Checklist
Before marking any task as complete, verify:
- ✅ **No type shortcuts**: No `any` types (TS), proper type hints (Python), strong typing (C#/Java)
- ✅ **Proper error handling**: Centralized error handling, no silent failures
- ✅ **Follows naming conventions**: Consistent with project standards
- ✅ **Uses dependency injection**: Services properly injected, not instantiated
- ✅ **Implements validation**: Input validation at API boundaries
- ✅ **Passes linting**: Zero linting errors
- ✅ **Builds successfully**: No build errors or warnings
- ✅ **Tests pass**: All unit and integration tests passing
- ✅ **Committed properly**: Conventional commit format used
- ✅ **Security checked**: No secrets, proper authentication/authorization
- ✅ **Performance considered**: No obvious bottlenecks or anti-patterns

### Common Pitfalls to Avoid
1. **Don't skip linting**: Always run and fix linting errors before committing
2. **Don't use `any`**: Take the time to define proper types
3. **Don't hardcode values**: Use configuration files and environment variables
4. **Don't ignore errors**: Implement proper error handling and logging
5. **Don't break patterns**: Follow existing architectural patterns in the codebase
6. **Don't commit secrets**: Use environment variables or secret managers
7. **Don't skip tests**: Write tests for new functionality
8. **Don't create god classes**: Keep classes and functions focused and small

### When Stuck
1. **Review similar code**: Look for similar functionality already implemented
2. **Check documentation**: Review API docs, library docs, and project docs
3. **Ask for clarification**: If requirements are unclear, ask the user
4. **Start simple**: Implement the simplest solution first, then refactor
5. **Test incrementally**: Test each piece as you build it

---

## 🎯 Summary: Definition of Done

A feature or task is only considered "Done" when ALL of the following are met:

### Code Quality
- ✅ Code builds without errors
- ✅ All tests pass
- ✅ Linting passes with 0 errors
- ✅ Code formatted according to project standards
- ✅ No type shortcuts (no `any` in TypeScript, proper type hints in Python, etc.)
- ✅ Follows naming conventions
- ✅ Proper error handling implemented
- ✅ Security best practices followed

### Testing
- ✅ Unit tests written for new functionality
- ✅ Integration tests for API endpoints
- ✅ Edge cases covered
- ✅ All tests passing

### Documentation
- ✅ Code comments for complex logic
- ✅ API documentation updated (if applicable)
- ✅ README updated (if applicable)
- ✅ Architecture docs updated (if applicable)

### Git & Deployment
- ✅ Committed with conventional commit format
- ✅ Pushed to remote repository
- ✅ Passes CI/CD pipeline
- ✅ Health checks pass in containerized environment (if applicable)

### Review
- ✅ Code reviewed by at least one other developer (if team project)
- ✅ All review comments addressed
- ✅ Approved for merge

---

*The Horizon Standard - Universal Architecture & Excellence Blueprint*  
*Created February 2026*  
*Version 1.0*

**This document is designed to be copied and adapted for any software project.**  
**Customize the technology-specific sections while maintaining the core principles.**
>>>>>>> 4145321f585625a9ce6a1ccd658b6879607bb25b
