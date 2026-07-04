<p align="center">
  <img src="icon.svg" alt="Nitter Logo" width="21%">
</p>

# Nitter on StartOS

> **Upstream repo:** <https://github.com/zedeus/nitter>
>
> Everything not listed in this document should behave the same as upstream
> Nitter. If a feature, setting, or behavior is not mentioned here, the
> upstream documentation is accurate and fully applicable.

Nitter is a lightweight, JavaScript-free front-end for X (Twitter): browse profiles, tweets, and searches without ads or tracking, and subscribe to accounts via RSS. Since X removed guest access, every Nitter instance requires session cookies from a real X account — this package manages those sessions through StartOS actions.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Configuration Management](#configuration-management)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Actions (StartOS UI)](#actions-startos-ui)
- [Backups and Restore](#backups-and-restore)
- [Health Checks](#health-checks)
- [Dependencies](#dependencies)
- [Limitations and Differences](#limitations-and-differences)
- [What Is Unchanged from Upstream](#what-is-unchanged-from-upstream)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

| Property      | Value                                                            |
| ------------- | ---------------------------------------------------------------- |
| Images        | `zedeus/nitter` (upstream, unmodified), `valkey/valkey` (cache)  |
| Architectures | x86_64, aarch64                                                  |
| Command       | `./nitter` in `/src` (upstream default), plus a Valkey daemon    |

The upstream image is pinned to a specific master commit tag (upstream publishes no release tags). `NITTER_CONF_FILE` and `NITTER_SESSIONS_FILE` are set so nitter reads its config and sessions from the `main` volume instead of the image's baked-in defaults.

---

## Volume and Data Layout

| Volume | Mount Point | Purpose                                          |
| ------ | ----------- | ------------------------------------------------ |
| `main` | `/data`     | `nitter.conf`, `sessions.json`, `sessions.jsonl` |

- `nitter.conf` — the upstream config file, generated and managed by StartOS (Nim parsecfg format).
- `sessions.json` — StartOS-managed source of truth for X account sessions, edited via actions.
- `sessions.jsonl` — rendered from `sessions.json` on every service start; this is the file nitter actually reads.

The Valkey cache is ephemeral and has no volume.

---

## Installation and First-Run Flow

1. On install, `nitter.conf` is seeded with upstream defaults plus a randomly generated `hmacKey`, and the primary URL is defaulted to the service's `.local` address.
2. A **critical task** blocks startup until you complete the **Add X Account Session** action — nitter cannot fetch any data (and exits at startup) without at least one session.
3. Session cookies (`auth_token`, `ct0`) are copied from a logged-in x.com browser session; see `instructions.md` for the walkthrough. A burner account is strongly recommended.

---

## Configuration Management

| StartOS-Managed (via actions / generated config)                          | Upstream-Managed (via Nitter's own UI)          |
| ------------------------------------------------------------------------- | ----------------------------------------------- |
| `Server` section (hostname, port, address), `Cache` section (Valkey), `hmacKey`, sessions | Per-browser display preferences (`/settings` page, stored in cookies) |

Settings enforced by this package: nitter listens on `0.0.0.0:8080`; Valkey runs on `localhost:6379` with persistence disabled; `enableDebug` is forced off. The `Server.hostname` and `Server.https` values are controlled by the **Set Primary URL** action and determine how RSS and canonical links are generated.

---

## Network Access and Interfaces

| Interface | Port | Protocol | Purpose            |
| --------- | ---- | -------- | ------------------ |
| Web UI    | 8080 | HTTP     | Nitter web interface |

**Access methods:**

- LAN IP with unique port
- `<hostname>.local` with unique port
- Tor `.onion` address
- Custom domains (if configured)

---

## Actions (StartOS UI)

| Action                    | ID                | Availability | Purpose                                                                                          |
| ------------------------- | ----------------- | ------------ | ------------------------------------------------------------------------------------------------ |
| Add X Account Session     | `add-session`     | Any status   | Store `auth_token` + `ct0` cookies (and optional username label) from a logged-in X account. Re-adding the same `auth_token` replaces that entry. |
| Remove X Account Sessions | `remove-sessions` | Any status   | Select and delete stored sessions.                                                                |
| Set Primary URL           | `set-primary-url` | Any status   | Choose which service URL nitter uses for generated links (RSS, canonical).                        |

Session or config changes restart the service automatically (nitter only reads both at startup).

---

## Backups and Restore

**Included in backup:**

- `main` volume (config and sessions)

**Restore behavior:** Volume is fully restored before the service starts. Sessions are restored with it — if X has since revoked them, remove and re-add sessions.

---

## Health Checks

| Check         | Method                 | Messages                                                                        |
| ------------- | ---------------------- | ------------------------------------------------------------------------------- |
| Web Interface | Port listening (8080)  | Success: "The web interface is ready" / Error: "The web interface is not ready" |
| Valkey        | `valkey-cli ping` (internal, hidden) | Not user-visible; gates nitter startup ordering.                   |

---

## Dependencies

None.

---

## Limitations and Differences

1. **An X account is mandatory** — upstream removed all guest/anonymous access methods. Without at least one valid session, the service will not start (blocked by a critical task) and cannot fetch data.
2. **Sessions can be invalidated by X at any time** — logging out of the browser session that produced the cookies, changing the account password, or X-side restrictions will break the session. Remove and re-add sessions when this happens.
3. **Session creation is manual** — upstream ships Python helper scripts (`tools/create_session_*.py`); this package instead takes the two cookies directly via the Add Session action, so no script is needed.
4. **`enableDebug` is forced off** — the `/.sessions` debug endpoint is not available.
5. **No proxy support wired up** — upstream's `proxy`/`apiProxy` config options are not currently exposed.
6. **RSS/canonical links use one primary URL** — nitter generates absolute links from a single configured hostname; links reflect the URL chosen in Set Primary URL, regardless of which address you're browsing from.

---

## What Is Unchanged from Upstream

- The Nitter web UI, all browsing/search/RSS features, and per-browser preferences (`/settings`).
- The upstream Docker image runs unmodified — same binary, same static assets, same entrypoint semantics.
- The `nitter.conf` format and all its defaults except the values listed above.

---

## Contributing

Build with `make` (requires `start-cli`). See the [StartOS Packaging Guide](https://docs.start9.com/packaging) for workspace setup, and [UPDATING.md](UPDATING.md) for how to bump the upstream version.

---

## Quick Reference for AI Consumers

```yaml
package_id: nitter
images: [zedeus/nitter, valkey/valkey]
architectures: [x86_64, aarch64]
volumes:
  main: /data
ports:
  ui: 8080
dependencies: none
startos_managed_env_vars:
  - NITTER_CONF_FILE
  - NITTER_SESSIONS_FILE
actions:
  - add-session
  - remove-sessions
  - set-primary-url
```
