# clipdiff.app

Static website for ClipDiff on Windows and Mac. Requires Node.js; no external
packages are needed.

- Edit platform facts in `content/windows.json` and `content/mac.json`.
- Edit shared copy/rendering in `scripts/build.mjs` and `templates/page.html`.
- Run `npm run build` to regenerate the checked-in pages, including the `/win/` alias.
- Run `npm test` to check page structure, links, platform content and detection.
- Run `npm run preview` for local development (port 8000, or set `PORT`).

`FEATURE_PARITY.md` records the source review behind the platform-specific copy.

The homepage detects Mac/Windows and opens `/mac/#install` or
`/windows/#install`. Explicit platform URLs preserve the chosen platform, and
`/win/` serves the Windows page too. Platform links use ordinary paths and
anchors; no chooser query parameter is needed.
