import { setPrimaryUrl } from '../actions/setPrimaryUrl'
import { nitterConf } from '../fileModels/nitter.conf'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { getNonLocalUrls } from '../utils'

export const taskPrimaryUrl = sdk.setupOnInit(async (effects) => {
  const availableUrls = await getNonLocalUrls(effects)
  const server = await nitterConf.read((c) => c.Server).const(effects)
  const url = server?.hostname
    ? `${server.https ? 'https' : 'http'}://${server.hostname}`
    : null

  if (!url) {
    const defaultUrl =
      availableUrls.find((u) => u.includes('.local')) || availableUrls[0]
    if (defaultUrl) {
      const parsed = new URL(defaultUrl)
      await nitterConf.merge(
        effects,
        {
          Server: {
            hostname: parsed.host,
            https: parsed.protocol === 'https:',
          },
        },
        { allowWriteAfterConst: true },
      )
    }
  } else if (availableUrls.includes(url)) {
    await sdk.action.clearTask(effects, 'nitter:set-primary-url')
  } else if (availableUrls.length) {
    // an empty list means the addresses aren't known yet, not that the URL is gone
    await sdk.action.createOwnTask(effects, setPrimaryUrl, 'critical', {
      reason: i18n('Primary URL removed. Select a new primary URL.'),
    })
  }
})
