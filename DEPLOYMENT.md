# Deployment Guide

## ✅ Completed Steps

1. ✅ Project structure created
2. ✅ Dependencies installed (`npm install` completed)
3. ✅ API endpoints ready (`/api/index.js` and `/api/schema.js`)

## Next Steps: Deploy to Vercel

### Option 1: Deploy via Vercel Web Interface (Recommended)

1. **Push to GitHub** (if not already done):
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Supabase MCP Bridge"
   git remote add origin <your-github-repo-url>
   git push -u origin main
   ```

2. **Connect to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Sign in with GitHub
   - Click "Add New Project"
   - Import your `supabase-mcp-bridge` repository
   - Vercel will auto-detect the project settings

3. **Configure Environment Variables**:
   - In Vercel project settings, go to "Environment Variables"
   - Add the following:
     - `SUPABASE_URL` = `https://your-project-id.supabase.co`
     - `SUPABASE_SERVICE_ROLE_KEY` = `your_service_role_key_here`
   - Make sure to add them for all environments (Production, Preview, Development)

4. **Deploy**:
   - Click "Deploy"
   - Wait for deployment to complete
   - Your endpoints will be available at:
     - `https://your-project.vercel.app/api`
     - `https://your-project.vercel.app/api/schema`

### Option 2: Deploy via Vercel CLI (when disk space is available)

1. **Install Vercel CLI**:
   ```bash
   npm install -g vercel
   ```

2. **Login and Deploy**:
   ```bash
   cd supabase-mcp-bridge
   vercel login
   vercel
   ```

3. **Set Environment Variables**:
   ```bash
   vercel env add SUPABASE_URL
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

4. **Redeploy** (to apply env vars):
   ```bash
   vercel --prod
   ```

## Testing After Deployment

### Test Health Check:
```bash
curl https://your-project.vercel.app/api
```

### Test CRUD Endpoint:
```bash
curl -X POST https://your-project.vercel.app/api \
  -H "Content-Type: application/json" \
  -d '{"action":"select","table":"bots","query":"*"}'
```

### Test Schema Endpoint:
```bash
curl -X POST https://your-project.vercel.app/api/schema \
  -H "Content-Type: application/json" \
  -d '{"entities":["bots","leads"]}'
```

## Getting Supabase Credentials

1. Go to your Supabase project dashboard
2. Navigate to Settings → API
3. Copy:
   - **Project URL** → Use as `SUPABASE_URL`
   - **service_role key** (secret) → Use as `SUPABASE_SERVICE_ROLE_KEY`
   - ⚠️ **Important**: Use the `service_role` key, NOT the `anon` key

## MCP Integration

Once deployed, add the bridge URL to Claude Desktop:

1. Open Claude Desktop → Settings
2. Go to Connectors → Add Custom Connector
3. Set Remote MCP Server URL to: `https://your-project.vercel.app/api`

## Troubleshooting

- **404 errors**: Make sure your files are in the `/api` folder
- **Environment variable errors**: Verify env vars are set in Vercel dashboard
- **CORS errors**: Already handled in the code
- **Supabase connection errors**: Check your `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`

