import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

// Upstream has no tagged releases; the version is the date of the pinned
// master commit (see UPDATING.md).
export const current = VersionInfo.of({
  version: '2026.6.30:2',
  releaseNotes: {
    en_US:
      'Initial release of Nitter for StartOS (upstream master @ 7f7092f, 2026-06-30).',
    es_ES:
      'Versión inicial de Nitter para StartOS (upstream master @ 7f7092f, 2026-06-30).',
    de_DE:
      'Erste Version von Nitter für StartOS (Upstream master @ 7f7092f, 2026-06-30).',
    pl_PL:
      'Pierwsze wydanie Nitter dla StartOS (upstream master @ 7f7092f, 2026-06-30).',
    fr_FR:
      'Version initiale de Nitter pour StartOS (upstream master @ 7f7092f, 2026-06-30).',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
