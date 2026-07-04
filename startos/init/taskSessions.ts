import { addSession } from '../actions/addSession'
import { sessionsJson } from '../fileModels/sessions.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'

export const taskSessions = sdk.setupOnInit(async (effects) => {
  const sessions = await sessionsJson.read((s) => s.sessions).const(effects)

  if (!sessions?.length) {
    await sdk.action.createOwnTask(effects, addSession, 'critical', {
      reason: i18n(
        'Nitter requires session cookies from a real X (Twitter) account to fetch data. Add a session to start the service.',
      ),
    })
  }
})
