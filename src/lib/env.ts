import { z } from 'zod'

const serverSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
  STRIPE_SECRET_KEY: z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET: z.string().startsWith('whsec_'),
  NEXT_PUBLIC_APP_URL: z.string().url(),
  CRON_SECRET: z.string().min(16),
})

const optionalSchema = z.object({
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  KV_REST_API_URL: z.string().url().optional(),
  KV_REST_API_TOKEN: z.string().optional(),
  PROSPECT_DATA_LAST_UPDATED: z.string().optional(),
  NEXT_PUBLIC_SENTRY_DSN: z.string().url().optional(),
  SENTRY_AUTH_TOKEN: z.string().optional(),
  // Stripe price IDs — currently hardcoded in src/lib/stripe/plans.ts and not
  // read from env. Listed here as optional so they don't trigger validation
  // errors in dev. When plans.ts is migrated to read from env, move these
  // to serverSchema and mark required.
  STRIPE_MONTHLY_PRICE_ID: z.string().startsWith('price_').optional(),
  STRIPE_ANNUAL_PRICE_ID: z.string().startsWith('price_').optional(),
})

export function validateEnv() {
  if (process.env.NODE_ENV === 'test') return

  const result = serverSchema.merge(optionalSchema).safeParse(process.env)

  if (!result.success) {
    const missing = result.error.issues.map((i) => `  ${i.path.join('.')}: ${i.message}`)
    console.error(`\nMissing or invalid environment variables:\n${missing.join('\n')}\n`)

    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment configuration')
    }
  }
}
