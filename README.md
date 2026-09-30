# clipdiff.app

The ClipDiff website: plain HTML, CSS and JavaScript. No framework, browser-side
dependencies, CDN, or content fetches.
All three pages are complete HTML and work without JavaScript.

## Preview

The generated pages and handwritten stylesheet are checked in. To preview them
without installing anything:

```sh
node scripts/serve.mjs
```

Open <http://127.0.0.1:8000>. The front page redirects Windows and Mac browsers
to their platform pages. Use <http://127.0.0.1:8000/?choose=1> to view the overview
on any device. Set `PORT=8080` if port 8000 is occupied.

You can also use `python3 -m http.server 8000 --bind 127.0.0.1`.

## Edit and build

Node.js 22 or later is recommended for development.

```sh
npm run build
npm test
npm run preview
```

`npm run build` renders the HTML from the shared template and platform content,
using only Node.js built-in modules. Run it after editing copy or templates.
Edit the CSS directly and reload the browser to see style changes. No dependency
installation or CSS compilation is required.

```text
templates/page.html       Shared page shell, intro layout, About, footer
scripts/build.mjs         Shared prose, page sections, placeholder diff example
content/windows.json      Windows copy, shortcut, requirements, and source links
content/mac.json          Mac copy, shortcut, requirements, and source links
assets/styles/main.css    Handwritten shared stylesheet
assets/scripts/main.js    Routing entry point and example view/copy controls
assets/scripts/platform.js  Pure platform detection and redirect policy
assets/images/            Real app icons; future screenshots
index.html                Generated overview / platform choice
windows/index.html        Generated Windows page
mac/index.html            Generated Mac page
scripts/serve.mjs          Local preview server, bound to loopback only
tests/                    Routing, static content, and internal-link checks
```

Edit the templates/content and rebuild the generated HTML. Edit `main.css`
directly. Platform JSON is trusted local content; `fileSetup` supports inline HTML for menu labels. Other copy fields are
escaped when rendered. Shared prose stays in the template/build script.

## Routing

- `/` and `/index.html` detect desktop Windows or Mac and use `location.replace`
  to navigate to `/windows/` or `/mac/`. The query string and section anchor survive.
- iPhone, iPad (including desktop mode), Android, ChromeOS, Linux, and unknown
  browsers keep the overview and its two platform choices.
- Explicit platform pages never redirect. Every page has ordinary platform links.
- `?choose=1` suppresses detection; the logo and footer link back to this overview.
- No choice is stored in cookies or local storage. Browser detection is best effort.
- Without JavaScript, the overview and both platform pages still contain all their
  content and working links. The illustrative diff stays in side-by-side view.
- All local links are relative, so the site can also be served in a subdirectory.

## Placeholder images and installation

At the author's request, screenshots are deferred. Each page currently has an
explicitly labelled, illustrative configuration diff; it is not an app screenshot.
Its side-by-side/unified controls and copy button work with JavaScript. The copy
button writes only the fixed example diff and never reads the clipboard. A denied
clipboard write shows a manual-copy message.

To replace a platform placeholder, add the real screenshot under `assets/images/`
and set that platform's `screenshot` field to:

```json
{
  "src": "assets/images/mac-diff.png",
  "alt": "ClipDiff for Mac comparing settings.json, with timeout and retry changes",
  "width": 1200,
  "height": 640,
  "caption": "The built-in Mac viewer. Previous on the left, current on the right."
}
```

Use the actual image dimensions. Installation links point to the respective
repository instructions; direct download links remain deferred. The About
section links to the author's supplied URL, <https://stuartd.dev>.

## Hosting

Serve `index.html`, `windows/`, `mac/`, and `assets/` on any static host with
standard directory-index support. No SPA rewrites, server application, or build
service are required. Do not publish `node_modules/`, tests, or source tooling.

## Checks

`npm test` covers desktop/mobile platform signals, the iPad-as-Mac edge case,
manual selection, redirect anchors and queries, subdirectory hosting, complete
static content, unique IDs, internal asset/anchor links, and platform-specific
instructions. Run `npm run build` first so the tests inspect current output.

For visual changes, check all three pages at desktop and narrow widths, keyboard
focus and section links, and the example view/copy controls. The example's split
view scrolls horizontally on small screens rather than shrinking its text.
