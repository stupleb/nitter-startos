import { sdk } from '../sdk'
import { nitterConf } from '../fileModels/nitter.conf'
import { sessionsJson } from '../fileModels/sessions.json'

export const seedFiles = sdk.setupOnInit(async (effects) => {
  // empty merges apply all .catch() defaults, incl. a random hmacKey
  await nitterConf.merge(effects, {})
  await sessionsJson.merge(effects, {})
  // store.json stays unseeded: taskBasicAuth reads its absence as "undecided"
})
