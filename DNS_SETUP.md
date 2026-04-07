# GridBallr DNS Setup

## Current Status

- Domain: `gridballr.com`
- Registrar: Cloudflare
- Status: ✅ **LIVE** — DNS configured and propagating
- DNS: A record → 76.76.21.21 (Vercel), CNAME → cname.vercel-dns.com

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

- ✅ Supabase: Production project (tprkgcyzfafisudedtxp) — migrated
- ✅ Stripe: Products created (Monthly: $12, Annual: $80) — API keys configured
- ✅ Vercel: Production deployment active
- ✅ DNS: Cloudflare records configured and propagating (5-30 min typical)
- ✅ Custom Domain: https://gridballr.com — LIVE!

### DNS Records Configured

- A Record: `gridballr.com` → `76.76.21.21` (Vercel)
- CNAME Record: `www.gridballr.com` → `cname.vercel-dns.com`

### Next Steps

1. Wait for DNS to fully propagate (check with `nslookup gridballr.com`)
2. Verify HTTPS certificate is issued for gridballr.com
3. Test premium upgrade flow at /pricing
4. Monitor Stripe webhook deliveries
