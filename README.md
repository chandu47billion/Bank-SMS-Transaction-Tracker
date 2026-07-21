# MoneyFlow

MoneyFlow is a premium, offline-first personal finance tracker for Android, built with
**React Native**. It reads your bank transaction SMS messages, automatically parses and
categorizes each one, and stores everything locally in an on-device SQLite database —
no server, no account, no data ever leaves your phone.

## What it does

- **Automatic SMS transaction tracking** — scans your SMS inbox for bank alerts (HDFC,
  SBI, ICICI, Axis, Kotak, PNB and generic UPI/ATM formats), extracts amount, type
  (credit/debit), bank, account last 4 digits, merchant, balance and reference number,
  and auto-categorizes each transaction.
- **Dashboard** — net balance, today's credit/debit, monthly income vs. expense,
  category breakdown and recent activity at a glance.
- **Transactions** — full searchable history with date/bank filters and infinite scroll.
- **Analytics** — monthly trends, category breakdown, top spending categories and daily
  spending pattern, with a month selector.
- **Budgets** — set a monthly limit per category with progress bars and overspend alerts.
- **Categories & Banks** — spend-by-category grid and per-bank transaction summaries.
- **Notifications** — locally generated insights (salary credited, large expense alerts,
  low balance warnings, unusual spending, weekly summary).
- **Profile & Settings** — dark mode, CSV export (simulated), backup (simulated), and a
  Premium upsell screen.

All data is generated locally: 46 realistic sample transactions are seeded on first
launch (spanning the last ~2 months, across salaries, food delivery, shopping, bills,
fuel, medical, entertainment, ATM withdrawals and UPI transfers) so the app is fully
populated even before real SMS are parsed.

## Tech stack

| Concern            | Library |
|---------------------|---------|
| Framework            | React Native 0.73 (JavaScript, Android only) |
| UI / theming         | react-native-paper (Material 3), react-native-vector-icons |
| Navigation           | @react-navigation/native, bottom-tabs, stack |
| Local persistence    | react-native-sqlite-storage |
| Charts               | victory-native + react-native-svg |
| Permissions          | react-native-permissions |
| Global state         | React Context (`src/store/AppContext.js`) — no Redux |
| Gradients            | react-native-linear-gradient |
| Dates                | date-fns |

## Project structure

```
src/
  theme/        Color tokens, typography scale, Paper MD3 light/dark theme
  database/     SQLite bootstrap, schema, and CRUD for transactions/categories/budgets/settings
  sms/          SMS parsing pipeline: bank regex patterns, parser, auto-categorizer, Android bridge
  data/         Static seed data: banks, categories, 46 sample transactions
  components/
    common/     Button, Card, TransactionItem, SearchBar, Chip, EmptyState, LoadingSkeleton, AmountText, Avatar
    charts/     SpendingPieChart, IncomeExpenseChart, MonthlyTrendChart, CategoryBarChart
    dialogs/    ConfirmDialog, SuccessDialog, BottomSheet
  screens/      Splash, Onboarding, Permission, Dashboard, Transactions, Analytics,
                Budget, Categories, Notifications, Banks, Search, Profile, Premium
  navigation/   Root stack (AppNavigator) + bottom tabs (BottomTabNavigator)
  store/        AppContext.js — global app state and actions
  utils/        Formatters, date-range/aggregation helpers, notification generator
App.js          Root component: providers, theme, navigation
index.js        RN entry point
```

## How SMS parsing works

1. `src/sms/bridge.js` requests `READ_SMS`/`RECEIVE_SMS` permissions via
   `react-native-permissions` and reads the inbox (gracefully no-ops if the native SMS
   module isn't available, e.g. in dev tooling).
2. `src/sms/patterns.js` holds bank-specific and generic regex patterns for amount, debit/
   credit keywords, account tail, balance, and reference number.
3. `src/sms/parser.js` runs each message through the bank-specific pattern first, falls
   back to generic debit/credit patterns, and extracts a normalized transaction object.
   Balance-enquiry-only messages and non-transactional SMS are filtered out.
4. `src/sms/categorizer.js` assigns a category using merchant/description keyword
   matching (e.g. "swiggy" → Food, "irctc" → Travel, "netflix" → Entertainment), falling
   back to UPI/ATM/Others.
5. Parsed transactions are bulk-inserted into SQLite and the UI refreshes automatically.

## Android permissions

Declared in `android/app/src/main/AndroidManifest.xml`:

- `android.permission.READ_SMS` — read existing SMS to detect past transactions
- `android.permission.RECEIVE_SMS` — detect new transaction SMS as they arrive
- `android.permission.INTERNET` — reserved for future sync/backup features

Permissions are requested at runtime (Android 6+) from the onboarding **Permission**
screen. If denied, the app still works fully using the seeded sample data.

## Setup & running

### Prerequisites

- Node.js 18+
- A configured Android development environment (Android Studio, SDK, an emulator or a
  physical device with USB debugging) — see the official [React Native environment
  setup guide](https://reactnative.dev/docs/environment-setup) for Android.

### Install dependencies

```bash
npm install --legacy-peer-deps
```

### Run on Android

```bash
npx react-native start        # in one terminal, starts Metro
npx react-native run-android  # in another terminal, builds & installs the debug APK
```

On first launch you'll see the splash screen, a 3-page onboarding flow, and then the
SMS permission screen. Grant permission to auto-import real transactions, or skip to
explore the app with the built-in sample data.

### Linting

```bash
npm run lint
```

## Architecture notes

- **No Redux** — all global state (transactions, budgets, theme, settings, onboarding/
  permission flags) lives in `src/store/AppContext.js`, a single React Context provider
  that wraps the SQLite and SMS layers with simple async actions (`refreshTransactions`,
  `toggleDarkMode`, `requestAndSyncSms`, `updateBudget`, etc.).
- **SQLite-first** — the UI never keeps a separate source of truth; every mutation goes
  through `src/database/*` and then re-reads from SQLite via `refreshTransactions()`.
- **Theming** — `src/theme/theme.js` builds a Paper MD3 theme (light & dark) with custom
  brand tokens (`income`, `expense`, `gold`, `card`, etc.) merged onto `theme.colors`, so
  any component can do `useTheme().colors.income` for consistent green/red amount styling.
- **Charts** — built on `victory-native` (SVG-based, no native Skia dependency) so they
  work out of the box with `react-native-svg`.

## Known limitations

- CSV export and cloud backup on the Profile screen are simulated (no filesystem/network
  library is wired up) — they demonstrate the intended UX without writing real files.
- The Premium subscription flow is a demo (no real payment processor integration).
- SMS reading depends on the OS granting `READ_SMS`; some manufacturers restrict this
  further via battery/permission optimizations — sample data ensures the app is still
  useful without it.
