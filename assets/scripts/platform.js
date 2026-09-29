/** Best-effort routing only. The platform links always remain available. */
export function detectPlatform(browser = globalThis.navigator) {
  if (!browser) return 'unknown';

  const hint = browser.userAgentData?.platform?.toLowerCase();
  const userAgent = browser.userAgent || '';
  const platform = browser.platform || '';

  // Mobile checks precede desktop hints: iPads can report a Mac platform.
  if (/Android|CrOS|Windows Phone/i.test(userAgent)) return 'unknown';
  if (/iPhone|iPad|iPod/i.test(`${userAgent} ${platform}`)
      || (/Mac/i.test(`${platform} ${userAgent}`) && browser.maxTouchPoints > 1)) {
    return 'ios';
  }

  if (hint) {
    return { windows: 'windows', macos: 'mac', ios: 'ios', linux: 'linux' }[hint] || 'unknown';
  }
  if (/Windows/i.test(userAgent) || /^Win/i.test(platform)) return 'windows';
  if (/Macintosh|Mac OS X/i.test(userAgent) || /^Mac/i.test(platform)) return 'mac';
  if (/Linux/i.test(userAgent) || /^Linux/i.test(platform)) return 'linux';
  return 'unknown';
}

/** Only the overview redirects. Explicit platform URLs always win. */
export function getRedirectTarget(href, platform, page) {
  const url = new URL(href);
  if (page !== 'overview' || url.searchParams.has('choose')) return null;
  if (platform !== 'windows' && platform !== 'mac') return null;

  const target = new URL(`./${platform}/`, url);
  target.search = url.search;
  target.hash = url.hash;
  return target.href;
}
