# BUGRAIDER - AI Code Audit Prompt

BUGRAIDER is a professional system prompt for turning modern AI agents into structured code auditors. It is designed to help an agent inspect a project, identify real risks, communicate clearly, and only propose safe changes with the user's approval.

This repository currently contains multiple generations of the prompt, with `v5` as the recommended version.

## Recommended Version

Use [BUGRAIDER_PROMPT_v5_PRO.md](./BUGRAIDER_PROMPT_v5_PRO.md).

Why `v5`:

- Better signal-to-noise ratio
- Stronger false-positive control
- Clearer severity and confidence rules
- Better large-project batching
- Safer fix workflow
- More professional report format
- Better support for follow-up actions after the audit

## Prompt Versions

| Version | File | Notes |
|---|---|---|
| v1.5 | `BUGRAIDER_PROMPT_Text.txt` | Original long-form audit prompt. Very detailed, but heavy and verbose. |
| v4.0 | `BUGRAIDER_PROMPT_v4_SMART.md` | Shorter, more visual, easier to use interactively. |
| v5.0 | `BUGRAIDER_PROMPT_v5_PRO.md` | Current flagship version. Stronger audit workflow, better judgment, cleaner reporting. |

## What BUGRAIDER Does

BUGRAIDER tells an AI agent to:

- map the whole project before judging it
- detect bugs, security issues, performance problems, and maintainability risks
- separate verified findings from lower-confidence suspicions
- cite exact files and line numbers
- mask secrets instead of exposing them
- avoid changing code without permission
- present a clean next-step workflow for fixes, detail review, and exports

## Quick Start

1. Open the prompt file you want to use.
2. Paste it as the system prompt or first message in a fresh AI chat.
3. Let the agent inspect the project.
4. Choose whether to review findings, export the report, or start fixing with approval.

## Design Goals Behind v5

`v5` is intentionally stricter than older versions. It pushes the model to:

- inspect before assuming
- avoid calling cosmetic issues "critical"
- avoid flooding the user with duplicate findings
- clearly mark uncertainty
- summarize patterns instead of listing the same issue ten times
- preserve working code unless the user approves changes

That gives a more senior, more trustworthy audit style.

## Compatibility

BUGRAIDER is prompt-first, so it can be used with most modern AI coding tools, including:

- ChatGPT
- Claude
- Gemini
- Cursor
- Windsurf
- GitHub Copilot Chat
- other agents that accept system or setup prompts

## Important Safety Note

BUGRAIDER is a prompt, not a static analyzer. Results still depend on the model, available tools, and project access. Always review findings and keep a backup before applying changes.

## License

See [LICENSE](./LICENSE).

## Project Notes

During this upgrade pass, the main opportunities found in the repository were:

- the prompt product is stronger than the surrounding presentation, so docs needed cleanup
- earlier prompt versions are useful history, but they create version drift without a clear flagship
- some text assets had encoding artifacts, which made the project feel less polished
- the repo includes legacy/game-oriented app code that appears separate from the BUGRAIDER prompt product

`v5` is meant to give the project a clearer center of gravity.
