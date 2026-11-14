# Checkly synthetic monitoring

Your Playwright tests and JSON-driven API checks, set up to run on Checkly from a single CLI project.
Add a test file or a JSON entry, run `npx checkly deploy`, and it's monitored.

## What's monitored

| Group | Check | Type | What a pass proves |
|---|---|---|---|
| Playwright checks | `shop.browser.spec.ts` | Browser | A guest can open the shop, add a product to the cart, and reach the signup page at checkout |
| Playwright checks | `pokemon.multistep.spec.ts` | Multistep | PokeAPI returns Pikachu, its form details, and the type `electric` across three chained requests |
| User API checks | `Get user John Doe` | API | The endpoint returns 200, and the response `id` and `name` match `api/users.json` |
| User API checks | `Get user Ruby Smith` | API | Same as above |
| User API checks | `Get user Tina Johnson` | API | Same as above |

All checks run every 10 minutes from `us-east-1` and `eu-west-1`. If any check fails,
an email goes to raccoon@checklyhq.com.

## Project structure

```
.
├── checkly.config.ts              # Project settings: schedule, locations, where to find checks
├── alerts.check.ts                # Email alert channel (raccoon@checklyhq.com)
├── tests/
│   ├── playwright.check.ts        # Group for all Playwright tests in this folder
│   ├── shop.browser.spec.ts       # Browser check: shop journey from cart to signup
│   └── pokemon.multistep.spec.ts  # Multistep check: chained PokeAPI requests
└── api/
    ├── users.json                 # The URLs to monitor, with each user's expected id and name
    ├── create-user-api-checks.ts  # Reusable function: one API check per JSON entry
    └── users.check.ts             # Group for API checks; loads users.json and calls the function
```

There are two kinds of file:
- `*.check.ts`: Checkly configuration written in code: groups, checks and alert channels.
  The CLI finds these with `checkMatch` in `checkly.config.ts`.
- `*.spec.ts`: plain Playwright tests. The group in `tests/playwright.check.ts` turns each
  one into a check, based on its name: `*.browser.spec.ts` → Browser, `*.multistep.spec.ts` → Multistep.

## Setup

### Prerequisites
- [Node.js](https://nodejs.org) 22.13 or newer (required by the Checkly CLI)
- A [Checkly](https://www.checklyhq.com) account

### 1. Install dependencies

```bash
npm install
```

This installs the Checkly CLI and Playwright at the exact versions in `package-lock.json`.

### 2. Log in to Checkly

```bash
npx checkly login
```

This opens a browser so you can sign in and choose the Checkly account to deploy to.

### 3. Store the API token in Checkly

The user API endpoints require a bearer token. Store it as a **secret** environment variable in your Checkly account:

```bash
npx checkly env add API_TOKEN --secret
```

The CLI prompts for the value and hides it as you type, so the token never appears in your shell history. Paste the token itself, without the word `Bearer`. See [How the token is kept safe](#how-the-token-is-kept-safe) for how Checkly protects it.

### 4. (Optional) Add the token locally for test runs

To run the checks from your machine with `npx checkly test`, copy the example file and add the token:

```bash
cp .env.example .env
```

Then open `.env` and fill in `API_TOKEN=`. The `.env` file is listed in `.gitignore`, so it can't be committed by accident.

### 5. Deploy

```bash
npx checkly deploy
```

This creates the two groups, five checks and the email alert channel in your account, and they start running on schedule.

## Everyday use

### Run checks without deploying

```bash
npx checkly test --env-file=.env
```

This runs every check once on Checkly's infrastructure and reports the results, without changing anything in your account. `--env-file` passes your local token to the API checks.

To run only some checks, add part of a file path:

```bash
npx checkly test --env-file=.env api/
```

```bash
npx checkly test shop.browser
```

To see which checks the CLI finds, without running them:

```bash
npx checkly test --list
```

### Deploy changes

Preview first, then deploy:

```bash
npx checkly deploy --preview
```

```bash
npx checkly deploy
```

The preview lists exactly what will be created (`+`), updated (`~`) or removed, so nothing changes in your account by surprise.

### Add a Playwright test

1. Save the test in `tests/` (or any subfolder of it).
2. Name it by the kind of test:
    - `*.browser.spec.ts` for tests that use `page` (a real browser) → **Browser check**
    - `*.multistep.spec.ts` for tests that use `request` (API calls only) → **Multistep check**
3. Run `npx checkly test --list` to confirm it's picked up, then deploy.

No other file needs to change. The group in `tests/playwright.check.ts` finds new files by their name.

### Add an API check

Add an entry to `api/users.json` with all three fields:

```json
{
    "id": 99,
    "name": "Jane Example",
    "profile_url": "https://jsonmap-faiy.onrender.com/api/v1/items/user99"
}
```

On the next deploy, a new check named `Get user Jane Example` is created. It asserts a 200 status and that the response's `id` and `name` match the entry. Each `id` must be unique within the file, because it's used to build the check's permanent ID (`user-99`).

### Reuse the API check function

`createUserApiChecks` works with any list of entries in the same shape. To monitor another set of users, create a new `.check.ts` file that loads your JSON, creates a group, and calls the function with a **unique prefix**:

```ts
createUserApiChecks(otherData.users, otherGroup, 'admin')
```

The prefix keeps each check's ID unique (`admin-42` vs `user-42`), so two files can contain the same `id` without clashing. Choose the prefix once and keep it: changing it later recreates those checks and loses their history.

## How the token is kept safe

The API endpoints need a bearer token. It's stored in two places, and neither is in git:

| Where | Used by | How it's protected |
|---|---|---|
| Your Checkly account, as the secret `API_TOKEN` | Deployed checks | Encrypted at rest and in transit, never shown again in the UI, logs, CLI or API |
| A local `.env` file | `npx checkly test --env-file=.env` | Listed in `.gitignore`, so it can't be committed |

The code never contains the token itself. The API checks send this header:

```ts
{ key: 'Authorization', value: 'Bearer {{API_TOKEN}}' }
```

`{{API_TOKEN}}` is a placeholder that Checkly fills in at run time, on its own servers. In check results the header appears as `Authorization: *********`.

**Recommendation:** the token was shared in plain text in a support message, so consider rotating it. Once you have a new token, update the secret (the CLI prompts for the value and hides it):

```bash
npx checkly env update API_TOKEN --secret
```

No code change or redeploy is needed. The checks use the new value on their next run.

## Troubleshooting

### `ConfigNotFoundError: Unable to detect a Checkly configuration file`

Run the command from the project root, the folder that contains `checkly.config.ts`.

### A new check doesn't appear

Run `npx checkly test --list`. If your file isn't listed, check its name ends in `.browser.spec.ts` or `.multistep.spec.ts` and that it's inside `tests/`.

### API checks fail with status 401

The token is missing or wrong. For deployed checks, update the secret (see above). For local runs, check `API_TOKEN=` in `.env` has a value, with no `Bearer ` prefix and no quotes.

### A Browser check times out waiting for an element

The error names the locator it was waiting for, for example `waiting for getByRole('link', { name: 'Continue Shopping' })`. Check that element in the live site: the role (link vs button) and the visible text must both match. Every check run includes a video and a Playwright trace in the Checkly dashboard.

### The shop check becomes flaky around the cookie popup

The consent popup depends on the visitor's region and can appear late. If it starts blocking clicks, replace the `isVisible()` check with Playwright's [`page.addLocatorHandler`](https://playwright.dev/docs/api/class-page#page-add-locator-handler), which dismisses the popup whenever it appears.

### Confirming a check really catches failures

Temporarily change an expected value, for example a `name` in `api/users.json`, then run `npx checkly test --env-file=.env api/`. That check should fail, showing the expected and received values. Change it back afterwards.