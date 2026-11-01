import { detectPlatform, getRedirectTarget } from './platform.js';

const platform = detectPlatform();
document.documentElement.dataset.platform = platform;
const target = getRedirectTarget(window.location.href, platform, document.documentElement.dataset.contentPlatform);
if (target) window.location.replace(target);
