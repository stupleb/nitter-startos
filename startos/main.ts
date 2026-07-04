import { writeFile } from 'fs/promises'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { nitterConf } from './fileModels/nitter.conf'
import { sessionsJson } from './fileModels/sessions.json'
import { nitterConfPath, sessionsJsonlPath, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting Nitter!'))

  // restart on config or session changes (nitter only reads both at startup)
  await nitterConf.read().const(effects)
  const sessions =
    (await sessionsJson.read((s) => s.sessions).const(effects)) || []

  const valkeySub = await sdk.SubContainer.of(
    effects,
    { imageId: 'valkey' },
    null,
    'valkey-sub',
  )

  const nitterSub = await sdk.SubContainer.of(
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

  // Render the sessions file model into the JSONL file nitter reads at startup
  const jsonl = sessions
    .map((s) => JSON.stringify({ kind: 'cookie', ...s }))
    .join('\n')
  await writeFile(`${nitterSub.rootfs}${sessionsJsonlPath}`, jsonl + '\n')

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
          sdk.healthCheck.checkPortListening(effects, uiPort, {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          }),
      },
      requires: ['valkey'],
    })
})
