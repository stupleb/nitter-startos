export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting Nitter!': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,

  // interfaces.ts
  'Web UI': 4,
  'The web interface of Nitter': 5,

  // actions/addSession.ts
  'Must be a hexadecimal cookie value': 6,
  'auth_token cookie': 7,
  'The value of the "auth_token" cookie from a logged-in x.com browser session': 8,
  'ct0 cookie': 9,
  'The value of the "ct0" cookie from the same x.com browser session': 10,
  'Username (optional)': 11,
  'The X username the session belongs to. Only used to label the session for troubleshooting.': 12,
  'Must be a valid X username': 13,
  'Add X Account Session': 14,
  'Add session cookies from a logged-in X (Twitter) account. Nitter needs at least one session to fetch data. Use a burner account.': 15,
  'Session added': 16,
  'The session was saved. Nitter restarts automatically to load it if the service is running.': 17,

  // actions/removeSessions.ts
  'Sessions to remove': 18,
  'Sessions are labeled by username when provided, otherwise by the first characters of their auth_token.': 19,
  'Remove X Account Sessions': 20,
  'Remove stored X account sessions, e.g. after revoking a session or deleting the account.': 21,
  'Nitter cannot fetch any data without at least one session.': 22,
  'Sessions removed': 23,
  'The selected sessions were removed.': 24,
  'All sessions were removed. Add a new session so Nitter can fetch data.': 25,

  // actions/setPrimaryUrl.ts
  URL: 26,
  'Set Primary URL': 27,
  'Choose which of your Nitter URLs is used for generating links, such as RSS feed and canonical URLs.': 28,

  // init/taskSessions.ts
  'Nitter requires session cookies from a real X (Twitter) account to fetch data. Add a session to start the service.': 29,

  // init/taskPrimaryUrl.ts
  'Primary URL removed. Select a new primary URL.': 30,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
