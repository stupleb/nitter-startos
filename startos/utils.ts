import { T } from '@start9labs/start-sdk'
import { sdk } from './sdk'

export const uiPort = 8080

// Paths inside the nitter container (the 'main' volume is mounted at /data)
export const nitterConfPath = '/data/nitter.conf'
export const sessionsJsonlPath = '/data/sessions.jsonl'

export async function getNonLocalUrls(effects: T.Effects) {
  return sdk.serviceInterface
    .getOwn(effects, 'ui', (i) => i?.addressInfo?.nonLocal.format() || [])
    .const()
}
