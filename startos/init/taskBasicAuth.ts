import { configureBasicAuth } from '../actions/configureBasicAuth'
import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const taskBasicAuth = sdk.setupOnInit(async (effects) => {
  // store.json is first written by Configure Basic Auth, so its absence means undecided
  if (await storeJson.read().const(effects)) {
    await sdk.action.clearTask(effects, 'nitter:configure-basic-auth')
  } else {
    await sdk.action.createOwnTask(effects, configureBasicAuth, 'important', {
      reason: i18n(
        'Decide whether to protect the Nitter web interface with a username and password (Basic Auth).',
      ),
    })
  }
})
