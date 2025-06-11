# Environment Variables Setup Guide

## Local Development

1. Add your actual values to `.dev.vars`:
   ```
   WEAVIATE_URL=https://your-cluster-id.weaviate.network
   WEAVIATE_API_KEY=your-actual-api-key-here
   ```

2. Run locally:
   ```bash
   npm run dev
   ```

## Production Deployment

### Method 1: Using Wrangler CLI (Recommended)

Set secrets via the command line (these are encrypted and stored securely):

```bash
# Set your Weaviate URL
wrangler secret put WEAVIATE_URL

# Set your Weaviate API key  
wrangler secret put WEAVIATE_API_KEY
```

When prompted, paste your actual values.

### Method 2: Using Cloudflare Dashboard

1. Go to Cloudflare Workers dashboard
2. Select your worker
3. Go to Settings > Variables
4. Add environment variables:
   - `WEAVIATE_URL`: your cluster URL
   - `WEAVIATE_API_KEY`: your API key (mark as "Encrypt")

### Deploy

```bash
npm run deploy
```

## Security Notes

- ✅ `.dev.vars` is in `.gitignore` - safe for local development
- ✅ Secrets via CLI are encrypted by Cloudflare
- ✅ `wrangler.jsonc` no longer contains sensitive data
- ❌ Never commit API keys to version control
