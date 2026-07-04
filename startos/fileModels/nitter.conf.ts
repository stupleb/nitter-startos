import { FileHelper, utils, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'

/**
 * nitter.conf is Nim parsecfg format: INI-style sections where string values
 * are double-quoted and numbers/booleans are bare. Values containing
 * characters outside parsecfg's symbol set (e.g. ':' in "host:port") only
 * parse when quoted, so we serialize with a custom writer instead of an INI
 * library.
 */

const serverShape = z.object({
  // empty until the primary URL watcher seeds it on first init
  hostname: z.string().catch(''),
  title: z.string().catch('Nitter'),
  address: z.literal('0.0.0.0').catch('0.0.0.0'),
  port: z.literal(8080).catch(8080),
  https: z.boolean().catch(false),
  httpMaxConnections: z.number().catch(100),
  staticDir: z.literal('./public').catch('./public'),
})

const cacheShape = z.object({
  listMinutes: z.number().catch(240),
  rssMinutes: z.number().catch(10),
  redisHost: z.literal('localhost').catch('localhost'),
  redisPort: z.literal(6379).catch(6379),
  redisConnections: z.number().catch(20),
  redisMaxConnections: z.number().catch(30),
})

const configShape = z.object({
  hmacKey: z
    .string()
    .catch(utils.getDefaultString({ charset: 'a-z,0-9', len: 32 })),
  base64Media: z.boolean().catch(false),
  enableRSS: z.boolean().catch(true),
  enableDebug: z.literal(false).catch(false),
  disableTid: z.boolean().catch(false),
  maxConcurrentReqs: z.number().catch(2),
  maxRetries: z.number().catch(1),
  retryDelayMs: z.number().catch(150),
})

const shape = z.object({
  Server: serverShape.catch(() => serverShape.parse({})),
  Cache: cacheShape.catch(() => cacheShape.parse({})),
  Config: configShape.catch(() => configShape.parse({})),
})

export type NitterConf = z.infer<typeof shape>

function serializeValue(value: string | number | boolean): string {
  if (typeof value === 'string')
    return `"${value.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
  return String(value)
}

function toFile(data: NitterConf): string {
  return (
    Object.entries(data)
      .map(
        ([section, kvs]) =>
          `[${section}]\n` +
          Object.entries(kvs)
            .map(([key, value]) => `${key} = ${serializeValue(value)}`)
            .join('\n'),
      )
      .join('\n\n') + '\n'
  )
}

function parseValue(raw: string): string | number | boolean {
  // quoted string, ignoring anything after the closing quote (inline comments)
  const quoted = raw.match(/^"((?:[^"\\]|\\.)*)"/)
  if (quoted) return quoted[1].replace(/\\"/g, '"').replace(/\\\\/g, '\\')
  // unquoted: strip trailing comment, then infer type
  const bare = raw.split('#')[0].trim()
  if (bare === 'true') return true
  if (bare === 'false') return false
  if (/^-?\d+$/.test(bare)) return Number(bare)
  return bare
}

function fromFile(raw: string): unknown {
  const result: Record<string, Record<string, unknown>> = {}
  let section: Record<string, unknown> | undefined
  for (const line of raw.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith(';')) continue
    const sectionMatch = trimmed.match(/^\[(.+)]$/)
    if (sectionMatch) {
      section = result[sectionMatch[1]] ??= {}
      continue
    }
    const kvMatch = trimmed.match(/^([^=]+?)\s*=\s*(.*)$/)
    if (!kvMatch || !section) continue
    section[kvMatch[1].trim()] = parseValue(kvMatch[2].trim())
  }
  return result
}

export const nitterConf = FileHelper.raw(
  {
    base: sdk.volumes.main,
    subpath: 'nitter.conf',
  },
  toFile,
  fromFile,
  (data) => shape.parse(data),
)
