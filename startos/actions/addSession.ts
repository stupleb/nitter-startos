import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { sessionsJson } from '../fileModels/sessions.json'

const { InputSpec, Value } = sdk

const cookiePattern = [
  {
    regex: '^[a-fA-F0-9]{16,}$',
    description: i18n('Must be a hexadecimal cookie value'),
  },
]

export const inputSpec = InputSpec.of({
  authToken: Value.text({
    name: i18n('auth_token cookie'),
    description: i18n(
      'The value of the "auth_token" cookie from a logged-in x.com browser session',
    ),
    required: true,
    default: null,
    masked: true,
    patterns: cookiePattern,
  }),
  ct0: Value.text({
    name: i18n('ct0 cookie'),
    description: i18n(
      'The value of the "ct0" cookie from the same x.com browser session',
    ),
    required: true,
    default: null,
    masked: true,
    patterns: cookiePattern,
  }),
  username: Value.text({
    name: i18n('Username (optional)'),
    description: i18n(
      'The X username the session belongs to. Only used to label the session for troubleshooting.',
    ),
    required: false,
    default: null,
    patterns: [
      {
        regex: '^@?[A-Za-z0-9_]{1,15}$',
        description: i18n('Must be a valid X username'),
      },
    ],
  }),
})

export const addSession = sdk.Action.withInput(
  // id
  'add-session',

  // metadata
  async ({ effects }) => ({
    name: i18n('Add X Account Session'),
    description: i18n(
      'Add session cookies from a logged-in X (Twitter) account. Nitter needs at least one session to fetch data. Use a burner account.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // form input specification
  inputSpec,

  // no prefill: cookies are write-only credentials
  async () => ({}),

  // the execution function
  async ({ effects, input }) => {
    const existing = (await sessionsJson.read((s) => s.sessions).once()) || []
    const session = {
      auth_token: input.authToken,
      ct0: input.ct0,
      ...(input.username ? { username: input.username.replace(/^@/, '') } : {}),
    }
    await sessionsJson.write(effects, {
      sessions: [
        ...existing.filter((s) => s.auth_token !== input.authToken),
        session,
      ],
    })

    return {
      version: '1' as const,
      title: i18n('Session added'),
      message: i18n(
        'The session was saved. Nitter restarts automatically to load it if the service is running.',
      ),
      result: null,
    }
  },
)
