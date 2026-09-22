# clipdiff.app

The ClipDiff website, built with plain HTML, CSS, and JavaScript. No framework,
package installation, or build step.

## Structure

```text
index.html             Shared page structure for every platform
assets/
  images/              App icons, screenshots, and other images
  styles/
    main.css           Shared styles and responsive layout
  scripts/
    main.js            Detects the platform and renders the selected content
    platform.js        Browser platform detection
content/
  windows.json         Windows content, using the shared content structure
  mac.json             Mac content, using the same structure
```

Both content files use the same fields: `name`, `title`, `description`,
`requirements`, `shortcut`, `steps`, `files`, `viewers`, `setup`, `projectUrl`,
and `projectLabel`. Edit them to change platform-specific copy; edit
`index.html` to change the shared structure. Shared privacy text stays in HTML.

## Platform detection

On page load, the site detects Windows, Mac, iOS (including iPadOS), Linux,
or unknown. The result appears on the page and in the HTML element's
`data-platform` attribute as `windows`, `mac`, `ios`, `linux`, or `unknown`.

Detection uses browser Client Hints when available, then user-agent and
platform signals. Android and ChromeOS return unknown rather than desktop
Linux. Detection is best effort: browsers can conceal or spoof their platform.
See [MDN's browser detection guidance](https://developer.mozilla.org/en-US/docs/Web/HTTP/Browser_detection_using_the_user_agent).

Windows and Mac visitors automatically see the matching content. iOS, Linux,
and unknown visitors are asked to choose a version. Everyone can switch using
the Windows/Mac controls. Selection updates the existing page without navigation
or storage; `data-content-platform` records the displayed version separately
from the detected platform. Failed content requests offer a retry and the
GitHub links remain available even without JavaScript.

## Local preview

From this folder, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open <http://localhost:8000>. Use an HTTP server rather than opening the
HTML file directly so the content files can be loaded later.
