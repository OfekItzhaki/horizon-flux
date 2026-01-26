# Branch Protection Setup Guide

This guide explains how to set up branch protection rules to ensure tests must pass before merging PRs.

## Why Branch Protection?

Branch protection rules ensure that:
- ✅ All tests must pass before merging
- ✅ Code reviews can be required
- ✅ No force pushes to protected branches
- ✅ No deletion of protected branches

## Setup Instructions

### 1. Navigate to Repository Settings

1. Go to your GitHub repository
2. Click on **Settings** (top right)
3. Click on **Branches** (left sidebar)

### 2. Add Branch Protection Rule

1. Click **Add branch protection rule** or **Add rule**
2. In the **Branch name pattern** field, enter:
   - `main` (for main branch)
   - Or `*` (for all branches)

### 3. Configure Protection Rules

Enable the following settings:

#### Required Status Checks
- ✅ **Require status checks to pass before merging**
- ✅ **Require branches to be up to date before merging**
- Under **Status checks that are required**, select:
  - `Backend CI / backend`
  - `Web App CI / web`
  - `Mobile App CI / mobile`
  - `Test Summary / test-summary`

#### Other Recommended Settings
- ✅ **Require a pull request before merging**
  - ✅ Require approvals: `1` (or more as needed)
  - ✅ Dismiss stale pull request approvals when new commits are pushed
- ✅ **Require conversation resolution before merging**
- ✅ **Do not allow bypassing the above settings**
- ✅ **Restrict who can push to matching branches** (optional, for extra security)

### 4. Save the Rule

Click **Create** or **Save changes**

## What This Does

Once configured:

1. **On every PR**: All CI jobs (backend, web, mobile) must pass
2. **Before merging**: GitHub will block the merge if any test fails
3. **Status checks**: You'll see green checkmarks ✅ or red X ❌ on each PR
4. **Required reviews**: PRs need approval before merging (if configured)

## Current CI Jobs

The following jobs run on every PR:

- **Backend CI** (`backend`): Runs Jest tests with coverage
- **Web App CI** (`web`): Runs Vitest tests
- **Mobile App CI** (`mobile`): Runs Jest tests with coverage
- **Test Summary** (`test-summary`): Ensures all tests passed

## Troubleshooting

### Tests are passing but PR still blocked

1. Check if branch protection is configured correctly
2. Verify all required status checks are selected
3. Ensure the branch is up to date (merge or rebase)

### Want to allow merging even if tests fail?

This is **not recommended**, but if needed:
- Remove the branch protection rule
- Or add yourself to the bypass list (if "Do not allow bypassing" is disabled)

### Tests are slow

- Tests run in parallel (backend, web, mobile run simultaneously)
- Consider adding test caching or splitting into smaller test suites
- Use `--maxWorkers` flag to limit parallel test execution

## Best Practices

1. ✅ **Always require tests to pass** - Don't merge broken code
2. ✅ **Keep tests fast** - Aim for < 5 minutes total CI time
3. ✅ **Fix flaky tests immediately** - They reduce confidence in CI
4. ✅ **Review test failures** - Don't just re-run, understand the issue
5. ✅ **Add tests for new features** - Maintain or increase coverage

## Alternative: Using GitHub Actions Status Checks

If you prefer not to use branch protection, you can still see test results:
- Check the **Checks** tab on each PR
- Review the status of each CI job
- Manually ensure all tests pass before merging

However, branch protection is the **recommended approach** as it enforces the requirement automatically.
