import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const origin = new URL('https://clipdiff.app/');
const pages = ['index.html', 'windows/index.html', 'mac/index.html', 'win/index.html'];

for (const page of pages) {
  test(`${page}: useful HTML without JavaScript and valid internal links`, async () => {
    const html = await readFile(new URL(page, root), 'utf8');
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.ok(!/\{\{\w+\}\}/.test(html), 'No unexpanded template values');
    for (const id of ['main', 'install', 'use', 'integration', 'viewers', 'privacy', 'about']) {
      assert.ok(html.includes(`id="${id}"`), `Static ${id} content exists`);
    }
    assert.ok(html.includes('ClipDiff never uploads captures'));
    assert.ok(html.includes('Copy. Copy. Compare.'));
    assert.ok(!/example-split|data-demo-controls|copy-example|small job|Monitor Clipboard|Clear Captured Text|Visual Studio Code/.test(html));
    const useContent = html.split('id="use"')[1].split('</section>')[0];
    for (const kind of ['Text', 'A file', 'A path']) assert.ok(useContent.includes(`<strong>${kind}</strong>`));
    assert.ok(!useContent.includes('earlier clipboard history'));
    const privacyContent = html.split('id="privacy"')[1].split('</section>')[0];
    assert.ok(privacyContent.includes('earlier clipboard history'));
    assert.ok(privacyContent.includes('plaintext files'));
    assert.ok(privacyContent.includes('attempts cleanup'));
    assert.ok(privacyContent.includes('Unmarked secrets'));
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, 'IDs are unique');
    const pageUrl = new URL(page, origin);
    const links = [...html.matchAll(/href="([^"]+)"/g)].map(([, value]) => new URL(value.replaceAll('&amp;', '&'), pageUrl).href);
    assert.ok(links.includes('https://clipdiff.app/mac/#install'));
    assert.ok(links.includes('https://clipdiff.app/windows/#install'));

    for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = new URL(value.replaceAll('&amp;', '&'), pageUrl);
      assert.ok(!url.searchParams.has('choose'), 'Links do not generate chooser URLs');
      if (url.origin !== origin.origin) continue;
      const path = url.pathname.endsWith('/') ? `${url.pathname}index.html` : url.pathname;
      const target = new URL(`.${path}`, root);
      await access(target).catch(() => assert.fail(`Missing ${fileURLToPath(target)}`));
      if (url.hash && path.endsWith('.html')) {
        const targetHtml = await readFile(target, 'utf8');
        assert.ok(targetHtml.includes(`id="${url.hash.slice(1)}"`), `Valid anchor ${value}`);
      }
    }
  });
}

test('platform-specific installation, paths and integrations remain distinct', async () => {
  const windows = await readFile(new URL('windows/index.html', root), 'utf8');
  const mac = await readFile(new URL('mac/index.html', root), 'utf8');
  assert.ok(windows.includes('Ctrl + Alt + D'));
  assert.ok(windows.includes('https://github.com/stuartd/ClipboardDiff/releases/latest'));
  assert.ok(windows.includes('ClipDiff.ShellExtension.dll'));
  assert.ok(windows.includes('One or two absolute Windows paths'));
  assert.ok(windows.includes('ClipDiff must already be running'));
  assert.ok(windows.includes('Show more options'));
  assert.ok(!windows.includes('Finder Menu Settings'));
  assert.ok(mac.includes('Option + Command + C'));
  assert.ok(mac.includes('https://github.com/stuartd/MacClipboardDiff/releases/latest'));
  assert.ok(mac.includes('Download ClipDiff-macOS.zip'));
  assert.ok(!mac.includes('No Mac release is published yet'));
  assert.ok(mac.includes('One or two absolute paths'));
  assert.ok(mac.includes('Finder Menu Settings…'));
  assert.ok(mac.includes('Finder can launch ClipDiff'));
  assert.ok(mac.includes('https://github.com/stuartd/macdiff/releases/latest'));
  assert.ok(!mac.includes('Show more options'));
});

test('win is a static Windows alias, including without JavaScript', async () => {
  const alias = await readFile(new URL('win/index.html', root), 'utf8');
  const windows = await readFile(new URL('windows/index.html', root), 'utf8');
  assert.equal(alias, windows);
  assert.ok(alias.includes('data-content-platform="windows"'));
});
