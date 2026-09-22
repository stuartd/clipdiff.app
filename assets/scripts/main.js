import { detectPlatform } from './platform.js';

const platform = detectPlatform();
const labels = { windows: 'Windows', mac: 'macOS', ios: 'iOS', linux: 'Linux' };

document.documentElement.dataset.platform = platform;
document.querySelector('#platform-status').textContent = labels[platform]
  ? `Detected platform: ${labels[platform]}.`
  : 'Couldn’t determine your platform.';

const picker = document.querySelector('#platform-picker');
const article = document.querySelector('#platform-content');
const status = document.querySelector('#content-status');
const retry = document.querySelector('#retry-content');
const cache = new Map();
let selectedVersion;
let requestId = 0;

async function showVersion(version) {
  if (version !== 'windows' && version !== 'mac') return;
  selectedVersion = version;
  const currentRequest = ++requestId;
  const name = version === 'windows' ? 'Windows' : 'Mac';
  picker.querySelector(`input[value="${version}"]`).checked = true;
  article.hidden = true;
  retry.hidden = true;
  status.textContent = `Loading ClipDiff for ${name}…`;
  document.title = 'ClipDiff';
  delete document.documentElement.dataset.contentPlatform;

  try {
    let content = cache.get(version);
    if (!content) {
      const response = await fetch(new URL(`../../content/${version}.json`, import.meta.url));
      if (!response.ok) throw new Error(`Content request failed: ${response.status}`);
      content = await response.json();
      cache.set(version, content);
    }
    // A slower response must not replace the visitor's newer selection.
    if (currentRequest !== requestId) return;

    article.querySelectorAll('[data-content]').forEach(element => {
      element.textContent = content[element.dataset.content];
    });
    const steps = content.steps.map(text => {
      const item = document.createElement('li');
      item.textContent = text;
      return item;
    });
    document.querySelector('#workflow-steps').replaceChildren(...steps);
    const projectLink = document.querySelector('#project-link');
    projectLink.href = content.projectUrl;
    projectLink.textContent = content.projectLabel;
    document.title = content.title;
    document.documentElement.dataset.contentPlatform = version;
    article.hidden = false;
    status.textContent = `Showing ${content.name} instructions.`;
  } catch {
    if (currentRequest !== requestId) return;
    cache.delete(version);
    status.textContent = `Couldn’t load the ${name} instructions. Try again, or use the project links below.`;
    retry.hidden = false;
  }
}

picker.hidden = false;
picker.addEventListener('change', event => showVersion(event.target.value));
retry.addEventListener('click', () => showVersion(selectedVersion));

if (platform === 'windows' || platform === 'mac') {
  showVersion(platform);
} else {
  status.textContent = 'ClipDiff is available for Windows and Mac. Choose a version to see its instructions.';
}
