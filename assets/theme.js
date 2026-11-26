(() => {
  'use strict';
  const options = ['system', 'light', 'dark'];
  const parameter = 'theme';
  const root = document.documentElement;
  const currentURL = new URL(location.href);
  let preference = currentURL.searchParams.get(parameter);
  if (!options.includes(preference)) preference = 'system';

  function apply() {
    if (preference === 'system') delete root.dataset.theme;
    else root.dataset.theme = preference;
  }

  function carry(url) {
    if (preference === 'system') url.searchParams.delete(parameter);
    else url.searchParams.set(parameter, preference);
    return url;
  }

  function syncLinks() {
    // Only the local classroom documents carry this visual preference.
    const pages = /^(?:index|teacher|takeaway|transfer)\.html(?:[?#]|$)/;
    document.querySelectorAll('a[href]').forEach(link => {
      if (pages.test(link.getAttribute('href'))) {
        const next = carry(new URL(link.href));
        link.setAttribute('href', next.pathname.split('/').pop() + next.search + next.hash);
      }
    });
  }

  apply();
  // The app calls this after writing new scenes, so opening a document in a
  // new tab also keeps the preference. Nothing is written to browser storage.
  window.TrollTheme = { syncLinks };
  document.addEventListener('DOMContentLoaded', () => {
    const control = document.querySelector('#site-theme');
    if (!control) return;
    control.value = preference;
    control.closest('[data-theme-control]').hidden = false;
    syncLinks();
    control.addEventListener('change', () => {
      if (!options.includes(control.value)) return;
      preference = control.value;
      apply();
      try { history.replaceState(history.state, '', carry(new URL(location.href))); } catch {
        // A restrictive local-file context can deny a history edit. The
        // visual mode and links still work for the current document.
      }
      syncLinks();
    });
  });
})();
