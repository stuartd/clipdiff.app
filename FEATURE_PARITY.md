# Windows / Mac feature review

Reviewed 1 November 2026 against upstream `main` (the local checkouts matched):

- Windows: `stuartd/ClipboardDiff` at `5f0ee6a98a01c75cb30e59df4104decc007d0bcd`
- Mac: `stuartd/MacClipboardDiff` at `0d48f402e6d42376f9ca7b282df42955ef305006`

The initial review used source and documentation. Subsequent Mac working-tree
changes are recorded below; the Windows app is unchanged. Native desktop and
release binaries have not been executed or checked for every feature below.

## Shared behavior

Both capture copied text, one file, or a pair of file objects; read text files up
to 16 MiB; support mixed text/file/path comparisons; label file-backed captures;
and retain two accepted captures in memory. Both have a custom global shortcut,
side-by-side and unified built-in views, unified-diff copying, external viewer
detection/manual selection/fallback, and optional startup at login. Both honour
platform privacy markers, implement a recent-clear heuristic, and ask before
writing temporary plaintext inputs for an external viewer. Neither has manual
pause/clear controls in the current menus.

## Copied-path parity patch

The current Mac working-tree change now accepts one or two newline-separated
absolute paths with optional double quotes and trailing line endings. Recognition
matches Windows: unquoted/mixed lists require every path to be an existing file;
fully quoted paths use copied-file fallback behavior. More than two recognized
paths are ignored. Binary inputs now use the filename/reason behavior described
in the binary parity patch below.
This patch is not yet a published Mac release.

Validation: 55 XCTest tests passed in a temporary Linux Swift 6.2.1 harness,
including the new path tests and existing file-reader, history, filename-label
and diff tests. The harness used the actual repository sources and Apple's Swift
Crypto behind a CryptoKit import shim for Finder identity code. No dependency was
added to the Mac app. Native macOS app/Finder verification remains outstanding.


## Built-in viewer parity patch

The current Mac working-tree change adds inline highlighting to side-by-side and
unified views, plus **Ignore spacing**. Spacing normalization trims edges and
collapses internal whitespace runs to one space; word separators and line breaks
still matter. Original captures and displayed/copied text are retained. Toggling
recomputes the displayed snapshot with its existing resolved labels, not newer
clipboard history. The option lasts for the app session and is built-in only.

The highlighter uses Windows' token/grapheme refinement, ordinal equality, tie
breaks, 16,384-byte pair limit, 65,536-cell search limit and shared 2,000,000-unit
work budget. Oversized/expensive rows fall back to line-level highlighting.

Validation: all 70 tests in the portable Swift harness passed, including 15 new
viewer-logic tests (Windows acceptance examples, randomized span invariants,
Unicode, tabs, spacing, export, labels and budget behavior). SwiftUI/AppKit/controller
syntax was parsed, but native macOS rendering and app compilation remain unrun.
This patch is not yet a published Mac release.

## Finder alias parity patch

The current Mac working-tree change resolves Finder aliases through native macOS
bookmark APIs before file conversion. Copied alias objects, copied paths and both
Finder commands share this reader. Captures display and retain the resolved
target's filename/path, with the existing target encoding, size and binary rules.
The Finder extension admits alias metadata without resolving it in menu callbacks;
the app resolves/classifies targets after invocation.

Resolution suppresses dialogs and volume mounting, never launches the target or
rewrites alias files, and rejects cycles, non-file targets and chains beyond eight
aliases. Unresolvable records become an alias-name `(file unreadable)` fallback;
resolved-but-unusable targets use normal file fallbacks. Binary targets now
produce target-filename/reason captures as described below.

Validation: 82 portable XCTest tests passed, including 12 injected-resolver tests
covering alias targets, binary policy, path/pair capture, fallbacks, cycles/depth
and same-target capture identity. Three additional macOS-only tests create real
Finder alias files; they are unrun on this Linux host. Native alias API execution
and Finder menu behavior still need macOS validation. This patch is not released.

## Binary-file parity patch

The current Mac working-tree change captures a binary file as its filename plus
`(binary file)`, matching Windows. Each side of a pair is converted independently;
a binary no longer causes the entire pair to be ignored. This shared conversion
covers copied files, copied paths, resolved alias targets and both Finder commands.
The Finder extension now admits all regular-file selections without filtering
binary content types; contents are classified in the app after invocation.

Known binary extensions and signatures (including renamed PDFs, GIFs, images,
archives, Java/ELF/Mach-O executables) produce reason labels. Source text, SVG,
BOM-encoded text and terminal ANSI escapes retain their text behavior. Existing
size limits, privacy markers, capture ordering and cancellation remain in force.

Validation: 90 portable XCTest tests passed, including signature, alias, path,
independent-pair, history/unified-diff and clipboard-privacy checks. The three
native alias tests and actual Finder menu behavior still require macOS. This
patch is not yet released.

## Copied-diff privacy marker patch

The current Mac working-tree change prepares copied diff text and both
`org.nspasteboard.ConcealedType` and `org.nspasteboard.TransientType` on a single
`NSPasteboardItem`, then publishes it. There is no intermediate unmarked string
write. The text stays normally pasteable, and the existing own-write suppression
and inbound privacy-marker checks are retained.

Mac's markers are advisory conventions for compatible clipboard managers. They
are not a system-wide history or Universal Clipboard exclusion guarantee; Windows
uses different platform-specific exclusion formats. The missing-output-marker gap
is addressed, without claiming identical enforcement by the operating systems.

Validation: 93 portable XCTest tests passed, including exact-text/marker output,
single-replacement, old-payload replacement and excluded-readback checks. One new
macOS-only test uses a private pasteboard to verify the actual native item and
formats; it remains unrun here along with the three native alias tests. The patch
is not yet released.

## Remaining differences

| Area | Windows | Mac |
| --- | --- | --- |
| Integration setup/lifetime | Per-user Explorer commands while the app runs; two-file command needs the adjacent native DLL. Cannot cold-start a comparison through these registered commands. Windows 11 may use **Show more options**. | Finder Sync extension must be enabled in System Settings. Finder can launch the app, including for a two-file comparison without prior captures. |
| Single-file integration | Command requires a current capture and can include its filename. No same-source-path suppression found. | Command may appear without a capture, then prompts to copy first. Hides the file already captured using an in-memory path fingerprint. |
| Capture previews | Current/previous previews in the notification-area menu. | No equivalent previews in the menu. |
| External viewers | Includes Windows-specific profiles such as WinMerge, TortoiseMerge and ExamDiff Pro. | Includes Mac-specific profiles such as MacDiff, FileMerge, Kaleidoscope and BBEdit. Offers **Get MacDiff…** when no dedicated diff viewer is detected (or when the testing override forces it). |
| External plaintext location | `%LOCALAPPDATA%\ClipDiff\Temp`. | System temporary directory. Both use best-effort cleanup. |

## Latest release links

Both platform JSON files now use their repository's `/releases/latest` URL.
GitHub redirects this stable URL to the release it designates as latest; the site
does not pin a version or need rebuilding for each release. Prereleases are not
selected by this stable-release link.

Rechecked on 1 November 2026: the Mac URL resolves to `v.09.1101` and its assets
include `ClipDiff-macOS.zip` and `ClipDiff-macOS.zip.sha256`. The earlier missing
Mac release notice has been removed. This verifies download availability, not
that the local app changes described above are included in that binary.

## Evidence

Paths below are relative to the corresponding application repository:

- Paths, file conversion and shortcuts: Windows `Clipboard/ExplorerCopyAsPathParser.cs`,
  `Clipboard/ClipboardFileObservationReader.cs`, `Clipboard/CopiedFileTextReader.cs`,
  `Clipboard/ShellShortcutTargetReader.cs` under `src/ClipDiff.Windows/`;
  Mac `clipdiff/CopiedFileTextReader.swift`, `clipdiff/ClipDiffController.swift`.
- Viewer differences: Windows `src/ClipDiff.Core/InlineDiff.cs`,
  `src/ClipDiff.Windows/Views/DiffWindow.xaml`; Mac `clipdiff/DiffEngine.swift`,
  `clipdiff/DiffWindowView.swift`.
- Context menus: Windows `src/ClipDiff.Windows/Explorer/` and `README.md`;
  Mac `ClipDiffFinderSync/FinderSyncExtension.swift`,
  `clipdiff/FinderCaptureIdentity.swift`, `clipdiff/ClipDiffController.swift`.
- Export markers: Windows `src/ClipDiff.Windows/Clipboard/ClipboardWriter.cs`;
  Mac `clipdiff/ClipboardStore.swift` and `clipdiff/ClipDiffController.swift`.
- Menus/detection: Windows `src/ClipDiff.Windows/Tray/TrayIconController.cs`,
  `src/ClipDiff.Windows/ExternalDiff/`; Mac `clipdiff/MenuContentView.swift`,
  `clipdiff/ExternalDiffSettings.swift`, `clipdiff/ExternalDiffTool.swift`.
- Distribution: public GitHub release pages and Windows expanded assets, checked
  on the review date. MacDiff's latest release resolved to `v9.0.1`.

These differences are reported for a separate product decision; the website does
not imply identical behavior or silently add features to either application.
