# Website content guide

Keep platform-specific facts in `content/windows.json` and `content/mac.json`.
Shared copy and rendering live in `scripts/build.mjs`, with the page shell in
`templates/page.html`. Generated HTML is checked in.

Use short, direct copy. Page order:

1. **Install:** GitHub releases, requirements, extraction and update instructions.
   State when a platform has no published release; do not imply a download exists.
2. **Use:** “Copy. Copy. Compare.” Text, a file object, or a path; mix the methods.
   Explain platform path limits without inventing feature equivalence.
3. **Finder / Explorer:** setup and the one-file/two-file commands, including
   whether ClipDiff must already be running.
4. **Diff viewers:** detect installed tools, select one, manually locate a missing
   tool, or use the built-in viewer. Mention MacDiff on Mac. Do not promote VS Code.
5. **Privacy:** in-memory lifetime, privacy markers and their limits, explicit
   external-viewer disk exposure and best-effort cleanup.
6. **About:** placeholder until the author supplies copy.

No example comparison, use-case collection, pause/clear instructions or “small
job” tagline. Keep platform selection, keyboard navigation, mobile layouts and
useful content without JavaScript.

See `FEATURE_PARITY.md` for the implementation review and known differences.
