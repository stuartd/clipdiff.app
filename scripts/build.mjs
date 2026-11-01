import { readFile, writeFile, mkdir } from 'node:fs/promises';

const root = new URL('../', import.meta.url);
const read = path => readFile(new URL(path, root), 'utf8');
const template = await read('templates/page.html');
const platforms = Object.fromEntries(await Promise.all(['windows', 'mac'].map(async id => [id, JSON.parse(await read(`content/${id}.json`))])));
const escape = text => String(text).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]);
const keys = platform => `<span aria-label="${escape(platform.shortcutName)}">${platform.shortcut.map(key => `<kbd>${escape(key)}</kbd>`).join('<span class="key-separator" aria-hidden="true">+</span>')}</span>`;
const link = (url, label) => `<a class="text-link" href="${escape(url)}">${escape(label)}</a>`;
const paragraph = text => `<p>${escape(text)}</p>`;
const section = (id, number, label, body) => `<section id="${id}" class="doc-section" aria-labelledby="${id}-title"><p class="section-label"><span class="section-number">${number}</span> ${label}</p><div class="section-copy">${body}</div></section>`;
const heading = (id, text) => `<h2 id="${id}-title" class="heading">${escape(text)}</h2>`;

function use(p) {
  return section('use', '02', 'Use', heading('use', 'Copy. Copy. Compare.') + `
    <p>Start ClipDiff. Copy the older value, then the newer. Use:</p>
    <ul class="copy-types">
      <li><strong>Text</strong> — copied from any app.</li>
      <li><strong>A file</strong> — copy the file itself in ${p ? p.fileManager : 'Finder or Explorer'}.</li>
      <li><strong>A path</strong> — copy the full path to a text file; ClipDiff reads its saved contents.</li>
    </ul>
    <p>Mix these freely, or copy two files together.</p>
    ${p ? paragraph(p.pathCopy) : `<p>Path formats differ: ${link('windows/#use', 'Windows paths')} · ${link('mac/#use', 'Mac pathnames')}.</p>`}
    <p>Press ${p ? keys(p) : 'the shortcut below'}, or choose <strong>Show Diff</strong> in the app menu.</p>
    ${p ? '' : `<div class="platform-shortcuts">${Object.values(platforms).map(value => `<div><p class="shortcut-label">${value.name}</p>${keys(value)}</div>`).join('')}</div>`}
    ${p ? `<p class="file-note">${escape(p.fileNote)}</p>` : ''}`);
}

function integration(p) {
  return section('integration', '03', p ? p.fileManager : 'Finder / Explorer', heading('integration', p ? `Compare from ${p.fileManager}.` : 'Compare from Finder or Explorer.') + (p ? `
    ${paragraph(p.integration.setup)}
    <h3>Compare with current ClipDiff capture</h3>${paragraph(p.integration.single)}
    <h3>Compare two selected files with ClipDiff</h3>${paragraph(p.integration.pair)}
    <p>Both open the diff without changing your clipboard. For a pair, ${p.fileManager}’s first file is Previous.</p>` : `
    <p>Right-click a file to compare it with your current capture, or select two files to compare directly. Your clipboard stays unchanged.</p>
    <p>Explorer needs ClipDiff running; Finder needs its extension enabled and can launch the app.</p>
    <p>${link('windows/#integration', 'Set up Explorer')} · ${link('mac/#integration', 'Set up Finder')}</p>`));
}

function viewers(p) {
  return section('viewers', '04', 'Diff viewers', heading('viewers', 'Use your diff viewer.') + (p ? `
    ${paragraph(p.viewers.discovery)}${paragraph(p.viewers.custom)}
    <p>${link(`${p.projectUrl}#external-diff-viewers`, 'Supported viewers and setup details')}.</p>` : `
    <p>ClipDiff should detect supported installed tools. Select one under <strong>Diff viewer</strong>, or choose an application manually.</p>
    <p>${link('windows/#viewers', 'Windows viewer setup')} · ${link('mac/#viewers', 'Mac viewer setup')}</p>`) + `
    <p>No diff tool? Use the default <strong>Built-in viewer</strong>: side-by-side or unified, with inline highlights, an <strong>Ignore spacing</strong> option and a command to copy the diff. It also handles external-viewer launch failures.</p>
    ${p?.viewers.companionUrl ? `<p>Try ${link(p.viewers.companionUrl, 'MacDiff')} for a dedicated Mac viewer. The menu offers <strong>Get MacDiff…</strong> if none is detected.</p>` : ''}`);
}

function privacy(p) {
  return section('privacy', '05', 'Privacy', heading('privacy', 'Your copies stay on your computer.') + `
    <p>ClipDiff never uploads captures. It keeps two accepted copies and their file paths in memory, captured after startup; it cannot recover earlier clipboard history. Quitting discards them. Closing the diff window does not.</p>
    <p>${p ? escape(p.privacy.markers) : 'Both apps honour their platform’s clipboard privacy markers.'} Unmarked secrets look like ordinary text. A clipboard clear within 60 seconds can remove the latest capture; this safeguard is best effort.</p>
    <h3>External viewers write temporary files</h3>
    <p>The built-in viewer keeps comparisons in memory. An external viewer needs two read-only plaintext files${p ? ` under <code>${escape(p.privacy.workspace)}</code>` : ''}. ClipDiff asks for consent before the first external comparison. Cancelling uses the built-in viewer without creating files.</p>
    <p>ClipDiff attempts cleanup after the viewer exits, on quit and on next launch. Crashes or the viewer can leave copies behind. Use the built-in viewer to avoid this disk exposure.</p>
    <p>Settings contain preferences, not captures. Secure memory erasure, system paging, clipboard history and other apps’ copies are outside ClipDiff’s control.</p>
    <p>${p ? link(`${p.projectUrl}#${p.privacy.anchor}`, 'Full privacy details') : Object.values(platforms).map(value => link(`${value.projectUrl}#${value.privacy.anchor}`, `${value.name} privacy details`)).join(' · ')}</p>`);
}

function install(p) {
  return section('install', '01', 'Install', heading('install', p ? `Get ClipDiff for ${p.name}.` : 'Choose your platform.') + (p ? `
    <p class="requirements">${escape(p.requirements)}</p>
    <p>${link(p.releaseUrl, 'Latest release on GitHub')}</p>
    ${p.install.map(paragraph).join('')}
    <p>${link(p.projectUrl, 'Source')} · ${link(`${p.projectUrl}/issues`, 'Report an issue')}</p>` : `
    <div>${Object.entries(platforms).map(([id, value]) => `<a class="choice-row" href="${id}/"><span><span class="choice-title">ClipDiff for ${value.name}</span><span class="choice-requirements">${escape(value.requirements)}</span></span><span aria-hidden="true">→</span></a>`).join('')}</div>`));
}

for (const id of ['overview', 'windows', 'mac']) {
  const p = platforms[id];
  const base = p ? '../' : './';
  const values = {
    platform: id,
    base,
    title: p ? `${p.title} — compare copied text and files` : 'ClipDiff — compare copied text and files',
    description: 'Copy text, a file or a path. Copy another. Compare them with your diff viewer or the built-in viewer.',
    icon: 'clipdiff.png',
    integrationLabel: p ? p.fileManager : 'Finder / Explorer',
    headerLabel: p ? p.name.toLowerCase() : 'windows + mac',
    eyebrow: p ? `In your ${p.location}` : 'For Windows and Mac',
    platformLinks: Object.entries(platforms).map(([key, value]) => `<a class="platform-link" href="${base}${key}/"${key === id ? ' aria-current="page"' : ''}>${value.name}</a>`).join(''),
    heroAction: p ? `<div class="hero-actions"><a class="primary-link" href="#install">Get ClipDiff for ${p.name} <span aria-hidden="true">↓</span></a></div>` : `<div class="hero-actions"><a class="primary-link" href="windows/">ClipDiff for Windows <span aria-hidden="true">→</span></a><a class="secondary-link" href="mac/">ClipDiff for Mac <span aria-hidden="true">→</span></a></div>`,
    sections: install(p) + use(p) + integration(p) + viewers(p) + privacy(p),
  };
  const html = '<!-- Generated by scripts/build.mjs from templates/page.html and content/*.json. -->\n' + template.replace(/\{\{(\w+)\}\}/g, (_, key) => {
    if (!(key in values)) throw new Error(`Unknown template value: ${key}`);
    return values[key];
  });
  const directory = p ? `${id}/` : '';
  await mkdir(new URL(directory, root), { recursive: true });
  await writeFile(new URL(`${directory}index.html`, root), html.replace(/[ \t]+$/gm, ''));
  console.log(`Built ${directory}index.html`);
}
