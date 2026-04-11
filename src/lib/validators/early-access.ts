import { z } from 'zod'

// Strict-but-pragmatic email validation. Allows most real addresses while
// rejecting obvious garbage. We trust Supabase Auth to do the heavy lifting
// at signup; this is just for the waitlist capture.
//
// The honeypot `website` field is accepted as an optional string of any
// content. The route handler decides what to do when it's non-empty (silent
// success). Doing the honeypot check at the route layer instead of the
// schema layer means a bot that fills the field doesn't get a "bot detected"
// error message back — they get the same response as a real human.
export const earlyAccessSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .min(5, 'Email is required')
    .max(254, 'Email too long')
    .email('Invalid email'),
  source: z.string().max(64).optional(),
  website: z.string().max(2048).optional(),
})

export type EarlyAccessInput = z.infer<typeof earlyAccessSchema>
