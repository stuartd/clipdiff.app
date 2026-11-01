import test from 'node:test';
import assert from 'node:assert/strict';
import { detectPlatform, getRedirectTarget } from '../assets/scripts/platform.js';

const browsers = [
  ['Windows with Client Hints', { userAgentData: { platform: 'Windows' } }, 'windows'],
  ['Mac with Client Hints', { userAgentData: { platform: 'macOS' } }, 'mac'],
  ['Windows fallback', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }, 'windows'],
  ['Firefox on Mac', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:161.0) Gecko/20100101 Firefox/161.0' }, 'mac'],
  ['Mac fallback', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)' }, 'mac'],
  ['Windows platform only', { platform: 'Win32' }, 'windows'],
  ['Mac platform only', { platform: 'MacIntel' }, 'mac'],
  ['iPhone', { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X)' }, 'ios'],
  ['iPad desktop mode', { userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', platform: 'MacIntel', maxTouchPoints: 5 }, 'ios'],
  ['iPad with Mac hint', { userAgentData: { platform: 'macOS' }, platform: 'MacIntel', maxTouchPoints: 5 }, 'ios'],
  ['iPod', { platform: 'iPod' }, 'ios'],
  ['Android', { userAgent: 'Mozilla/5.0 (Linux; Android 15)' }, 'unknown'],
  ['ChromeOS', { userAgent: 'Mozilla/5.0 (X11; CrOS x86_64)' }, 'unknown'],
  ['Windows Phone', { userAgent: 'Mozilla/5.0 (Windows Phone 10.0; Android)' }, 'unknown'],
  ['Linux', { platform: 'Linux x86_64' }, 'linux'],
  ['Linux hint', { userAgentData: { platform: 'Linux' } }, 'linux'],
  ['Unknown Client Hint is respected', { userAgentData: { platform: 'Android' }, platform: 'Linux' }, 'unknown'],
  ['No signals', {}, 'unknown'],
  ['No browser', null, 'unknown'],
];

for (const [label, browser, expected] of browsers) {
  test(label, () => assert.equal(detectPlatform(browser), expected));
}

test('routes desktops from overview and preserves deep links', () => {
  assert.equal(getRedirectTarget('https://clipdiff.app/?ref=github#use', 'windows', 'overview'), 'https://clipdiff.app/windows/?ref=github#use');
  assert.equal(getRedirectTarget('https://clipdiff.app/index.html', 'mac', 'overview'), 'https://clipdiff.app/mac/#install');
});

test('supports previews hosted in a subdirectory', () => {
  assert.equal(getRedirectTarget('https://example.com/clipdiff/', 'mac', 'overview'), 'https://example.com/clipdiff/mac/#install');
});

test('explicit platform URLs override OS detection', () => {
  assert.equal(getRedirectTarget('https://clipdiff.app/windows/', 'mac', 'windows'), null);
  assert.equal(getRedirectTarget('https://clipdiff.app/mac/', 'windows', 'mac'), null);
});

test('homepage opens install and removes the retired chooser parameter', () => {
  assert.equal(getRedirectTarget('https://clipdiff.app/', 'windows', 'overview'), 'https://clipdiff.app/windows/#install');
  assert.equal(getRedirectTarget('https://clipdiff.app/?choose=1&ref=github', 'mac', 'overview'), 'https://clipdiff.app/mac/?ref=github#install');
});

test('mobile, unsupported, and concealed platforms stay on overview', () => {
  for (const platform of ['ios', 'linux', 'unknown']) {
    assert.equal(getRedirectTarget('https://clipdiff.app/', platform, 'overview'), null);
  }
});
