# Zeller Customers

A React Native app (Expo SDK 54, TypeScript) that syncs customers from the Zeller GraphQL API into
a local SQLite database, and lets you browse, filter, search, add, edit and delete them. The UI
only ever reads from the database, so everything works offline.

## Requirements checklist

| Requirement                                        | Where                                                                                        |
| -------------------------------------------------- | -------------------------------------------------------------------------------------------- |
| Fetch with `listZellerCustomers`                   | `features/customers/api/listZellerCustomers.ts` (paginated via `nextToken`)                  |
| Store in a local database, display from it         | SQLite via `expo-sqlite`: `features/customers/data/customerRepository.ts`                    |
| Add, update, delete locally                        | `CustomerFormScreen` + `useCustomerForm`                                                     |
| Validation (required, letters/spaces, ≤ 50, email) | `features/customers/domain/validation.ts`                                                    |
| Filter by role, search by name                     | Tabs + search on `CustomerListScreen`                                                        |
| Pull to refresh                                    | `CustomerSectionList`                                                                        |
| Pager swipe with animated tabs                     | `react-native-pager-view` + Reanimated; the tab indicator follows the swipe position         |
| iOS and Android                                    | Tested on an iPhone 17 Pro simulator (iOS 26) and a Pixel emulator (API 33)                  |
| Tests                                              | Unit + integration tests in `__tests__/`, E2E flows in `.maestro/` (see [Testing](#testing)) |

## Getting started

### Prerequisites

- Node 20.19+ and Yarn 1
- iOS: Xcode with a simulator, and CocoaPods
- Android: Android Studio with an emulator, JDK 17, and `adb` on your `PATH`
  (see Expo's [environment setup](https://docs.expo.dev/get-started/set-up-your-environment/?mode=development-build&buildEnv=local))
- No global Expo or EAS CLI needed: the Expo CLI comes with the project's dependencies

### 1. Start the mock server

It lives in the challenge repository, whose `package.json` is missing `graphql`:

```bash
git clone https://github.com/zeller-public/zeller-rn-codechallenge.git
cd zeller-rn-codechallenge/mock-server
yarn add graphql@^16
node index.js          # http://localhost:9002/
```

### 2. Run the app

```bash
yarn install
yarn ios       # or: yarn android
```

There is no `ios/` or `android/` folder in the repo: Expo generates them on the first run
(Continuous Native Generation), including the Android debug keystore.

`yarn android` also runs `adb reverse tcp:9002 tcp:9002`, so `localhost` on the emulator reaches
the mock server on your machine.

### Environment

| File         | Purpose                                                                          |
| ------------ | -------------------------------------------------------------------------------- |
| `.env`       | Committed defaults (the local mock server, no API key); documents every variable |
| `.env.local` | Your overrides (gitignored), e.g. a physical device or the live API              |

On a **physical device**, set `EXPO_PUBLIC_GRAPHQL_URL` in `.env.local` to your machine's LAN IP,
e.g. `http://192.168.1.10:9002/`.

### Using the live API

No code changes are needed. Copy the two commented "Live AppSync API" lines from `.env` into a
new `.env.local`, uncommented, with the values from the challenge's `aws-exports.js`:

```bash
EXPO_PUBLIC_GRAPHQL_URL=<aws_appsync_graphqlEndpoint>
EXPO_PUBLIC_GRAPHQL_API_KEY=<aws_appsync_apiKey>
```

Use `.env.local` rather than editing `.env`: `.env` is committed, so a key put there would end up
in git.

Restart with `yarn start --clear` (or run `yarn ios` / `yarn android` again), since env values
are bundled at build time. Delete `.env.local` to switch back. The provided key has expired, so
the sync fails and the app shows its saved customers.

## Scripts

| Script                 | Does                                  |
| ---------------------- | ------------------------------------- |
| `yarn ios` / `android` | Build and run on a simulator/emulator |
| `yarn start`           | Start Metro for an existing build     |
| `yarn test`            | Run all tests                         |
| `yarn test:watch`      | Tests in watch mode                   |
| `yarn test:coverage`   | Tests with a coverage report          |
| `yarn lint`            | ESLint                                |
| `yarn typecheck`       | TypeScript, no emit                   |
| `yarn format`          | Prettier (`format:check` to verify)   |

## Testing

```bash
yarn test
```

99 tests, about 82% line coverage. Tests describe behaviour a user or caller can observe, not
implementation details.

| Kind        | What                                                                                      | Where                                            |
| ----------- | ----------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Unit        | Validation rules, form mapping, A–Z grouping, role filter, API mapping, sync paging rules | `__tests__/features/customers/{domain,api,data}` |
| Integration | Both screens rendered inside the real navigator, driven like a user (tap, type, refresh)  | `__tests__/features/customers/screens`           |
| E2E         | The real app on a simulator/emulator, with real SQLite and the mock server (Maestro)      | `.maestro/`                                      |

Integration tests render the whole app against an in-memory repository and a fake API, injected
through `CustomersProvider`. The real SQL runs only in the E2E flows, as Jest has no SQLite engine.

### E2E (Maestro)

Five [Maestro](https://maestro.mobile.dev) flows run the real app on a simulator or emulator,
covering local-wins sync, soft delete, create and the role tabs. Four (`regression`) rely on the
mock server's data; one (`smoke`) creates and removes its own customer, so it works against any
server. All pass on an iPhone 17 Pro simulator (iOS 26) and a Pixel emulator (Android API 33).

```bash
maestro test .maestro                        # all flows (mock server)
maestro test --include-tags smoke .maestro   # the server-independent flow only
```

## Architecture

```
src/
├── app/                 App root, navigation, wiring of real implementations
├── config/              Environment variables
├── core/                App-wide infrastructure: SQLite (provider, migrations), GraphQL client
├── shared/              Feature-agnostic UI kit, theme, hooks, types
└── features/customers/
    ├── api/             GraphQL query, API types, mapping to the domain
    ├── data/            Repository (SQLite), sync service, dependency context
    ├── domain/          Pure types and rules: roles, validation, form mapping, sections
    ├── hooks/           React state: list, sync, form
    ├── components/      Feature UI: row, sectioned list
    └── screens/         List and form screens
```

### Data flow

```
GraphQL API ──(sync service)──▶ SQLite ──(repository)──▶ hooks ──▶ screens
                                   ▲                                  │
                                   └──── create / update / delete ────┘
```

- **SQLite is the single source of truth.** The sync writes API data into it; the UI only reads
  from it. Apollo runs with `fetchPolicy: 'no-cache'` so there is no second copy to drift.
- **The list updates itself.** The repository reports changes (SQLite's change listener), and
  `useCustomers` re-reads, so a save, delete or sync shows up without manual refreshes.
- **Dependencies are injected.** Hooks get the repository and the API from `CustomersProvider`.
  `app/AppCustomersProvider` plugs in SQLite and Apollo; tests plug in fakes.
- **State management** is hooks and context: the database is the store, so there's no global
  client state that would justify Redux or Zustand.

### Sync and local changes

The API is read-only (the brief requires no mutations), so local changes must survive syncs:

- Each row has a `source` (`remote` or `local`) and an `is_dirty` flag (it has changes the server
  doesn't know about). Create, update and delete all set `is_dirty`.
- **Local wins:** a sync updates only clean rows, never touches rows created in the app, and only
  removes clean remote rows the server no longer returns.
- **Deletes are soft** (`deleted_at` tombstone), so a deleted customer doesn't come back on the
  next sync.
- The sync fetches every page (with guards against a repeated token or endless paging), then
  applies them in one transaction. If anything fails, the database is left unchanged and the list
  shows "Couldn't refresh. Showing saved customers."

## Decisions and trade-offs

| Decision                              | Why                                                                                                                                                                      |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `expo-sqlite`, plain SQL              | The data model is one table. A repository plus versioned migrations (`PRAGMA user_version`) keeps it small; an ORM (Drizzle) would be the next step as the schema grows. |
| React Navigation, not Expo Router     | Two screens; a typed native stack is simpler than file-based routing here.                                                                                               |
| Hand-written GraphQL types            | One query. `TypedDocumentNode` keeps it type-safe; codegen becomes worth it with more operations.                                                                        |
| Unknown role from the API             | Kept with no role: shown under "All" only, and the form asks for a role when edited.                                                                                     |
| Customer with no name                 | Skipped during sync (counted and logged): it can't be shown or searched.                                                                                                 |
| First and last name                   | The design has two fields; they're joined into the stored `name`. Last name is optional. The 50-character limit applies to the full name.                                |
| Names are letters A–Z and spaces only | As the brief says. So the mock data (`TestCustomer1`) displays fine but fails validation if edited, which is intended.                                                   |
| Email                                 | Optional; a pragmatic `something@domain.tld` check rather than full RFC 5322.                                                                                            |
| No paging of the local list           | `SectionList` virtualises rendering, so only visible rows are drawn. Keyset pagination in SQL would be the upgrade path for very large lists.                            |

## What I'd add next

- **Push local changes** once the API has mutations: queue dirty rows and send them (an outbox).
- **Sync again** automatically when the app returns to the foreground or the network comes back.
- **Run the E2E flows in CI** on every pull request (e.g. Maestro Cloud or an emulator on CI).
- **Mark-and-sweep sync** for large customer lists: save each page as it arrives and remove stale
  rows only after a complete pass, instead of holding every page in memory.
- **GraphQL codegen** from `schema.gql` once there are more operations.
