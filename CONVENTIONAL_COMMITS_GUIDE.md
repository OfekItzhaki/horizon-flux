# Conventional Commits Guide

## Overview

This project uses **Conventional Commits** with **release-please** for automatic version management. When you merge commits to `main` with conventional commit messages, release-please will automatically:

1. Analyze your commits
2. Determine the appropriate version bump (patch/minor/major)
3. Create a release PR with updated versions and changelogs
4. When you merge the release PR, it creates a GitHub release

## Commit Message Format

```
<type>(<scope>): <subject>

[optional body]

[optional footer]
```

### Types

- **`feat:`** - New feature (bumps **minor** version: 1.0.0 → 1.1.0)
- **`fix:`** - Bug fix (bumps **patch** version: 1.0.0 → 1.0.1)
- **`BREAKING:`** or **`feat!:`** - Breaking change (bumps **major** version: 1.0.0 → 2.0.0)
- **`docs:`** - Documentation only (no version bump)
- **`style:`** - Code style changes (no version bump)
- **`refactor:`** - Code refactoring (no version bump)
- **`perf:`** - Performance improvements (bumps **patch** version)
- **`test:`** - Adding tests (no version bump)
- **`chore:`** - Maintenance tasks (no version bump)

### Examples

```bash
# Minor version bump (new feature)
git commit -m "feat(web-app): add premium header design"

# Patch version bump (bug fix)
git commit -m "fix(analysis): prevent Y-axis label cutoff in RTL"

# Major version bump (breaking change)
git commit -m "feat(api)!: change authentication endpoint structure"
# or
git commit -m "BREAKING: change authentication endpoint structure"

# No version bump (documentation)
git commit -m "docs: update README with setup instructions"

# Multiple packages affected
git commit -m "feat(web-app, mobile-app): add Hebrew translations"
```

### Scopes (Optional)

You can specify which package/component is affected:

- `web-app` - Web application changes
- `mobile-app` - Mobile application changes
- `todo-backend` - Backend API changes
- `frontend-services` - Shared frontend services
- `analysis` - Analysis page specific
- `auth` - Authentication related
- etc.

## How It Works

1. **You commit with conventional commits:**
   ```bash
   git commit -m "feat(web-app): improve header design with premium styling"
   ```

2. **You push to `main` branch:**
   ```bash
   git push origin main
   ```

3. **release-please workflow runs:**
   - Analyzes commits since last release
   - Determines version bump needed
   - Creates/updates a release PR automatically

4. **Review and merge the release PR:**
   - The PR will have updated versions in `package.json` files
   - It will have updated `CHANGELOG.md` files
   - When merged, it creates a GitHub release

## Current Configuration

The following packages are tracked:
- `todo-backend` - Backend API
- `frontend-services` - Shared frontend services
- `mobile-app` - Mobile application
- `web-app` - Web application

## Best Practices

1. **Use conventional commits consistently** - This ensures accurate versioning
2. **Be specific in commit messages** - Helps with changelog generation
3. **Use scopes** - Makes it clear which package is affected
4. **Review release PRs** - Check that versions and changelogs are correct before merging
5. **Don't manually bump versions** - Let release-please handle it

## Manual Override

If you need to manually trigger a release or override the version:

1. Use the manual version bump workflow (workflow_dispatch)
2. Or create a commit with `chore: release v1.2.3` to force a specific version

## Resources

- [Conventional Commits Specification](https://www.conventionalcommits.org/)
- [release-please Documentation](https://github.com/googleapis/release-please)
