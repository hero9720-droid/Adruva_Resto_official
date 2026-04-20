# Adruva Resto Production Deployment Checklist 🚀

## 1. Railway Backend Deployment (API)

1. Connect your GitHub repository to Railway.
2. Select the `/api` directory as the Root Directory.
3. Railway will automatically detect the `railway.toml` file we created and use Nixpacks to build it using Node 22.
4. **Environment Variables needed in Railway:**
   - `PORT=4000` (Railway automatically assigns a PORT, so you can leave this blank, but our code defaults to 4000).
   - `DATABASE_URL` (From your Railway Postgres add-on).
   - `REDIS_URL` (From your Upstash/Railway Redis add-on).
   - `JWT_SECRET` (A strong random string).
   - `REFRESH_TOKEN_SECRET` (A strong random string).
   - `RAZORPAY_KEY_ID` (Your production/test key).
   - `RAZORPAY_KEY_SECRET`
   - `RAZORPAY_WEBHOOK_SECRET`
   - `FRONTEND_URLS=https://admin.adruvaresto.com,https://chain.adruvaresto.com,https://app.adruvaresto.com,https://menu.adruvaresto.com` (Ensure all production frontend domains are comma-separated here).

## 2. Vercel Frontend Deployment (Next.js Apps)

You will create **4 separate Projects** in Vercel, all pointing to the exact same GitHub repository. For each project, you must override the "Root Directory".

### A. SuperAdmin App (`admin.adruvaresto.com`)
1. **Root Directory**: `superadmin-app`
2. **Framework Preset**: Next.js
3. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL=https://<your-railway-api-domain>/api`
   - `NEXT_PUBLIC_WS_URL=wss://<your-railway-api-domain>`

### B. Chain HQ App (`chain.adruvaresto.com`)
1. **Root Directory**: `chain-app`
2. **Framework Preset**: Next.js
3. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL=https://<your-railway-api-domain>/api`

### C. Outlet App (`app.adruvaresto.com`)
1. **Root Directory**: `outlet-app`
2. **Framework Preset**: Next.js
3. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL=https://<your-railway-api-domain>/api`
   - `NEXT_PUBLIC_WS_URL=wss://<your-railway-api-domain>`

### D. Customer App (`menu.adruvaresto.com`)
1. **Root Directory**: `customer-app`
2. **Framework Preset**: Next.js
3. **Environment Variables**:
   - `NEXT_PUBLIC_API_URL=https://<your-railway-api-domain>/api`

---
> [!SUCCESS]
> **Done!**
> Every commit to `main` will now trigger a GitHub Action to test all 5 apps. Once tests pass, Vercel and Railway will automatically deploy the latest changes!
