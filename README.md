# syncline

> Working name. Offline-first sync for React Native / Expo apps with a Node + TypeORM backend.

**Status:** v0.1 in progress.

## The problem

<!-- TODO: 3 to 4 sentences in your own words: apps used in the field lose data,
duplicate records when the network comes back, and overwrite other users' changes. -->

## How it works

<!-- TODO (week 4): sequence diagram of one sync cycle (push, then pull). -->

- The app only reads and writes local SQLite. A background `SyncClient` does the rest.
- Every local change becomes an operation in an outbox, sent with an idempotency key.
- Conflicts are resolved per field, last write wins, ordered by a hybrid logical clock.
  Deletes win.
- Clients pull changes incrementally using a server-side sequence as the cursor.

## Packages

| Package            | What it does                                                                 |
| ------------------ | ---------------------------------------------------------------------------- |
| `@syncline/core`   | Hybrid logical clock, field-level merge, protocol types. No dependencies.    |
| `@syncline/client` | Outbox, push/pull loop, retry with backoff, SQLite storage adapters.         |
| `@syncline/server` | Express router with `POST /sync/push` and `GET /sync/pull`, TypeORM + MySQL. |

## Design decisions

See [`docs/adr`](docs/adr).

## Development

```bash
pnpm install
pnpm test          # core + client unit tests
cp .env.example .env   # then point it at a MySQL database
pnpm test:all      # includes server and e2e tests
```

## Roadmap

- [ ] v0.1: core, server, client, two-offline-clients test, npm release
- [ ] v0.2: custom conflict resolver hook, React hooks, example app

## License

MIT
