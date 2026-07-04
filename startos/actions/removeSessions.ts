import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { sessionsJson } from '../fileModels/sessions.json'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  sessions: Value.dynamicMultiselect(async ({ effects }) => {
    const sessions = (await sessionsJson.read((s) => s.sessions).once()) || []
    return {
      name: i18n('Sessions to remove'),
      description: i18n(
        'Sessions are labeled by username when provided, otherwise by the first characters of their auth_token.',
      ),
      values: Object.fromEntries(
        sessions.map((s) => [
          s.auth_token,
          s.username ? `@${s.username}` : `${s.auth_token.slice(0, 8)}…`,
        ]),
      ),
      default: [],
    }
  }),
})

export const removeSessions = sdk.Action.withInput(
  // id
  'remove-sessions',

  // metadata
  async ({ effects }) => ({
    name: i18n('Remove X Account Sessions'),
    description: i18n(
      'Remove stored X account sessions, e.g. after revoking a session or deleting the account.',
    ),
    warning: i18n('Nitter cannot fetch any data without at least one session.'),
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // no prefill
  async () => ({}),

  // the execution function
  async ({ effects, input }) => {
    const existing = (await sessionsJson.read((s) => s.sessions).once()) || []
    const remaining = existing.filter(
      (s) => !input.sessions.includes(s.auth_token),
    )
    await sessionsJson.write(effects, { sessions: remaining })

    return {
      version: '1' as const,
      title: i18n('Sessions removed'),
      message:
        remaining.length > 0
          ? i18n('The selected sessions were removed.')
          : i18n(
              'All sessions were removed. Add a new session so Nitter can fetch data.',
            ),
      result: null,
    }
  },
)
