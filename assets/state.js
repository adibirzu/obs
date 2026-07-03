/* Shared, immutable URL-backed state with a session fallback. */
(() => {
  "use strict";

  const STORAGE_KEY = "obs-state-v1";
  const KEYS = Object.freeze([
    "source",
    "goal",
    "persona",
    "industry",
    "pattern",
    "lens",
    "level",
    "module",
    "scale-pattern",
  ]);

  function readSession() {
    try {
      const parsed = JSON.parse(window.sessionStorage?.getItem(STORAGE_KEY) || "{}");
      return parsed && typeof parsed === "object" ? parsed : {};
    } catch (_error) {
      return {};
    }
  }

  function read() {
    const params = new URL(window.location.href).searchParams;
    const session = readSession();
    return Object.freeze(Object.fromEntries(
      KEYS
        .map((key) => [key, params.get(key) || session[key]])
        .filter(([, value]) => value !== null && value !== undefined && value !== ""),
    ));
  }

  function replace(patch) {
    const url = new URL(window.location.href);
    const next = Object.freeze({ ...read(), ...patch });
    for (const key of KEYS) {
      const value = next[key];
      if (value === null || value === undefined || value === "") url.searchParams.delete(key);
      else url.searchParams.set(key, String(value));
    }
    try {
      window.sessionStorage?.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch (_error) {
      // URL state remains authoritative when storage is unavailable.
    }
    window.history.replaceState({}, "", url);
    return next;
  }

  window.OBS_STATE = Object.freeze({ keys: KEYS, read, replace, storageKey: STORAGE_KEY });
})();
