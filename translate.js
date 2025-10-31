/*
  Site-wide translation controller
  - Initializes Google Translate in a hidden container
  - Mirrors the Google language list into our visible selector
  - Applies the chosen language and persists it in localStorage
*/

(function () {
  const STORAGE_KEY = 'preferredLanguage'; // legacy; we now reset on each load
  const VISIBLE_SELECT_ID = 'language-selector';
  const HIDDEN_CONTAINER_ID = 'google_translate_element';

  function getVisibleSelect() {
    return document.getElementById(VISIBLE_SELECT_ID);
  }

  function getGoogleCombo() {
    return document.querySelector('select.goog-te-combo');
  }

  function triggerChange(el) {
    const evt = document.createEvent('HTMLEvents');
    evt.initEvent('change', true, true);
    el.dispatchEvent(evt);
  }

  function populateVisibleSelector() {
    const visible = getVisibleSelect();
    const googleCombo = getGoogleCombo();
    if (!visible || !googleCombo) return false;

    // Wait until Google has populated languages (usually > 1 option)
    if (!googleCombo.options || googleCombo.options.length <= 1) {
      return false;
    }

    // Clear and copy options from Google combo to our visible select
    visible.innerHTML = '';

    // Add a label option
    const placeholder = document.createElement('option');
    placeholder.value = '';
    placeholder.textContent = 'Select language…';
    visible.appendChild(placeholder);

    Array.from(googleCombo.options).forEach((opt) => {
      const o = document.createElement('option');
      o.value = opt.value;
      o.textContent = opt.textContent;
      visible.appendChild(o);
    });

    // Always start in default language (English) on each load
    // Do not auto-apply any saved preference. Show placeholder initially.
    visible.value = '';
    return true;
  }

  function applyLanguage(langCode) {
    const googleCombo = getGoogleCombo();
    if (!googleCombo) return;
    if (!langCode) return;

    googleCombo.value = langCode;
    triggerChange(googleCombo);
    // We intentionally do NOT persist language anymore to ensure refresh resets to English
  }

  function setupVisibleSelectorHandler() {
    const visible = getVisibleSelect();
    if (!visible || visible.__wired) return;
    visible.addEventListener('change', function () {
      const val = this.value;
      if (val) {
        applyLanguage(val);
      }
    });
    visible.__wired = true;
  }

  // Expose the init function for Google callback
  window.googleTranslateElementInit = function () {
    if (!document.getElementById(HIDDEN_CONTAINER_ID)) {
      const hidden = document.createElement('div');
      hidden.id = HIDDEN_CONTAINER_ID;
      hidden.style.position = 'absolute';
      hidden.style.left = '-9999px';
      hidden.style.height = '0';
      hidden.style.overflow = 'hidden';
      document.body.appendChild(hidden);
    }

    try {
      // eslint-disable-next-line no-undef
      new google.translate.TranslateElement({
        pageLanguage: 'en',
        autoDisplay: false
        // NOTE: Do NOT pass includedLanguages when using default full list.
      }, HIDDEN_CONTAINER_ID);
    } catch (e) {
      // If google object not ready, silently fail
      return;
    }

    // Wait for the hidden select to appear, then populate our visible one
    let attempts = 0;
    const maxAttempts = 80; // ~8s
    const iv = setInterval(function () {
      attempts++;
      if (populateVisibleSelector()) {
        clearInterval(iv);
      } else if (attempts >= maxAttempts) {
        clearInterval(iv);
      }
    }, 100);

    // After init, clear any persisted translate state and force English
    // Google uses a 'googtrans' cookie to persist translation across pages
    clearTranslatePersistence();
    // Attempt to explicitly select English once the combo exists
    const ensureEnglish = setInterval(function () {
      const combo = getGoogleCombo();
      if (combo) {
        // Reset cookie again just in case
        clearTranslatePersistence();
        combo.value = 'en';
        triggerChange(combo);
        const visible = getVisibleSelect();
        if (visible) visible.value = '';
        clearInterval(ensureEnglish);
      }
    }, 150);
  };

  // DOM ready: wire the visible selector in case it’s already in the DOM
  document.addEventListener('DOMContentLoaded', function () {
    setupVisibleSelectorHandler();
    // On each load, remove any saved preference and clear Google cookies
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    clearTranslatePersistence();
  });

  function clearTranslatePersistence() {
    // Remove our legacy storage
    try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
    // Clear Google Translate cookie that auto-applies previous selection
    const past = 'Thu, 01 Jan 1970 00:00:00 GMT';
    const host = window.location.hostname;
    // Common variants
    document.cookie = 'googtrans=; expires=' + past + '; path=/';
    document.cookie = 'googtrans=; expires=' + past + '; domain=' + host + '; path=/';
    document.cookie = 'googtrans=; expires=' + past + '; domain=.' + host + '; path=/';
    // Also overwrite to English just in case some browsers ignore delete
    document.cookie = 'googtrans=/en/en; path=/';
    document.cookie = 'googtrans=/en/en; domain=' + host + '; path=/';
    document.cookie = 'googtrans=/en/en; domain=.' + host + '; path=/';
  }
})();
