// Kalam Companion — content script bridge.
// Only runs on Kalam app pages. Relays messages between the page and the service worker.

function isKalamPage() {
  // The study app lives in /app/index.html inside an iframe; the shell is Kalam.
  return true; // host_permissions already restrict this to Kalam/Lovable origins
}

if (isKalamPage()) {
  // Announce presence so the app can show "extension connected".
  function announce() {
    window.postMessage({ type: 'kalam-ext:present', version: '1.0.0' }, '*');
  }
  announce();
  document.addEventListener('DOMContentLoaded', announce);

  // Page -> extension
  window.addEventListener('message', (e) => {
    if (e.source !== window || !e.data || typeof e.data !== 'object') return;
    const d = e.data;
    if (d.type === 'kalam:sync-schedule' || d.type === 'kalam:get-screentime' || d.type === 'kalam:ping') {
      try {
        chrome.runtime.sendMessage(d, (resp) => {
          if (chrome.runtime.lastError) return;
          window.postMessage({ type: 'kalam-ext:response', request: d.type, payload: resp }, '*');
        });
      } catch (_) { /* extension context invalidated */ }
    }
  });
}
