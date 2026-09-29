import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const root = new URL('../', import.meta.url);
const origin = new URL('https://clipdiff.app/');
const pages = ['index.html', 'windows/index.html', 'mac/index.html'];

for (const page of pages) {
  test(`${page}: useful HTML without JavaScript and valid internal links`, async () => {
    const html = await readFile(new URL(page, root), 'utf8');
    assert.equal((html.match(/<h1\b/g) || []).length, 1);
    assert.ok(!/\{\{\w+\}\}/.test(html), 'No unexpanded template values');
    for (const id of ['main', 'install', 'use', 'tricks', 'about']) {
      assert.ok(html.includes(`id="${id}"`), `Static ${id} content exists`);
    }
    assert.ok(html.includes('ClipDiff never uploads captures'));
    assert.ok(html.includes('https://stuartd.dev'));
    const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
    assert.equal(ids.length, new Set(ids).size, 'IDs are unique');
    const pageUrl = new URL(page, origin);
    for (const [, value] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      const url = new URL(value.replaceAll('&amp;', '&'), pageUrl);
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

test('platform-specific instructions do not cross over', async () => {
  const windows = await readFile(new URL('windows/index.html', root), 'utf8');
  const mac = await readFile(new URL('mac/index.html', root), 'utf8');
  assert.ok(windows.includes('Ctrl + Alt + D'));
  assert.ok(windows.includes('ClipDiff must already be running and monitoring'));
  assert.ok(!windows.includes('Enable Finder menu'));
  assert.ok(mac.includes('Option + Command + C'));
  assert.ok(mac.includes('This works while monitoring is paused'));
  assert.ok(mac.includes('Finder can launch ClipDiff'));
  assert.ok(!mac.includes('Show more options'));
});
