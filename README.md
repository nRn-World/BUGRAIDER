# BUGRAIDER — Intelligent Code Auditor

> **Short, color-coded reports that anyone can understand.**
> Paste the prompt into any AI agent — Claude, ChatGPT, Gemini, Cursor, Windsurf, opencode.

---

![Version](https://img.shields.io/badge/version-4.0-blue)
![License](https://img.shields.io/badge/license-nRn--Open-green)
![Works With](https://img.shields.io/badge/works%20with-Claude%20%7C%20GPT%20%7C%20Gemini%20%7C%20Cursor%20%7C%20Windsurf%20%7C%20opencode-purple)
![Made by](https://img.shields.io/badge/made%20by-nRn%20World-orange)

---

## What is BUGRAIDER?

BUGRAIDER is a system prompt that turns any AI agent into a code auditor. It finds bugs, security vulnerabilities, performance issues, and quality problems — and reports using colors so you understand the situation at a glance.

When you activate BUGRAIDER, you get a report that looks like this:

```
🚦  🔴🔴🟡🟢  —  2 critical, 1 warning, rest is ok

═══════════════════════════════════════════
  BUGRAIDER v4 — MyApp
═══════════════════════════════════════════

🔴 SECURITY — Must fix NOW
• API key visible in source code → config.js:12
• SQL injection possible → api.py:45

🔴 STABILITY — Crash risk
• App crashes if user not logged in → auth.js:88

🔵 PERFORMANCE — Should fix soon
• All images load at once → gallery.js:30

🟡 QUALITY — Good to fix
• 8 unused functions → utils.py

🟢 CLEAN FILES
• index.html, styles.css, README.md

───────────────────────────────────────────
  Security: 🔴   Stability: 🔴
  Quality: 🟡   Performance: 🔵
═══════════════════════════════════════════
```

---

## Versions

| Version | File | Description |
|---------|------|-------------|
| **v1.5** | `BUGRAIDER_PROMPT.md` | Original — detailed, 975 lines. 8 phases, confidence scores, clean certificate, audit history. Good for deep analysis but produces long reports. |
| **v2.0** | `BUGRAIDER_PROMPT_v2_SIMPLIFIED.md` | Simplified — ~200 lines. Groups issues, simpler report structure. |
| **v3.0** | `BUGRAIDER_PROMPT_v3_COLOR.md` | Color-coded — 🔴🔵🟡🟢. Max 20 line report. Short and visual. |
| **v4.0** | `BUGRAIDER_PROMPT_v4_SMART.md` | **Latest.** Traffic light header, smart grouping, progressive scanning, memory, export. |

### Which one should I use?

- **Start with v4.0** — best for most use cases
- **v3.0** if you want something even simpler
- **v1.5** if you want maximum detail and don't mind long reports

---

## Quick Start

### Step 1 — Choose a version

Open the file you want to use (`BUGRAIDER_PROMPT_v4_SMART.md` recommended).

### Step 2 — Paste

Copy the entire contents and paste it as:
- A **system prompt** in your AI agent, or
- The **first message** in a new conversation

### Step 3 — Go

BUGRAIDER activates and asks which scan mode you want. Then share your project or paste your files.

---

## Features (v4.0)

| Feature | Description |
|---------|-------------|
| 🚦 **Traffic light header** | One line showing the status: `🔴🔴🟡🟢` |
| 📂 **Smart grouping** | Issues grouped by type (Security, Stability, Performance, Quality) |
| ⏳ **Progressive scanning** | For large projects — show results as you go |
| 📊 **Fix progress** | Counter showing `1 of 2 done` |
| 🧠 **Memory** | Dismissed findings are remembered |
| 💾 **Export** | Save the report as a `.md` file |
| 🎯 **Understand the project** | Asks what the project does before analyzing |

## Color System

| Color | Meaning | Examples |
|-------|---------|----------|
| 🔴 RED | Must fix NOW | Leaked keys, crash bugs, SQL injection |
| 🔵 BLUE | Should fix soon | Performance issues, memory leaks |
| 🟡 YELLOW | Good to fix | Dead code, typos, debug output |
| 🟢 GREEN | No issues | File is clean |

## Supported Languages

- **C# / Unity**
- **JavaScript / TypeScript** (React, Vue, Angular, Next.js, Node.js)
- **Python** (Django, FastAPI, Flask)
- **HTML / CSS**
- **SQL**
- **Config files** (YAML, JSON, TOML, Dockerfile, CI/CD)

## Compatible AI Agents

| Agent | Status |
|-------|--------|
| Claude (Anthropic) | ✅ |
| ChatGPT / GPT-4o | ✅ |
| Gemini (Google) | ✅ |
| Cursor | ✅ |
| Windsurf | ✅ |
| GitHub Copilot Chat | ✅ |
| opencode | ✅ |

---

## Disclaimer

BUGRAIDER is a text-based prompt. It is NOT software, NOT an application, and NOT a service. It instructs an AI language model to analyze code. nRn World has no control over how any AI model interprets or acts upon this prompt.

Use at your own risk. Always back up your code before making changes.

---

## License

Licensed under the **nRn Open Attribution License**.

- ✅ Free to use personally
- ✅ Free to modify
- ✅ Free to share
- ✅ Free to use in commercial projects
- ⚠️ For commercial use — include: `© 2026 nRn World — BUGRAIDER Prompt. All rights reserved.`

See `LICENSE` for full terms.

---

## Contributing

Found a way to improve BUGRAIDER? Open a Pull Request or Issue!

Suggestions welcome for:
- New language-specific rules (Rust, Go, Swift, Kotlin, etc.)
- New security checks
- Better formatting or structure
- Translation to other languages

---

*© 2026 nRn World — All rights reserved.*
*Created by nRn World | BUGRAIDER v4.0*
