import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { nitterConf } from '../fileModels/nitter.conf'
import { getNonLocalUrls } from '../utils'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  url: Value.dynamicSelect(async ({ effects }) => {
    const urls = await getNonLocalUrls(effects)
    return {
      name: i18n('URL'),
      values: urls.reduce(
        (obj, url) => ({ ...obj, [url]: url }),
        {} as Record<string, string>,
      ),
      default: '',
    }
  }),
})

export const setPrimaryUrl = sdk.Action.withInput(
  // id
  'set-primary-url',

  // metadata
  async ({ effects }) => ({
    name: i18n('Set Primary URL'),
    description: i18n(
      'Choose which of your Nitter URLs is used for generating links, such as RSS feed and canonical URLs.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // pre-fill with the current hostname from nitter.conf
  async ({ effects }) => {
    const server = await nitterConf.read((c) => c.Server).once()
    if (!server?.hostname) return {}
    return {
      url: `${server.https ? 'https' : 'http'}://${server.hostname}`,
    }
  },

  // the execution function
  async ({ effects, input }) => {
    const url = new URL(input.url)
    await nitterConf.merge(effects, {
      Server: {
        hostname: url.host,
        https: url.protocol === 'https:',
      },
    })
  },
)
