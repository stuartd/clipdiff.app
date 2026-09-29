import { readFile, writeFile, mkdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const template = await read('templates/page.html');
const platforms = Object.fromEntries(await Promise.all(['windows', 'mac'].map(async id => [id, JSON.parse(await read(`content/${id}.json`))])));
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const arrow = '<span aria-hidden="true">↗</span>';
const keys = platform => `<span aria-label="${escape(platform.shortcutName)}">${platform.shortcut.map(key => `<kbd>${escape(key)}</kbd>`).join('<span class="px-1 text-xs" aria-hidden="true">+</span>')}</span>`;
const link = (url, label) => `<a class="text-link" href="${escape(url)}">${label}</a>`;
const section = (id, number, label, body) => `<section id="${id}" class="doc-section" aria-labelledby="${id}-title"><p class="section-label"><span class="section-number">${number}</span> ${label}</p><div class="section-copy">${body}</div></section>`;

function example(platform) {
  if (platform?.screenshot) {
    const shot = platform.screenshot;
    return `<figure class="my-10 sm:my-12"><img class="w-full rounded-lg border border-line" src="../${escape(shot.src)}" alt="${escape(shot.alt)}" width="${shot.width}" height="${shot.height}"><figcaption class="mt-3 text-xs text-muted">${escape(shot.caption)}</figcaption></figure>`;
  }

  const lines = ['{', '  "service": "api",', '  "timeout": 3000,', '  "retries": 2,', '  "debug": true', '}'];
  const current = ['{', '  "service": "api",', '  "timeout": 5000,', '  "retries": 3,', '  "debug": false', '}'];
  const pane = (values, type) => values.map((line, i) => {
    const changed = i >= 2 && i <= 4;
    const content = changed ? escape(line).replace(/(3000|5000|2|3|true|false)(,?)$/, '<mark>$1</mark>$2') : escape(line);
    return `<div class="code-line${changed ? ` ${type}` : ''}"><span class="line-number">${i + 1}</span><span class="line-sign">${changed ? (type === 'added' ? '+' : '−') : ' '}</span><span>${content}</span></div>`;
  }).join('');
  const unified = [
    [' ', '{'], [' ', '  "service": "api",'],
    ['-', '  "timeout": 3000,'], ['-', '  "retries": 2,'], ['-', '  "debug": true'],
    ['+', '  "timeout": 5000,'], ['+', '  "retries": 3,'], ['+', '  "debug": false'], [' ', '}'],
  ].map(([sign, line]) => `<div class="code-line${sign === '-' ? ' removed' : sign === '+' ? ' added' : ''}"><span class="line-sign">${sign}</span><span>${escape(line)}</span></div>`).join('');

  return `<figure class="my-10 sm:my-12" aria-labelledby="example-caption">
    <div class="diff-example">
      <div class="diff-toolbar">
        <div class="flex items-center gap-2 font-mono text-xs"><span class="text-muted" aria-hidden="true">−/+</span> settings.json <span class="hidden text-muted sm:inline">/ example comparison</span></div>
        <div class="flex items-center gap-3" data-demo-controls hidden>
          <div class="inline-flex rounded bg-[#e4e6dd] p-0.5" role="group" aria-label="Example diff view">
            <button type="button" class="diff-mode" data-view="split" aria-pressed="true" aria-controls="example-split example-unified">Side by side</button>
            <button type="button" class="diff-mode" data-view="unified" aria-pressed="false" aria-controls="example-split example-unified">Unified</button>
          </div>
          <button type="button" id="copy-example" class="text-xs text-muted underline decoration-line hover:text-ink">Copy diff</button>
        </div>
      </div>
      <div class="overflow-x-auto" tabindex="0" role="region" aria-label="Example comparison; scroll horizontally on small screens">
        <div id="example-split" class="diff-columns">
          <div class="border-r border-line"><div class="diff-heading"><span>Previous</span><span>settings.json</span></div><div class="code-pane">${pane(lines, 'removed')}</div></div>
          <div><div class="diff-heading"><span>Current</span><span>settings.json</span></div><div class="code-pane">${pane(current, 'added')}</div></div>
        </div>
        <div id="example-unified" hidden class="min-w-[300px]"><div class="diff-heading"><span>settings.json</span><span>3 removed · 3 added</span></div><div class="code-pane">${unified}</div></div>
      </div>
    </div>
    <figcaption id="example-caption" class="mt-3 flex flex-wrap justify-between gap-2 text-xs text-muted"><span>Illustrative diff. ${platform ? `${escape(platform.name)} screenshot placeholder.` : 'App screenshots to follow.'}</span><span><span class="text-[#8b3834]">− removed</span><span class="px-2" aria-hidden="true">/</span><span class="text-green">+ added</span></span></figcaption>
    <p id="copy-status" class="mt-2 text-xs text-muted empty:hidden" role="status"></p>
  </figure>`;
}

function platformSections(p) {
  return section('install', '01', 'Install', `
    <h2 id="install-title" class="text-ink">Get ClipDiff for ${p.name}.</h2>
    <p class="font-mono text-xs">${escape(p.requirements)}</p>
    <p>${escape(p.setup)}</p>
    <p>${link(`${p.projectUrl}#${p.installAnchor}`, `${p.name} installation instructions ${arrow}`)}<span class="px-3 text-line" aria-hidden="true">/</span>${link(p.projectUrl, 'Source on GitHub')}</p>`)
  + section('use', '02', 'Use', `
    <h2 id="use-title" class="text-ink">Copy. Copy. Compare.</h2>
    <ol class="space-y-5 pt-1">
      <li role="listitem" class="flex gap-4"><span class="mt-0.5 font-mono text-xs text-muted" aria-hidden="true">1.</span><span>Start <code>${p.executable}</code>. It lives in your ${p.location}.</span></li>
      <li role="listitem" class="flex gap-4"><span class="mt-0.5 font-mono text-xs text-muted" aria-hidden="true">2.</span><span>Copy the older text, then copy the newer text.<br>You can copy text files too.</span></li>
      <li role="listitem" class="flex flex-wrap items-center gap-4"><span class="font-mono text-xs text-muted" aria-hidden="true">3.</span><span>Press ${keys(p)}</span></li>
    </ol>
    <p>Or choose <strong>Show Diff</strong> in the ClipDiff menu. Previous is on the left; current is on the right. Switch between side-by-side and unified views, and use <strong>${escape(p.copyMenu)}</strong> to copy the unified diff.</p>
    <p class="border-l-2 border-line pl-4 text-sm">ClipDiff captures copies made after it starts. It retains only two captures and does not recover earlier clipboard history.</p>`)
  + section('tricks', '03', 'Tricks', `
    <h2 id="tricks-title" class="text-ink">A few useful ways to use it.</h2>
    <div class="space-y-6 pt-2">
      <div class="tip"><h3 class="text-ink">Compare two config files</h3><p>Copy one file, then the other in ${p.fileManager}, and use <strong>Show Diff</strong>. Or copy exactly two files together to make them the comparison pair. Text files contribute their contents, and the viewer shows their filenames.</p></div>
      <div class="tip"><h3 class="text-ink">Compare copied text with a file</h3><p>Copy a snippet from a browser or message, then right-click a local file and choose <strong>Compare with current ClipDiff capture</strong>.</p><p>${p.fileSetup}</p><p>${p.singleFile}</p></div>
      <div class="tip"><h3 class="text-ink">Compare two selected files</h3><p>Select exactly two files in ${p.fileManager}, then choose <strong>Compare two selected files with ClipDiff</strong>. ${p.twoFiles} ${p.name === 'Mac' ? 'Enable the Finder extension as described above.' : 'On Windows 11, this can be under <strong>Show more options</strong>.'}</p></div>
      <div class="tip"><h3 class="text-ink">Use your usual diff viewer</h3><p>Choose an installed application from <strong>Diff viewer</strong> in the ClipDiff menu, such as ${escape(p.viewers)}. You can switch back to the built-in viewer at any time.</p><p>${link(`${p.projectUrl}#external-diff-viewers`, `Supported viewers and setup ${arrow}`)}</p></div>
      <div class="tip"><h3 class="text-ink">Share the difference</h3><p>Switch to unified view and use <strong>${escape(p.copyMenu)}</strong>. Paste the diff into an issue or message instead of pasting two complete blocks.</p></div>
      <div class="tip"><h3 class="text-ink">Make it fit your workflow</h3><p>Choose <strong>${escape(p.shortcutMenu)}</strong> to change the shortcut. Turn off <strong>Monitor Clipboard</strong> to pause capture, or choose <strong>Clear Captured Text</strong> to discard the two captured values without changing your clipboard.</p></div>
    </div>
    <p class="border-t border-line pt-5 text-sm">Comparisons are text-based. Files over <code>16 MiB</code> are not read; binary or unusable files contribute a filename and reason. ${link(`${p.projectUrl}#copied-files`, 'Encoding and fallback details')}.</p>
    <aside class="mt-8 rounded-md border border-line bg-[#f0f1eb] p-5 sm:p-6" aria-labelledby="privacy-title">
      <h3 id="privacy-title" class="text-ink">What happens to the text?</h3>
      <p class="mt-3 text-sm">ClipDiff never uploads captures. The built-in viewer keeps them in memory; quitting discards them. External viewers require temporary plaintext files, with a warning before first use and best-effort cleanup.</p>
      <p class="mt-3 text-sm">${link(`${p.projectUrl}#${p.privacyAnchor}`, `${p.name} privacy details ${arrow}`)}</p>
    </aside>`);
}

function overviewSections() {
  return section('install', '01', 'Install', `
    <h2 id="install-title" class="text-ink">Two native apps. Pick yours.</h2>
    <p>ClipDiff is available for Windows and Mac. Choose a platform for installation instructions and the details that differ between them.</p>
    <div>${Object.entries(platforms).map(([id, p]) => `<a class="choice-row" href="${id}/"><span><span class="block text-lg font-semibold text-ink">ClipDiff for ${p.name}</span><span class="text-xs text-muted">${escape(p.requirements)}</span></span><span aria-hidden="true">→</span></a>`).join('')}</div>`)
  + section('use', '02', 'Use', `
    <h2 id="use-title" class="text-ink">Copy. Copy. Compare.</h2>
    <p>Start ClipDiff. Copy the older text or text file, then copy the newer one. Use <strong>Show Diff</strong> in the app menu, or press the shortcut:</p>
    <div class="flex flex-wrap gap-x-10 gap-y-5">${Object.values(platforms).map(p => `<div><p class="mb-2 text-xs">${p.name}</p>${keys(p)}</div>`).join('')}</div>
    <p>Previous is on the left; current is on the right. Use the built-in side-by-side or unified view, or choose an installed external viewer.</p>
    <p class="border-l-2 border-line pl-4 text-sm">ClipDiff captures copies made after it starts. It retains only two captures and does not recover earlier clipboard history.</p>`)
  + section('tricks', '03', 'Tricks', `
    <h2 id="tricks-title" class="text-ink">Text, files, and the bits between.</h2>
    <p>Compare two config files, check a copied snippet against a local file, or copy a unified diff into an issue. Text files contribute their contents and the viewer shows their filenames.</p>
    <p>Both apps support Explorer or Finder commands and external diff viewers. Setup differs by platform: ${link('windows/#tricks', 'Windows tips')} · ${link('mac/#tricks', 'Mac tips')}.</p>
    <p class="text-sm">Comparisons are text-based. Files over <code>16 MiB</code> are not read; binary or unusable files contribute a filename and reason.</p>
    <aside class="rounded-md border border-line bg-[#f0f1eb] p-5 sm:p-6" aria-labelledby="privacy-title"><h3 id="privacy-title" class="text-ink">What happens to the text?</h3><p class="mt-3 text-sm">ClipDiff never uploads captures. The built-in viewer keeps them in memory; quitting discards them. External viewers require temporary plaintext files, with a warning before first use and best-effort cleanup.</p><p class="mt-3 text-sm">Privacy details: ${link(`${platforms.windows.projectUrl}#${platforms.windows.privacyAnchor}`, 'Windows')} · ${link(`${platforms.mac.projectUrl}#${platforms.mac.privacyAnchor}`, 'Mac')}.</p></aside>`);
}

for (const id of ['overview', 'windows', 'mac']) {
  const p = platforms[id];
  const base = p ? '../' : './';
  const values = {
    platform: id,
    base,
    title: p ? `${p.title} — compare copied text and files` : 'ClipDiff — compare the last two things you copied',
    description: `Compare the last two pieces of text or text files you copied. ${p ? `A native ${p.name} utility in your ${p.location}.` : 'Native apps for Windows and Mac.'} Built-in and external diff viewers.`,
    icon: 'clipdiff.png',
    headerLabel: p ? p.name.toLowerCase() : 'windows + mac',
    eyebrow: p ? `A small ${p.name === 'Windows' ? 'Windows' : 'Mac'} ${p.location} utility` : 'A small utility for Windows &amp; Mac',
    platformLinks: Object.entries(platforms).map(([key, value]) => `<a class="platform-link" href="${base}${key}/"${key === id ? ' aria-current="page"' : ''}>${value.name}</a>`).join(''),
    intro: p ? `ClipDiff lives in your ${p.location}, ready when you need it. You can copy text files too.` : 'ClipDiff lives in your Windows notification area or Mac menu bar, ready when you need it.',
    heroAction: p ? `<div class="mt-7 flex flex-wrap items-center gap-x-7 gap-y-5"><a class="primary-link" href="#install">Get ClipDiff for ${p.name} <span aria-hidden="true">↓</span></a>${keys(p)}</div>` : `<div class="mt-7 flex flex-wrap items-center gap-3"><a class="primary-link" href="windows/">ClipDiff for Windows <span aria-hidden="true">→</span></a><a class="inline-flex items-center gap-5 rounded-md border border-line px-5 py-3 text-sm font-medium hover:border-ink" href="mac/">ClipDiff for Mac <span aria-hidden="true">→</span></a></div><p class="mt-4 text-xs text-muted">Two desktop apps. Choose the computer you’ll use it on.</p>`,
    example: example(p),
    sections: p ? platformSections(p) : overviewSections(),
    personalLink: ` <span class="px-2 text-line" aria-hidden="true">/</span> ${link('https://stuartd.dev', `stuartd.dev ${arrow}`)}`,
  };
  const html = '<!-- Generated by scripts/build.mjs from templates/page.html and content/*.json. -->\n' + template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Unknown template value: ${key}`);
    return values[key];
  });
  const directory = p ? `${id}/` : '';
  await mkdir(new URL(directory, root), { recursive: true });
  await writeFile(new URL(`${directory}index.html`, root), html);
  console.log(`Built ${directory}index.html`);
}
