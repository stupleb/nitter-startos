import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * Source of truth for X account sessions, managed via the add/remove session
 * actions. main.ts renders it into the sessions.jsonl file nitter reads at
 * startup (one {"kind":"cookie",...} object per line).
 */

const sessionShape = z.object({
  auth_token: z.string(),
  ct0: z.string(),
  username: z.string().optional(),
})

export type Session = z.infer<typeof sessionShape>

const shape = z.object({
  sessions: z.array(sessionShape).catch([]),
})

export const sessionsJson = FileHelper.json(
  {
    base: sdk.volumes.main,
    subpath: 'sessions.json',
  },
  shape,
)
