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
    main.js            Page entry point; will load the appropriate content
    platform.js        Reserved for browser platform detection
content/
  windows.json         Windows content, using the shared content structure
  mac.json             Mac content, using the same structure
```

The content files are empty placeholders for part 3. Platform detection will
be added in part 2, with Windows, Mac, iOS, Linux, and unknown outcomes.

## Local preview

From this folder, run:

```sh
python3 -m http.server 8000 --bind 127.0.0.1
```

Then open <http://localhost:8000>. Use an HTTP server rather than opening the
HTML file directly so the content files can be loaded later.
