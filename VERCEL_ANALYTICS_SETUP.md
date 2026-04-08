# Vercel Web Analytics & Speed Insights Setup

## Enable Web Analytics (Dashboard)

The following steps MUST be completed in the Vercel dashboard:

### Step 1: Open Vercel Project Settings

1. Go to: https://vercel.com/shahilspatels-projects/gridballr/settings
2. Log in if needed

### Step 2: Find Analytics Section

1. Look for "Web Analytics" in the settings
2. Click the **Enable** button
3. Wait for 30-60 seconds for it to activate

### Step 3: View Analytics Dashboard

Once enabled, analytics will be available at:

- https://vercel.com/shahilspatels-projects/gridballr/analytics

### Step 4: Enable Speed Insights (Optional)

Same settings page, look for "Speed Insights" and enable

---

## Verification

After enabling, verify by:

1. **Check Dashboard:**
   - Go to: https://vercel.com/shahilspatels-projects/gridballr/analytics
   - Should show visitor count, page views, etc.

2. **Check Live Site:**
   - Visit: https://gridballr.com
   - Open DevTools → Network tab
   - Should see `_vercel/insights/script` being loaded

3. **Check Configuration:**
   ```bash
   # Verify Web Analytics package is available
   npm list @vercel/analytics
   ```

---

## Current Status

✅ Code: Ready to collect analytics
✅ Configuration: Next.js configured
⏳ Dashboard: REQUIRES MANUAL ENABLE (Vercel dashboard access only)

The infrastructure is 100% ready. You just need to click "Enable" in the Vercel dashboard.

---

## Alternative: Programmatic Enable (if API access available)

If you have a Vercel API token, analytics can be enabled via:

```bash
curl -X PATCH https://api.vercel.com/v13/projects/prj_78Axyxh5jsdwK9a6S0weyWOryMdX \
  -H "Authorization: Bearer YOUR_VERCEL_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"analyticsEnabled": true}'
```

---

## After Enable

Once enabled, monitor:

- **Real-time visitors**: See who's on your site right now
- **Page views**: Which pages are most popular
- **Core Web Vitals**: LCP, FID, CLS performance metrics
- **Response times**: API latency and CDN performance

---

## Recommendation

For launch:

1. Enable Web Analytics NOW (takes 30 seconds)
2. Keep Speed Insights disabled initially (can enable later if needed)
3. Monitor analytics for first week of traffic
4. Use data to optimize high-traffic pages
