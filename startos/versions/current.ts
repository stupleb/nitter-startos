import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

// Upstream has no tagged releases; the version is the date of the pinned
// master commit (see UPDATING.md).
export const current = VersionInfo.of({
  version: '2026.6.30:1',
  releaseNotes: {
    en_US: 'Rebuilt on StartOS SDK 2.0.5. No changes to functionality.',
    es_ES:
      'Reconstruido con StartOS SDK 2.0.5. Sin cambios en la funcionalidad.',
    de_DE: 'Neu erstellt mit StartOS SDK 2.0.5. Keine funktionalen Änderungen.',
    pl_PL: 'Przebudowano na StartOS SDK 2.0.5. Bez zmian w funkcjonalności.',
    fr_FR:
      'Reconstruit avec le SDK StartOS 2.0.5. Aucun changement fonctionnel.',
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
