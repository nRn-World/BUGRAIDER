# 🔴🔵🟡🟢 BUGRAIDER v7.1

Turn any AI agent into a structured, professional code auditor.

---

## 📋 What is BUGRAIDER?

BUGRAIDER is a plain-text prompt that transforms generic AI assistants into senior code auditors. It maps your project, scans it for security vulnerabilities, stability issues, performance problems, and maintainability gaps — then fixes what it finds, with every fix verified before it is called done.

The v7 methodology: **Map → Audit → Verify → Fix**, with an honest account of what was and was not reviewed.

---

## 🚀 Get Started

1. **Copy the prompt** → Open [BUGRAIDER_PROMPT_v7_PRO.md](./BUGRAIDER_PROMPT_v7_PRO.md) and copy everything
2. **Start a session** → Paste into any AI chat (Claude, ChatGPT, Gemini, Cursor, Windsurf, etc.)
3. **Point at a project** → Tell it which repo or folder to audit
4. **Choose a mode** → Quick triage, deep scan, focused area, diff review — or jump straight to fixing an existing report

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| 🔒 **No Secrets Leaked** | API keys, tokens, passwords are masked everywhere — including exported reports |
| 📊 **Structured Reports** | Findings grouped by severity (Critical/High/Medium/Low/Info) with a colored verdict line |
| 🔍 **Confidence Scores** | Every finding carries a confidence %; unconfirmed suspicions are labeled, never smuggled in as facts |
| 🧾 **Evidence-or-Nothing** | No finding without a real `file:line` plus the quoted line itself |
| 📏 **Coverage Honesty** | Every report states what was skipped and why — no implied full sweep |
| ✅ **Verified Fixes** | A green tick requires a command that was actually run, or an explicitly labeled manual check |
| 🔐 **Baseline-Aware** | Checks are recorded before the first edit, so regressions and pre-existing failures are never confused |
| 🌐 **Multi-Language** | English, Swedish, Turkish, German, Spanish, French |

---

## 🆕 What's new in v7.1

- **Coverage contract** — the report now has a mandatory `Not Reviewed` section; scope is sized up front (small / medium / large repo) so depth is real instead of claimed
- **Baseline before edit** — the project's checks are run and recorded *before* the first fix, with pre-existing failures marked, so a fix can never hide behind an already-red build
- **Real verification, not green ticks** — `✅` now requires a command you ran; `⚠️ manual check only` is the honest alternative
- **Quoted evidence** — every finding includes the offending line, which makes fabricated findings far harder and review much faster
- **FIX mode re-diagnoses** — findings from a foreign or older report are re-located in the current code and marked `stale` / `resolved` instead of being edited blindly
- **Reachability gate** — a security issue with no traceable path from an entry point cannot be Critical
- **Noise control** — skip lists for `node_modules`, build output and generated code, plus a cap that turns repeated patterns into one systemic finding
- **One setup message** — language and mode are asked together instead of costing two round trips

Earlier v7 groundwork: mandatory verification pass before reporting, `High` as its own severity, the FIX entry point, and the never-worsen guarantee.

---

## 🎨 Example Output

```text
──────────────────────────────────────────
🔴🔵🟡🟢 BUGRAIDER v7.1 PRO — Online
──────────────────────────────────────────

🔴🔵🟡🟢 BUGRAIDER AUDIT REPORT — Critical: 1 | High: 1 | Medium: 2 | Low: 1 | Info: 0
──────────────────────────────────────────
Project: notes-app     Mode: Deep     Scope: 34 source files (src/, config/)

Executive Summary
- Live Vercel OIDC token committed in .env.local — rotate immediately
- Debounced autosave leaks a timer on unmount; long sessions accumulate stale saves
- No test coverage on the sync layer; two findings live exactly there

🔴 CRITICAL — Must fix NOW
1. Vercel OIDC token exposed in a tracked env file
   • Why it matters: anyone with repo access can deploy to your account; the token stays valid after deletion
   • Evidence: .env.local:2 — `VERCEL_OIDC_TOKEN=eyJhbGciOi…` (masked)
   • Confidence: 95%
   • Fix direction: rotate the token, untrack the file, extend .gitignore

🟠 HIGH — Should fix soon
1. Debounced save timeout is never cleared on unmount
   • Why it matters: stale timers fire after navigation and overwrite newer state
   • Evidence: src/App.tsx:229-235 — `setTimeout(saveDraft, 800)` with no cleanup
   • Confidence: 85%
   • Fix direction: clear the timeout in the effect's cleanup function

Needs Verification
- Sync worker may retry forever on 401 → would be confirmed by a paused-network test

Not Reviewed
- lib/generated/ → generated client, not hand-edited

✅ Verified Clean
- types.ts, useToast.ts, useDarkMode.ts, RichEditor.tsx

Fix Verification: 3 applied → 3 verified ✅, 0 unverified
- ✅ token removed from committed env (config/webpack.js:40) — `npm run build` exit 0, no key string in dist/
- ⚠️ retry backoff (src/sync.ts:88) — manual check only, no test covers this path
──────────────────────────────────────────
```

---

## 📁 Project Structure

```text
BUGRAIDER/
├── BUGRAIDER_PROMPT_v7_PRO.md  🚀 Main prompt file
├── README.md                    📖 This file
├── LICENSE                      📜 License
├── Screenshots/                 📸 Example screenshots
└── tests/                       🧪 Unit tests
```

---

## 📜 License

nRn Open Attribution License 2.0 - See [LICENSE](./LICENSE) for details.

---

☕ **Support development**: [Buy me a coffee 💜](https://ko-fi.com/nrnworld)

Created by ❤️ © nRn World
