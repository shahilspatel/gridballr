# GridBallr DNS Setup

## Current Status

- Domain: `gridballr.com`
- Registrar: Cloudflare
- Currently: Using Cloudflare nameservers (leo.ns.cloudflare.com, sierra.ns.cloudflare.com)
- Target: Point to Vercel deployment

## Deployment URL

- Production: `https://gridballr-9iuoqcq7m-shahilspatels-projects.vercel.app`
- Vercel Project: shahilspatels-projects/gridballr

## DNS Configuration Options

### Option 1: Update Nameservers (Recommended for Vercel)

Change nameservers at Cloudflare registrar to Vercel's nameservers:

- ns1.vercel-dns.com
- ns2.vercel-dns.com

**Steps:**

1. Go to https://dash.cloudflare.com/
2. Navigate to Domains → gridballr.com → Registrar
3. Change nameservers to Vercel's
4. Verify at https://dashboard.vercel.com/domains/gridballr.com

### Option 2: Add DNS Records at Cloudflare (Alternative)

Keep Cloudflare as registrar, add DNS records:

**A Record:**

- Type: A
- Name: @
- Content: 76.76.19.1
- Proxy status: DNS only

**CNAME Record (for www):**

- Type: CNAME
- Name: www
- Target: cname.vercel-dns.com
- Proxy status: DNS only

## Verification

After DNS is configured:

```bash
# Check if domain resolves
nslookup gridballr.com
# Or
dig gridballr.com

# Verify with Vercel
vercel domains inspect gridballr.com
```

## Timeline

DNS propagation typically takes 24-48 hours, but can be faster (usually 5-30 minutes).

## Deployment Status

- ✅ Supabase: Production project created and migrated
- ✅ Stripe: Products and API keys configured
- ✅ Vercel: Deployed to production
- ⏳ DNS: Waiting for configuration at Cloudflare
- 🚀 Ready to launch once DNS is live
