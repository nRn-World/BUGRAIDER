# 🔴🔵🟡🟢 BUGRAIDER v7.0

Turn any AI agent into a structured, professional code auditor.

---

## 📋 What is BUGRAIDER?

BUGRAIDER is a plain-text prompt that transforms generic AI assistants into senior code auditors. It maps your project, scans it for security vulnerabilities, stability issues, performance problems, and maintainability gaps — then fixes what it finds, with every fix verified before it is called done.

The v7 methodology: **Map → Audit → Verify → Fix.**

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
| 🧾 **Evidence-or-Nothing** | No finding without a real `file:line` you can open and check |
| ✅ **Verification Loop** | Every fix is type-checked and re-audited — "applied" only counts when "verified" |
| 🔐 **Read-Only First** | The audit never changes a file. Fixes require your approval and a confirmed safety net |
| 🌐 **Multi-Language** | English, Swedish, Turkish, German, Spanish, French |

---

## 🆕 What's new in v7

- **Verification Pass (Phase 5)** — every finding is re-checked against the actual code before the report; dead evidence and duplicates are removed
- **FIX mode** — already have findings? Skip the scan and go straight to the fix workflow
- **Mandatory fix verification** — build/type checks plus re-audit of every edited region, with an explicit `applied → verified` tally
- **Tighter report contract** — `Needs Verification` and `Verified Clean` sections, so you always know what is proven vs. suspected
- **Five severities** — High is now its own level between Critical and Medium
- **Never-worsen guarantee** — a risky fix gets reverted, not half-applied

---

## 🎨 Example Output

```text
──────────────────────────────────────────
🔴🔵🟡🟢 BUGRAIDER v7.0 PRO — Online
──────────────────────────────────────────

🔴🔵🟡🟢 BUGRAIDER AUDIT REPORT — Critical: 1 | High: 1 | Medium: 2 | Low: 1 | Info: 0
──────────────────────────────────────────
Project: notes-app     Mode: Deep     Scope: full repo (34 files)

Executive Summary
- Live Vercel OIDC token committed in .env.local — rotate immediately
- Debounced autosave leaks a timer on unmount; long sessions accumulate stale saves
- No test coverage on the sync layer; two findings live exactly there

🔴 CRITICAL — Must fix NOW
1. Vercel OIDC token exposed in committed env file
   • Why it matters: anyone with repo access can deploy to your account
   • Evidence: .env.local:2
   • Confidence: 95%
   • Fix direction: rotate the token, remove the file from history, extend .gitignore

🔵 PERFORMANCE — Should fix soon
1. Debounced save timeout is never cleared on unmount
   • Why it matters: stale timers fire after navigation and overwrite newer state
   • Evidence: src/App.tsx:229-235
   • Confidence: 85%
   • Fix direction: clear the timeout in the effect's cleanup function

Needs Verification
- Sync worker may retry forever on 401 → would be confirmed by a paused-network test

✅ Verified Clean
- types.ts, useToast.ts, useDarkMode.ts, RichEditor.tsx

Fix Verification: 5 applied → 5 verified ✅, 0 unverified
──────────────────────────────────────────
```

---

## 📁 Project Structure

```
BUGRAIDER/
├── BUGRAIDER_PROMPT_v7_PRO.md  🚀 Main prompt file
├── README.md                    📖 This file
├── LICENSE                      📜 License
└── Screenshots/                 📸 Example screenshots
```

---

## 📜 License

nRn Open Attribution License 2.0 - See [LICENSE](./LICENSE) for details.

---

☕ **Support development**: [Buy me a coffee 💜](https://ko-fi.com/nrnworld)

Created by ❤️ © nRn World
