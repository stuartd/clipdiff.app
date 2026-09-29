import { detectPlatform, getRedirectTarget } from './platform.js';

const platform = detectPlatform();
document.documentElement.dataset.platform = platform;
const target = getRedirectTarget(window.location.href, platform, document.documentElement.dataset.contentPlatform);
if (target) window.location.replace(target);

// The example is static sample data. This page never reads the clipboard.
const unifiedDiff = `--- previous/settings.json
+++ current/settings.json
@@ -1,6 +1,6 @@
 {
   "service": "api",
-  "timeout": 3000,
-  "retries": 2,
-  "debug": true
+  "timeout": 5000,
+  "retries": 3,
+  "debug": false
 }
`;

const controls = document.querySelector('[data-demo-controls]');
if (controls) {
  controls.hidden = false;
  const buttons = [...controls.querySelectorAll('[data-view]')];
  for (const button of buttons) {
    button.addEventListener('click', () => {
      const split = button.dataset.view === 'split';
      document.querySelector('#example-split').hidden = !split;
      document.querySelector('#example-unified').hidden = split;
      for (const choice of buttons) choice.setAttribute('aria-pressed', String(choice === button));
    });
  }

  const copyButton = document.querySelector('#copy-example');
  const status = document.querySelector('#copy-status');
  copyButton.addEventListener('click', async () => {
    try {
      if (!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(unifiedDiff);
      status.textContent = 'Example unified diff copied.';
    } catch {
      buttons.find(button => button.dataset.view === 'unified').click();
      status.textContent = 'Clipboard access is unavailable. Select the unified example above to copy it manually.';
    }
  });
}
