# ClipDiff website plan

## Purpose and voice

A developer's page for a tool they made and use. Help someone understand it,
get it running, and find a few useful ways to use it. Write plainly, with the
author speaking in the first person and instructions addressed to the reader.

The attitude, in the author's words:

> I built it because I wanted it. You are welcome to it. If you use it, it makes me happy.

Use concrete explanations, real screenshots, and working examples. Keep the
author's welcome understated. Avoid sales language, feature grids, testimonials,
pricing, or repeated download prompts.

## Page order

### 1. This is what it does

Suggested opening:

> # ClipDiff
> Compare the last two pieces of text you copied.
>
> Copy some text. Copy some other text. Press a shortcut to see what changed.
> You can copy text files too. ClipDiff lives in your Windows notification area
> or Mac menu bar, ready when you need it.

Show one real screenshot of the selected platform's built-in diff, using a
small, readable configuration change. The screenshot should explain the result
without requiring someone to play a video. Include a brief caption.

Place a compact Windows / Mac selector here. Use the existing detection to
select the likely version, with manual switching always available. For other
platforms, explain which versions exist and let the reader choose. Detection
status should not dominate the page.

Add simple anchor links: Install · Use · Tricks · About.

### 2. This is how you install it

Deferred until tomorrow at the author's request. Reserve its place in the page;
installation and distribution decisions do not block the rest of the work.
Eventually this section should give the selected platform's simplest supported
installation route, requirements, and source link. Settle the exact instructions
and download links when installation is addressed.

### 3. This is how you use it

Keep the main instructions short:

1. Start ClipDiff.
2. Copy the older text, then copy the newer text.
3. Press **Ctrl + Alt + D** on Windows or **Option + Command + C** on Mac.

Explain that **Show Diff** in the app menu does the same thing. Previous is on
the left and current is on the right. Mention side-by-side and unified views,
and the command to copy the unified diff.

Include one practical detail: ClipDiff captures copies made after it starts;
it does not recover earlier clipboard history. It retains only two captures.

### 4. Here are some useful tricks

Use short examples with instructions, in this order:

- **Compare two config files.** Copy one, then the other, or copy exactly two
  files together in Explorer/Finder and use Show Diff. Text files contribute
  their contents, and the viewer shows their filenames.
- **Compare copied text with a file.** Copy a snippet, then right-click a file
  and choose **Compare with current ClipDiff capture**. This can be useful
  when checking a snippet from a browser or message against a local config.
- **Compare two selected files.** Use **Compare two selected files with
  ClipDiff** in Explorer/Finder. Include the platform's setup requirements;
  Windows 11 may put it under **Show more options**.
- **Use your usual diff viewer.** Choose one from **Diff viewer**. Give a few
  platform-specific examples and link to the full supported list.
- **Share the difference.** Switch to unified view and copy the diff into an
  issue or message instead of pasting two complete blocks.
- **Make it fit your workflow.** Change the shortcut, pause capture, or clear
  the two captured values from the menu. Show exact platform menu labels.

Keep platform differences accurate: Windows context-menu commands require
ClipDiff to be running and monitoring; Mac Finder commands require the enabled
extension and have different launch/paused behavior. Do not imply identical
behavior merely to keep the copy symmetrical.

Add a compact note below the tips: comparisons are text-based, files over
16 MiB are not read, and binary/unusable files produce a filename and reason.
Link to the READMEs for detailed encoding and fallback rules.

Include a short "What happens to the text?" paragraph here, before About:
ClipDiff never uploads captures. The built-in viewer keeps them in memory,
and quitting discards them. External viewers require temporary plaintext files,
with a warning before first use and best-effort cleanup. Link to the full
privacy explanation for each platform.

### 5. Finally, this is me

Suggested copy, subject to the author's wording:

> I'm Stuart. I built ClipDiff because I wanted it. If it's useful to you too,
> that makes me happy. You're welcome to it.

Follow with links to the author's site and GitHub, and clearly labelled links
to the Windows and Mac repositories and their issue trackers. Verify the
preferred personal link before publication. Add further biography only if the
author supplies it.

## Presentation

- One readable page with ordinary headings, generous spacing, and a modest
  reading width. Make it feel like a carefully written project README.
- Use the real app icon and a useful screenshot for each platform. Keep
  interface text legible; avoid decorative device mockups.
- Use monospace for commands and filenames, and keyboard styling for shortcuts.
- Give installation and source links clear descriptive labels.
- Preserve keyboard access, visible focus, mobile readability, and meaningful
  fallback content when JavaScript is unavailable.

## Implementation sequence

1. Restructure the existing plain HTML page into the five sections above.
2. Expand the existing Windows/Mac content files to contain practical tips,
   screenshot metadata, and verified links. Keep shared prose
   in the page and platform details in the content files.
3. Write and verify both platform variants against their repositories.
4. Capture matching screenshots with a small synthetic config example.
5. Apply typography and spacing to the existing CSS; retain the current simple
   HTML/CSS/JavaScript implementation.
6. Check both platform selections, content links,
   keyboard navigation, narrow screens, and failed/disabled JavaScript behavior.
7. Tomorrow: settle installation, verify download availability, and fill in the
   reserved section with tested instructions.

The current work should let a reader explain what ClipDiff does, understand
their first comparison, learn a useful extra, and see who made it. Installation
completes the page once that separate work is done.

## Basis for this plan

Reviewed the existing website and the local `ClipboardDiff` and
`MacClipboardDiff` READMEs, agent guides, Windows release instructions, and Mac
build script. This plan describes the checked-in projects; public release
availability has not been checked. Existing website changes are left in place.
