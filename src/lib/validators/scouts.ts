import { z } from 'zod'

export const createReportSchema = z.object({
  player_id: z.string().uuid(),
  tier: z.enum(['ELITE', 'FRANCHISE', 'ALL_STAR', 'STARTER', 'ROTATION', 'DEPTH']),
  summary: z
    .string()
    .min(50, 'Summary must be at least 50 characters')
    .max(2000, 'Summary must be under 2000 characters'),
  strengths: z
    .array(z.string().min(1).max(100))
    .min(1, 'At least 1 strength required')
    .max(5, 'Maximum 5 strengths'),
  weaknesses: z
    .array(z.string().min(1).max(100))
    .min(1, 'At least 1 weakness required')
    .max(5, 'Maximum 5 weaknesses'),
  badges: z.array(z.string()).max(3).default([]),
  grade: z.number().min(0).max(10),
})

export const createCommentSchema = z.object({
  content: z
    .string()
    .min(10, 'Comment must be at least 10 characters')
    .max(1000, 'Comment must be under 1000 characters'),
})

export const flagSchema = z.object({
  reason: z.enum(['profanity', 'spam', 'harassment', 'misinformation', 'other']),
  details: z.string().max(500).optional(),
})

export const voteSchema = z.object({
  vote_type: z.enum(['fire', 'brain', 'cap']),
})

export type CreateReportInput = z.infer<typeof createReportSchema>
export type CreateCommentInput = z.infer<typeof createCommentSchema>
export type FlagInput = z.infer<typeof flagSchema>
export type VoteInput = z.infer<typeof voteSchema>
