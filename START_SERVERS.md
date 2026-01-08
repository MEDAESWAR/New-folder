# How to Start the Application

## Quick Start

### 1. Start Backend Server (Terminal 1)

```powershell
cd "C:\Users\siraan abdul razack\New folder\backend"
npm run dev
```

**Expected Output:**
```
Server running on port 5000
```

### 2. Start Frontend Server (Terminal 2)

```powershell
cd "C:\Users\siraan abdul razack\New folder\frontend"
npm run dev
```

**Expected Output:**
```
  VITE v5.x.x  ready in xxx ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
```

### 3. Access the Application

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

---

## Troubleshooting

### Error: ECONNREFUSED

**Problem:** Frontend cannot connect to backend

**Solution:**
1. Make sure backend is running on port 5000
2. Check if port 5000 is already in use:
   ```powershell
   netstat -ano | findstr :5000
   ```
3. If port is in use, change PORT in `backend/.env`:
   ```
   PORT=5001
   ```
   Then update `frontend/vite.config.ts` proxy target:
   ```ts
   target: 'http://localhost:5001',
   ```

### Backend Won't Start

**Check:**
1. Database connection in `.env` is correct
2. Prisma client is generated:
   ```powershell
   cd backend
   npm run db:generate
   ```
3. Dependencies are installed:
   ```powershell
   npm install
   ```

### Frontend Shows Connection Errors

The login page now has **automatic retry** (3 attempts). If you see connection errors:
1. Start the backend server first
2. Wait 2-3 seconds
3. Try logging in again - it will auto-retry

---

## Development Workflow

1. **Always start backend first**
2. **Then start frontend**
3. **Keep both terminals open**
4. **Backend must be running before using frontend**

---

## Verify Backend is Running

Test the health endpoint:
```powershell
curl http://localhost:5000/api/health
```

Or in browser: http://localhost:5000/api/health

Expected response:
```json
{
  "status": "ok",
  "message": "Career Mentor API is running"
}
```
