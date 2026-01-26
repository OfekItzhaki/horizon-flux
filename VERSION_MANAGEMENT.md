# Version Management Guide

This guide explains how to automatically manage version numbers for mobile-app and web-app using CI/CD.

## Overview

We have two main workflows for version management:

1. **Version Bump Workflow** - Bumps versions and creates a PR
2. **EAS Build with Version Bump** - Bumps version, commits, and triggers EAS build

## Workflows

### 1. Manual Version Bump (`version-bump.yml`)

Use this workflow to bump versions manually after a build or release.

**How to use:**
1. Go to GitHub Actions → "Bump Version" workflow
2. Click "Run workflow"
3. Select:
   - **Version type**: `patch` (1.2.1 → 1.2.2), `minor` (1.2.1 → 1.3.0), or `major` (1.2.1 → 2.0.0)
   - **Apps**: `mobile`, `web`, or `all`
4. Click "Run workflow"

This will:
- Bump version in `package.json` and `app.json` (for mobile)
- Increment Android `versionCode` automatically
- Create a PR with the changes
- Or commit directly to `develop` branch

### 2. EAS Build with Version Bump (`eas-build-version.yml`)

Use this workflow to bump version AND build in one go.

**How to use:**
1. Go to GitHub Actions → "EAS Build Version Bump" workflow
2. Click "Run workflow"
3. Select:
   - **Version type**: `patch`, `minor`, or `major`
   - **Build profile**: `preview` or `production`
4. Click "Run workflow"

This will:
- Bump mobile app version
- Commit changes to `develop`
- Trigger EAS build automatically

**Required Secret:**
- `EXPO_TOKEN` - Your Expo access token (get it from https://expo.dev/accounts/[your-account]/settings/access-tokens)

### 3. Local Script (Alternative)

You can also bump versions locally using the script:

```bash
cd mobile-app
node scripts/bump-version.js [patch|minor|major]
```

Then commit and push:
```bash
git add package.json app.json
git commit -m "chore: bump version to X.X.X"
git push origin develop
```

## Version Numbering

### Mobile App
- **Version**: Semantic versioning (e.g., `1.2.1`)
  - Stored in: `package.json` and `app.json`
- **Android versionCode**: Integer that increments with each build
  - Stored in: `app.json` → `expo.android.versionCode`
  - Auto-incremented on each version bump

### Web App
- **Version**: Semantic versioning (e.g., `1.0.1`)
  - Stored in: `package.json`

## Recommended Workflow

### After completing a build:

1. **Option A: Use GitHub Actions (Recommended)**
   - Go to Actions → "Bump Version"
   - Select `patch` (for bug fixes) or `minor` (for new features)
   - Select `mobile` (or `all` if you also updated web-app)
   - Review and merge the PR

2. **Option B: Build and bump together**
   - Go to Actions → "EAS Build Version Bump"
   - Select version type and build profile
   - The workflow will bump version, commit, and build

3. **Option C: Manual (for quick patches)**
   ```bash
   cd mobile-app
   node scripts/bump-version.js patch
   git add package.json app.json
   git commit -m "chore: bump version"
   git push origin develop
   ```

## Setting up EAS Webhook (Optional)

To automatically trigger version bumps after EAS builds complete:

1. Go to [Expo Dashboard](https://expo.dev) → Your Project → Settings → Webhooks
2. Add webhook URL: `https://api.github.com/repos/[your-username]/[your-repo]/dispatches`
3. Add header: `Authorization: token YOUR_GITHUB_TOKEN`
4. Select event: `build.complete`

Then uncomment the `repository_dispatch` trigger in `version-bump.yml`.

## Notes

- **EAS autoIncrement**: The `preview` and `production` profiles in `eas.json` have `autoIncrement: true`, which means EAS will auto-increment `versionCode` during builds. Our workflow also increments it to keep them in sync.
- **Version sync**: Always keep `package.json` and `app.json` versions in sync for mobile-app.
- **Branch**: Version bumps commit to `develop` branch. Merge to `main` when ready for release.
