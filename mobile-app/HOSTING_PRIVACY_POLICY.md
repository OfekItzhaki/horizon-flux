# How to Host Privacy Policy

## Option 1: GitHub Pages (Easiest - Recommended)

Since your code is already on GitHub (`OfekItzhaki/TasksManagement`), you can use GitHub Pages for free.

### Steps:

1. **Push the privacy policy to your repo** (already done ✓)

2. **Enable GitHub Pages:**
   - Go to: https://github.com/OfekItzhaki/TasksManagement/settings/pages
   - Under "Source", select "Deploy from a branch"
   - Choose branch: `develop` (or `main`)
   - Choose folder: `/ (root)` or `/mobile-app` (if you want it in a subdirectory)
   - Click "Save"

3. **Your privacy policy will be available at:**
   - `https://ofekitzhaki.github.io/TasksManagement/mobile-app/privacy-policy.html`
   - OR: `https://ofekitzhaki.github.io/TasksManagement/privacy-policy.html` (if root)

4. **Update the email in privacy-policy.html:**
   - Edit line 140: Replace `[Your Email Address]` with your actual email
   - Commit and push the change

**Note:** GitHub Pages may take a few minutes to deploy after you enable it.

---

## Option 2: Render (Your Backend Server)

Since you're already using Render for your backend, you can serve the privacy policy from there.

### Option 2a: Serve as Static File from Backend

Add the privacy policy to your backend and serve it:

1. **Add privacy policy to backend:**
   ```bash
   # Copy the file to your backend
   cp mobile-app/privacy-policy.html todo-backend/public/privacy-policy.html
   ```

2. **Your NestJS backend already serves static files from `public/`** (I saw this in `main.ts`):
   ```typescript
   app.useStaticAssets(join(process.cwd(), 'public', 'uploads'), {
     prefix: '/uploads/',
   });
   ```

3. **Add another static route for the privacy policy:**
   - Or just access it at: `https://tasksmanagement-lv54.onrender.com/privacy-policy.html` (if you put it in public root)

4. **URL will be:**
   - `https://tasksmanagement-lv54.onrender.com/privacy-policy.html`

### Option 2b: Render Static Site (Separate Service)

Create a new static site on Render:

1. Go to Render Dashboard
2. Click "New +" → "Static Site"
3. Connect your GitHub repo
4. Set build command: (none needed)
5. Set publish directory: `mobile-app`
6. Deploy

---

## Option 3: Simple Static Hosting (Other Options)

- **Netlify** (free tier): Drag and drop the HTML file
- **Vercel** (free tier): Connect GitHub repo
- **Your own domain**: If you have one

---

## Recommended: GitHub Pages

**Why GitHub Pages:**
- ✅ Free
- ✅ Already have the repo
- ✅ Takes 2 minutes to set up
- ✅ Automatically updates when you push changes
- ✅ HTTPS by default
- ✅ Professional URL

**Steps to set up (takes 2 minutes):**

1. Go to: https://github.com/OfekItzhaki/TasksManagement/settings/pages
2. Source: `develop` branch, `/ (root)` folder
3. Save
4. Wait 2-3 minutes
5. Visit: `https://ofekitzhaki.github.io/TasksManagement/mobile-app/privacy-policy.html`
6. Update email in the file and commit

---

## After Hosting

Once you have the URL, you'll use it when submitting to:
- **Google Play Console**: Store Settings → App Content → Privacy Policy
- **App Store Connect**: App Information → Privacy Policy URL
