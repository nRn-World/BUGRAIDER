# 🔴🔵🟡🟢 BUGRAIDER v6.0

Turn any AI agent into a structured, professional code auditor.

---

## 📋 What is BUGRAIDER?

BUGRAIDER is a plain-text prompt that transforms generic AI assistants into senior code auditors. It scans your projects for security vulnerabilities, stability issues, performance problems, and maintainability gaps.

---

## 🚀 Get Started

1. **Copy the prompt** → Open [BUGRAIDER_PROMPT_v6_PRO.md](./BUGRAIDER_PROMPT_v6_PRO.md) and copy everything
2. **Start a session** → Paste into any AI chat (Claude, ChatGPT, Gemini, Cursor, Windsurf, etc.)
3. **Point at a project** → Tell it which repo or folder to audit
4. **Choose a mode** → Quick triage, full deep scan, focused area, or diff review

---

## 🎯 Key Features

| Feature | Description |
|---------|-------------|
| 🔒 **No Secrets Leaked** | API keys, tokens, passwords are automatically masked |
| 📊 **Structured Reports** | Findings organized by severity (Critical/High/Medium/Low) |
| 🔍 **Confidence Scores** | Every finding includes a confidence percentage |
| 🔐 **Read-Only First** | Audit happens without changing anything. Fixes only after approval |
| 🌐 **Multi-Language** | Supports English, Swedish, Turkish, German, Spanish, French |

---

## 🎨 Example Output

```text
──────────────────────────────────────────
🔴🔵🟡🟢 BUGRAIDER v6.0 PRO - Online 🔴🔵🟡🟢
──────────────────────────────────────────

🔴🔵🟡🟢 - 1 critical, 2 warnings, rest is ok
──────────────────────────────────────────

🔴 SECURITY — Must fix NOW
──────────────────────────────────────────
• Vercel OIDC token exposed in .env.local → .env.local:2
• Firebase API key visible in source code → firebase.ts:7

🔵 PERFORMANCE — Should fix soon
──────────────────────────────────────────
• Debounced save timeout isn't cleaned up → App.tsx:229-235

🟡 QUALITY — Good to fix
──────────────────────────────────────────
• Package.json has generic name "react-example" → package.json:2
• .env.local should be added to .gitignore
• Unused storage.ts file contains deprecated code → storage.ts:1-12

🟢 CLEAN FILES
──────────────────────────────────────────
types.ts, useToast.ts, useDarkMode.ts, RichEditor.tsx, NoteHeader.tsx

──────────────────────────────────────────
Security: 🔴 | Stability: 🟢 | Quality: 🟡 | Performance: 🔵
──────────────────────────────────────────
```

---

## 📁 Project Structure

```
BUGRAIDER/
├── BUGRAIDER_PROMPT_v6_PRO.md  🚀 Main prompt file
├── README.md                    📖 This file
├── LICENSE                      📜 License
└── Screenshots/                 📸 Example screenshots
```

---

## 📜 License

nRn Open Attribution License 2.0 - See [LICENSE](./LICENSE) for details.
