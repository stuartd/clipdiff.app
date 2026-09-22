/**
 * Best-effort detection for choosing site content, not a capability check.
 * Browsers can hide or override these signals; unknown is a valid result.
 * @returns {'windows' | 'mac' | 'ios' | 'linux' | 'unknown'}
 */
export function detectPlatform(browser = globalThis.navigator) {
  if (!browser) return 'unknown';

  const hint = browser.userAgentData?.platform?.toLowerCase();
  const userAgent = browser.userAgent || '';
  const platform = browser.platform || '';

  // Prefer explicit Client Hints where supported. Do not treat Android or
  // ChromeOS as desktop Linux just because their user agent mentions Linux.
  if (hint) {
    return {
      windows: 'windows',
      macos: 'mac',
      ios: 'ios',
      linux: 'linux',
    }[hint] || 'unknown';
  }

  if (/Android|CrOS|Windows Phone/i.test(userAgent)) return 'unknown';

  // iPadOS can identify as a Mac when requesting desktop websites.
  if (/iPhone|iPad|iPod/i.test(`${userAgent} ${platform}`)
      || (/Mac/i.test(platform || userAgent) && browser.maxTouchPoints > 1)) {
    return 'ios';
  }

  if (/Windows/i.test(userAgent)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(userAgent)) return 'mac';
  if (/Linux/i.test(userAgent)) return 'linux';

  if (/^Win/i.test(platform)) return 'windows';
  if (/^Mac/i.test(platform)) return 'mac';
  if (/^Linux/i.test(platform)) return 'linux';

  return 'unknown';
}
