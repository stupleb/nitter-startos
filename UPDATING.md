# Updating the upstream version

This package wraps [zedeus/nitter](https://github.com/zedeus/nitter), consumed as the upstream-published Docker image `zedeus/nitter` (Docker Hub, multi-arch amd64+arm64).

## Determining the upstream version

Upstream publishes **no release tags** — the image is built from master commits and tagged with the full commit hash (plus a moving `latest`). Commits that only touch docs get no image, so the newest tag can trail master. This package therefore uses a **date-based version**: the commit date of the pinned image, as `YYYY.M.D`.

To find the newest image and its commit date:

```sh
curl -s 'https://hub.docker.com/v2/repositories/zedeus/nitter/tags?page_size=10' \
  | python3 -c "import json,sys; [print(t['name'], t['last_updated']) for t in json.load(sys.stdin)['results']]"
```

Pick the newest full-commit-hash tag (do not pin `latest` — it moves). Confirm the tag has both architectures before pinning it — `docker manifest inspect zedeus/nitter:<commit hash>` should list `amd64` and `arm64`. A commit whose image has only finished building for one arch will fail the other arch's build.

## Applying the bump

1. Bump `dockerTag` in `startos/manifest/index.ts` to `zedeus/nitter:<commit hash>`.
2. Update `version` in `startos/versions/current.ts` to the commit date (`YYYY.M.D:0`) and update the release notes (mention the short commit hash and date).
3. Check the upstream diff for changes to `nitter.example.conf` or `src/config.nim` — new/removed config keys must be reflected in `startos/fileModels/nitter.conf.ts`.
4. Check `src/auth.nim` and the [session tokens wiki page](https://github.com/zedeus/nitter/wiki/Creating-session-tokens) for changes to the `sessions.jsonl` format (currently `{"kind":"cookie","auth_token":...,"ct0":...}` per line) — the add-session action and `main.ts` renderer must match.

The Valkey sidecar (`valkey/valkey:8-alpine`) tracks its own major tag and rarely needs attention.
