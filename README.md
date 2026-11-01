# clipdiff.app

Static website for ClipDiff on Windows and Mac. Requires Node.js; no external
packages are needed.

- Edit platform facts in `content/windows.json` and `content/mac.json`.
- Edit shared copy/rendering in `scripts/build.mjs` and `templates/page.html`.
- Run `npm run build` to regenerate the three checked-in HTML pages.
- Run `npm test` to check page structure, links, platform content and detection.
- Run `npm run preview` for local development (port 8000, or set `PORT`).

`FEATURE_PARITY.md` records the source review behind the platform-specific copy.
