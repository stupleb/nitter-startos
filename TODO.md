# TODO

Migrated to StartOS SDK 2.0.5 (`2026.6.30:1`). Builds green (`tsc` + `ncc` + `s9pk pack`, both x86_64 and aarch64) and fully device-tested: fresh install, upgrade in place over `2026.6.30:0`, sessions + timeline load, primary URL (install default, Set Primary URL action, survives restart), Basic Auth end to end, and both critical-task branches (all sessions removed; primary URL's address removed). That covers both APIs the migration touched — `sdk.host.getOwn` for own URLs, and lazy `SubContainer` / awaited `rootfs`.

CI moved back to the shared Start9 workflows in the same change. The `Pin start-cli v0.4.0-beta.9` step in `build.yml`/`release.yml` existed only because the package was SDK 1.5.3 — that CLI cannot pack a 2.0.5 package, so it had to go with the migration.

- [ ] Consider exposing upstream `proxy`/`apiProxy` options for Tor-routed fetching
- [ ] Consider a config action for RSS toggles / instance title
