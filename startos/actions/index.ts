import { sdk } from '../sdk'
import { addSession } from './addSession'
import { removeSessions } from './removeSessions'
import { setPrimaryUrl } from './setPrimaryUrl'
import { configureBasicAuth } from './configureBasicAuth'
import { resetBasicAuthPassword } from './resetBasicAuthPassword'

export const actions = sdk.Actions.of()
  .addAction(addSession)
  .addAction(removeSessions)
  .addAction(setPrimaryUrl)
  .addAction(configureBasicAuth)
  .addAction(resetBasicAuthPassword)
