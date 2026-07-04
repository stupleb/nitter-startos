import { sdk } from '../sdk'
import { addSession } from './addSession'
import { removeSessions } from './removeSessions'
import { setPrimaryUrl } from './setPrimaryUrl'

export const actions = sdk.Actions.of()
  .addAction(addSession)
  .addAction(removeSessions)
  .addAction(setPrimaryUrl)
