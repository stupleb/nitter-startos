import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

// Upstream has no tagged releases; the version is the date of the pinned
// master commit (see UPDATING.md).
export const current = VersionInfo.of({
  version: '2026.6.30:2',
  releaseNotes: {
    en_US:
      "The Basic Auth prompt stays dismissed once you've made a choice. The Primary URL prompt clears itself when the address is available again.",
    es_ES:
      'El aviso de Basic Auth no vuelve a aparecer una vez que has elegido. El aviso de URL principal desaparece por sí solo cuando la dirección vuelve a estar disponible.',
    de_DE:
      'Die Basic-Auth-Aufforderung bleibt geschlossen, sobald du dich entschieden hast. Die Aufforderung zur primären URL verschwindet von selbst, sobald die Adresse wieder verfügbar ist.',
    pl_PL:
      'Monit Basic Auth nie wraca po dokonaniu wyboru. Monit o głównym adresie URL znika sam, gdy adres jest znów dostępny.',
    fr_FR:
      "L'invite Basic Auth ne réapparaît pas une fois votre choix fait. L'invite de l'URL principale disparaît d'elle-même dès que l'adresse est de nouveau disponible.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
