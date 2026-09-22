import { detectPlatform } from './platform.js';

const platform = detectPlatform();
const labels = { windows: 'Windows', mac: 'macOS', ios: 'iOS', linux: 'Linux' };

// Part 3 can use this result to choose content within the shared page.
document.documentElement.dataset.platform = platform;
document.querySelector('#platform-status').textContent = labels[platform]
  ? `Detected platform: ${labels[platform]}.`
  : 'Couldn’t determine your platform.';
