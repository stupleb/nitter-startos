<p align="center">
  <img src="icon.svg" alt="Nitter Logo" width="21%">
</p>

# Nitter on StartOS

> Everything not listed in this document should behave the same as upstream
> Nitter. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable — see the
> Documentation section of `instructions.md` for links.

Nitter is a lightweight, JavaScript-free front-end for X (Twitter) — browse profiles, tweets, and searches without ads or tracking, and subscribe to accounts over RSS. The upstream project is [zedeus/nitter](https://github.com/zedeus/nitter). What this package adds on top of upstream is session management, a bundled cache and reverse proxy, a managed primary URL, and optional Basic Auth; the rest of this file describes only those differences.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

Three images run together: the upstream Nitter image unmodified, a Valkey cache, and a Caddy reverse proxy. All three are published upstream and pinned by tag in the manifest; none is rebuilt from a local Dockerfile.

| Property      | Value                                                            |
| ------------- | --------------------------------------------------------------- |
| Images        | `zedeus/nitter` (unmodified), `valkey/valkey`, `caddy`          |
| Architectures | x86_64, aarch64                                                 |
| Entrypoint    | Nitter runs its default `./nitter` from `/src`; Valkey and Caddy run their default binaries |

The package runs three subcontainers — `nitter-sub`, `valkey-sub`, and `caddy-sub` — started in that dependency order (Valkey, then Nitter, then Caddy). Attach to one with `start-cli package attach nitter -n <subcontainer-name>`. Caddy owns the exposed port and proxies to Nitter, which listens only inside the pod; Valkey is Nitter's cache. Nitter is pointed at its config and session files on the `main` volume through the `NITTER_CONF_FILE` and `NITTER_SESSIONS_FILE` environment variables rather than the image's baked-in defaults.

---

## Volume and Data Layout

A single volume, `main`, holds everything that persists; it is mounted into the Nitter subcontainer at `/data`. The Valkey and Caddy subcontainers mount no volume — the cache is deliberately ephemeral and the Caddyfile is regenerated on every start.

| Volume | Mount Point | Contents                                                       |
| ------ | ----------- | ------------------------------------------------------------- |
| `main` | `/data`     | `nitter.conf`, `sessions.json`, `sessions.jsonl`, `store.json` |

---

## File Models

The package manages four files on the `main` volume. Three are typed file models; the fourth is rendered from one of them on every start.

- **`nitter.conf`** — the upstream Nim `parsecfg` config. Created at install with upstream defaults plus a randomly generated `hmacKey`, and saved again at every init (each boot, update or restore), which fills in any missing key. Nitter reads this file directly, so a hand edit takes effect. Two caveats on ownership: the `Server.hostname` / `Server.https` keys are rewritten by the **Set Primary URL** action and the first-run primary-URL step, and the keys that wire Nitter into StartOS are re-asserted on every save — `Server.address` (`0.0.0.0`), `Server.port` (`8080`), `Server.staticDir`, `Cache.redisHost`/`redisPort` (the Valkey endpoint), and `Config.enableDebug` (held off). Every other key is yours, including ones the package doesn't model, such as upstream's per-feed RSS switches or a `[Preferences]` section; a valid hand edit survives. Comments in the file are not kept.
- **`sessions.json`** — the source of truth for X account sessions, an array of `{ auth_token, ct0, username? }`. Written only by the Add / Remove Session actions, which replace the array wholesale; it is seeded empty. A hand edit is lost the next time either action runs.
- **`store.json`** — StartOS-only state with no upstream equivalent: the Basic Auth record (`enabled`, `username`, `password`). The password is kept in plaintext so the configure/reset actions can re-display it; only a bcrypt hash of it ever reaches Caddy. Written by the Basic Auth actions and not seeded at install: the file first appears when Configure Basic Auth runs, and until then its absence is what marks Basic Auth as undecided (see [Tasks](#tasks)).
- **`sessions.jsonl`** — not a model. Rendered from `sessions.json` into the file Nitter actually reads (`NITTER_SESSIONS_FILE`) on every start, one `{"kind":"cookie",…}` object per line. A hand edit is overwritten each start.

---

## Dependencies

None. Nitter needs an X account session (supplied through an action), not another StartOS service.

---

## Network Access and Interfaces

One interface, served by Caddy.

| Interface | ID   | Type | Port | Protocol | Purpose                    |
| --------- | ---- | ---- | ---- | -------- | -------------------------- |
| Web UI    | `ui` | ui   | 80   | HTTP     | The Nitter web interface   |

Caddy listens on port 80 and reverse-proxies to Nitter on its internal port; when Basic Auth is enabled, Caddy enforces it here before proxying. Nitter's own port is never exposed as an interface.

---

## Installation and First-Run Flow

Nitter has no upstream setup wizard; StartOS does the first-run setup through init and tasks.

1. `nitter.conf` and `sessions.json` are seeded with their defaults, including a random `hmacKey`.
2. If the server already has a reachable address, the primary URL is defaulted to its `.local` address (the first non-local address otherwise). This is what RSS and canonical links are built from.
3. A **critical** task requires **Add X Account Session** before the service can start — Nitter cannot fetch anything without at least one session. See [Tasks](#tasks).
4. A non-blocking **important** task invites you to decide on Basic Auth. The service starts and runs whatever you choose.

Session, config, and Basic Auth changes are all read at startup, so each one restarts the service to take effect.

---

## Actions

All actions are available in any service status. Session cookies are write-only (never pre-filled). The Basic Auth actions return the credentials in their result.

- **Add X Account Session** — run it to give Nitter an account to fetch with, both for the first-run critical task and to add spares that spread requests across accounts. Appends to `sessions.json` (re-adding the same `auth_token` replaces that one entry) and restarts the service. Safe to repeat.
- **Remove X Account Sessions** — run it after an account is banned or a cookie is rotated. Deletes the selected sessions from `sessions.json` and restarts. Removing the last session re-raises the critical session task.
- **Set Primary URL** — run it when RSS or canonical links point at the wrong address (for example, you now reach Nitter over Tor). Writes `Server.hostname` / `Server.https` in `nitter.conf` and restarts. It offers the service's current non-local addresses to choose from.
- **Configure Basic Auth** — run it to turn the login requirement on or off. Turning it on generates a username (`admin`) and password if none is stored and returns them; turning it off keeps the stored credentials so re-enabling restores the same login. Restarts the service.
- **Reset Basic Auth Password** — run it to rotate the password; it returns the new one. Hidden while Basic Auth is off, so it is only user-facing once Basic Auth is enabled.

---

## Tasks

The package raises three tasks. The first two block or gate the service; the third is advisory.

- **Add X Account Session** (`critical`) — raised while `sessions.json` holds no sessions. A critical task blocks startup and suspends the ordinary controls until it is satisfied. Cleared by adding a session; returns if every session is later removed.
- **Set Primary URL** (`critical`) — raised when a primary URL is already set but the service's current addresses don't include it (e.g. a domain was removed). Not raised while the address list is empty, which means the addresses aren't known yet, nor on a fresh install, where the primary URL is defaulted instead. Clears itself once the primary URL is among the addresses again, or when you choose a new one. Clearing doesn't restart a service the task already stopped.
- **Configure Basic Auth** (`important`) — raised until Configure Basic Auth has run once, whichever way you choose. That first run creates `store.json`; from then on the task is cleared and doesn't return. Non-blocking.

---

## Health Checks

One health check is surfaced.

| Check         | Probes                         | What a failure means                                                                 |
| ------------- | ------------------------------ | ------------------------------------------------------------------------------------ |
| Web Interface | Nitter listening on port 8080  | Still starting, or Nitter exited — most often because no valid session is configured |

The Valkey and Caddy daemons carry readiness probes too (Valkey answers `PING`; Caddy listens on port 80), but these have no display and are not shown; they only gate the startup order.

---

## Backups and Restore

The strategy is a wholesale volume copy (`ofVolumes('main')`): the entire `main` volume is captured, so `nitter.conf`, `sessions.json`, and `store.json` — config, sessions, and Basic Auth credentials — are all in the backup.

The volume is restored before the service starts; nothing has to be rebuilt afterwards. The one caveat is sessions: cookies restored from an older backup may have been revoked by X in the meantime, in which case remove and re-add them. The Valkey cache is never in a backup — it holds nothing that needs to survive.

---

## Limitations and Differences

1. **An X account is mandatory.** Upstream removed guest access, so without at least one valid session the service will not start (held by the critical task) and cannot fetch data.
2. **Sessions can be invalidated by X at any time.** Logging out of the browser that produced the cookies, changing the account password, or an X-side restriction breaks a session; remove and re-add it when that happens.
3. **Session creation is manual.** Upstream ships Python helper scripts; this package instead takes the two cookies directly through the Add Session action, so no script is run.
4. **`enableDebug` is held off.** The `/.sessions` debug endpoint is unavailable.
5. **No proxy support is wired up.** Upstream's `proxy` / `apiProxy` options are not exposed.
6. **Links use one primary URL.** Nitter builds absolute RSS and canonical links from the single configured hostname, regardless of which address you are browsing from.
7. **Basic Auth applies to everything.** When enabled, RSS readers must also present the credentials (most support Basic Auth or `user:pass@host` URLs).

---

## Quick Reference for AI Consumers

```yaml
package_id: nitter
images: # never a tag
  - zedeus/nitter
  - valkey/valkey
  - caddy
architectures: [x86_64, aarch64]
subcontainers: [nitter-sub, valkey-sub, caddy-sub]
volumes:
  main: /data
file_models:
  - nitter.conf
  - sessions.json
  - store.json
startos_managed_env_vars:
  - NITTER_CONF_FILE
  - NITTER_SESSIONS_FILE
dependencies: none
interfaces:
  ui: { type: ui, port: 80 }
actions:
  - add-session
  - remove-sessions
  - set-primary-url
  - configure-basic-auth
  - reset-basic-auth-password
tasks:
  - { action: add-session, severity: critical }
  - { action: set-primary-url, severity: critical }
  - { action: configure-basic-auth, severity: important }
health_checks:
  - nitter # displayed as "Web Interface"
```
