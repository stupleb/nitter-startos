import { writeFile } from 'fs/promises'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { nitterConf } from './fileModels/nitter.conf'
import { sessionsJson } from './fileModels/sessions.json'
import { storeJson } from './fileModels/store.json'
import {
  getCaddyfile,
  nitterConfPath,
  nitterPort,
  sessionsJsonlPath,
  uiPort,
} from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Nitter!'))

  // restart on config, session, or basic-auth changes (all read at startup)
  await nitterConf.read().const(effects)
  const sessions =
    (await sessionsJson.read((s) => s.sessions).const(effects)) || []
  const basicAuth = await storeJson.read((s) => s.basicAuth).const(effects)

  // 2.0: SubContainer.of() is lazy and synchronous — it materializes on first
  // use (rootfs/exec), so no await here.
  const valkeySub = sdk.SubContainer.of(
    effects,
    { imageId: 'valkey' },
    null,
    'valkey-sub',
  )

  const nitterSub = sdk.SubContainer.of(
    effects,
    { imageId: 'nitter' },
    sdk.Mounts.of().mountVolume({
      volumeId: 'main',
      subpath: null,
      mountpoint: '/data',
      readonly: false,
    }),
    'nitter-sub',
  )

  const caddySub = sdk.SubContainer.of(
    effects,
    { imageId: 'caddy' },
    null,
    'caddy-sub',
  )

  // Render the sessions file model into the JSONL file nitter reads at startup
  const jsonl = sessions
    .map((s) => JSON.stringify({ kind: 'cookie', ...s }))
    .join('\n')
  await writeFile(`${await nitterSub.rootfs}${sessionsJsonlPath}`, jsonl + '\n')

  // Write the Caddyfile, bcrypt-hashing the Basic Auth password if enabled
  let auth: { username: string; hash: string } | null = null
  if (basicAuth?.enabled && basicAuth.username && basicAuth.password) {
    const res = await caddySub.exec([
      'caddy',
      'hash-password',
      '--plaintext',
      basicAuth.password,
    ])
    const hash = res.stdout.toString().trim()
    if (!hash.startsWith('$2'))
      throw new Error(`caddy hash-password failed: ${res.stderr.toString()}`)
    auth = { username: basicAuth.username, hash }
  }
  await writeFile(`${await caddySub.rootfs}/Caddyfile`, getCaddyfile(auth))

  return sdk.Daemons.of(effects)
    .addDaemon('valkey', {
      subcontainer: valkeySub,
      exec: {
        // ephemeral cache: persistence disabled
        command: ['valkey-server', '--save', '', '--appendonly', 'no'],
      },
      ready: {
        display: null,
        fn: async () => {
          const res = await valkeySub.exec(['valkey-cli', 'ping'])
          return res.stdout.toString().trim() === 'PONG'
            ? { message: '', result: 'success' }
            : { message: res.stdout.toString().trim(), result: 'failure' }
        },
      },
      requires: [],
    })
    .addDaemon('nitter', {
      subcontainer: nitterSub,
      exec: {
        cwd: '/src',
        command: ['./nitter'],
        env: {
          NITTER_CONF_FILE: nitterConfPath,
          NITTER_SESSIONS_FILE: sessionsJsonlPath,
        },
      },
      ready: {
        display: i18n('Web Interface'),
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, nitterPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: ['valkey'],
    })
    .addDaemon('caddy', {
      subcontainer: caddySub,
      exec: {
        command: ['caddy', 'run', '--config', '/Caddyfile'],
        env: {
          HOME: '/root',
        },
      },
      ready: {
        display: null,
        fn: () =>
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('Caddy is ready'),
            errorMessage: i18n('Caddy is not ready'),
          }),
      },
      requires: ['nitter'],
    })
})
