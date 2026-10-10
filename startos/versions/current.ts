import { IMPOSSIBLE, VersionInfo } from '@start9labs/start-sdk'

// Upstream has no tagged releases; the version is the date of the pinned
// master commit (see UPDATING.md).
export const current = VersionInfo.of({
  version: '2026.8.24:0',
  releaseNotes: {
    en_US:
      "Nitter is updated to upstream's 2026-08-24 build (8142bab), with its fixes for X's current site plus reply sorting, more search tabs, tweet embeds and an Articles tab.",
    es_ES:
      'Nitter se actualiza a la versión de upstream del 2026-08-24 (8142bab), con sus correcciones para el sitio actual de X, además de ordenación de respuestas, más pestañas de búsqueda, tuits incrustados y una pestaña de Artículos.',
    de_DE:
      'Nitter wird auf den Upstream-Stand vom 2026-08-24 (8142bab) aktualisiert, mit dessen Anpassungen an die aktuelle X-Website sowie Antwortsortierung, weiteren Suchreitern, eingebetteten Tweets und einem Artikel-Reiter.',
    pl_PL:
      'Nitter zostaje zaktualizowany do wersji upstream z 2026-08-24 (8142bab), z jej poprawkami dla obecnej strony X oraz sortowaniem odpowiedzi, dodatkowymi kartami wyszukiwania, osadzaniem tweetów i kartą Artykuły.',
    fr_FR:
      "Nitter est mis à jour vers la version upstream du 2026-08-24 (8142bab), avec ses correctifs pour le site actuel de X, ainsi que le tri des réponses, davantage d'onglets de recherche, l'intégration de tweets et un onglet Articles.",
  },
  migrations: {
    up: async ({ effects }) => {},
    down: IMPOSSIBLE,
  },
})
