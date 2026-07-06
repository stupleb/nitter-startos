import { T } from '@start9labs/start-sdk'
import { sdk } from './sdk'

// Caddy fronts nitter and owns the exposed UI port; nitter stays internal.
export const uiPort = 80
export const nitterPort = 8080

export const basicAuthUsername = 'admin'

// Paths inside the nitter container (the 'main' volume is mounted at /data)
export const nitterConfPath = '/data/nitter.conf'
export const sessionsJsonlPath = '/data/sessions.jsonl'

export async function getNonLocalUrls(effects: T.Effects) {
  return sdk.serviceInterface
    .getOwn(effects, 'ui', (i) => i?.addressInfo?.nonLocal.format() || [])
    .const()
}

export function getCaddyfile(
  basicAuth: { username: string; hash: string } | null,
): string {
  return `
{
	admin off
	log {
		output stdout
		level INFO
	}
}

:${uiPort} {
${
  basicAuth
    ? `	basic_auth {
		${basicAuth.username} ${basicAuth.hash}
	}
`
    : ''
}	reverse_proxy localhost:${nitterPort}
}
`.trim()
}
