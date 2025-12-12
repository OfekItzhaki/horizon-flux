# Network Setup Guide

## The Problem

When running the app on a **physical device**, `localhost` or `127.0.0.1` refers to the device itself, not your computer running the backend server. This causes "No response from server" errors.

## Solution: Use Your Computer's IP Address

### Step 1: Find Your Computer's IP Address

**Windows:**
```bash
ipconfig
```
Look for `IPv4 Address` under your active network adapter (usually Wi-Fi or Ethernet). Example: `192.168.1.100`

**Mac/Linux:**
```bash
ifconfig
# or
ip addr
```
Look for `inet` address (not `127.0.0.1`). Example: `192.168.1.100`

### Step 2: Update API Configuration

**Option A: Using Environment Variable (Recommended)**

1. Create a `.env` file in the `mobile-app` directory:
   ```env
   EXPO_PUBLIC_API_URL=http://192.168.1.100:3000
   ```
   Replace `192.168.1.100` with your actual IP address.

2. Install `expo-constants` if not already installed:
   ```bash
   npm install expo-constants
   ```

3. Restart Expo:
   ```bash
   npx expo start -c
   ```

**Option B: Direct Configuration**

Edit `mobile-app/src/config/api.ts`:
```typescript
export const API_CONFIG = {
  baseURL: 'http://192.168.1.100:3000', // Replace with your IP
};
```

### Step 3: Verify Backend is Running

Make sure your backend is running and accessible:
```bash
cd todo-backend
npm run start:dev
```

Test the API URL in your browser:
```
http://192.168.1.100:3000/api
```
(Should show Swagger documentation)

### Step 4: Ensure Same Network

- Your phone and computer must be on the **same Wi-Fi network**
- Some corporate networks block device-to-device communication
- Try using a mobile hotspot if needed

### Step 5: Check Firewall

**Windows:**
- Allow Node.js through Windows Firewall
- Or temporarily disable firewall for testing

**Mac:**
- System Preferences → Security & Privacy → Firewall
- Allow Node.js if prompted

## Troubleshooting

### Still Getting "No response from server"?

1. **Check the console logs** - The app logs the API URL on startup
2. **Verify backend is running** - Check `http://localhost:3000/api` in browser
3. **Test with curl/Postman** - Try `http://YOUR_IP:3000/auth/login` from another device
4. **Check port** - Make sure backend is on port 3000 (or update config)
5. **Try different network** - Some networks block local connections

### Using Android Emulator?

Android emulator can use `10.0.2.2` instead of localhost:
```typescript
baseURL: 'http://10.0.2.2:3000'
```

### Using iOS Simulator?

iOS Simulator can use `localhost`:
```typescript
baseURL: 'http://localhost:3000'
```

## Quick Test

After updating the IP, you should see in the Expo console:
```
API Base URL: http://192.168.1.100:3000
```

If you see this, the configuration is correct!







