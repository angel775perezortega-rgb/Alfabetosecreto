(() => {
  let nativeStorage = null;
  const fallback = new Map();

  try {
    nativeStorage = window.localStorage;
  } catch {
    // Keep the app usable when browser storage is unavailable.
  }

  const storage = {
    get length() {
      try {
        return nativeStorage ? nativeStorage.length : fallback.size;
      } catch {
        return fallback.size;
      }
    },
    key(index) {
      try {
        return nativeStorage ? nativeStorage.key(index) : Array.from(fallback.keys())[index] ?? null;
      } catch {
        return Array.from(fallback.keys())[index] ?? null;
      }
    },
    getItem(key) {
      key = String(key);
      try {
        const value = nativeStorage?.getItem(key);
        return value === null || value === undefined ? fallback.get(key) ?? null : value;
      } catch {
        return fallback.get(key) ?? null;
      }
    },
    setItem(key, value) {
      key = String(key);
      value = String(value);
      try {
        if (nativeStorage) {
          nativeStorage.setItem(key, value);
          fallback.delete(key);
          return;
        }
      } catch {
        // Keep a temporary copy if persistent browser storage fails.
      }
      fallback.set(key, value);
    },
    removeItem(key) {
      key = String(key);
      try {
        nativeStorage?.removeItem(key);
      } catch {
        // Continue with the in-memory copy.
      }
      fallback.delete(key);
    },
    clear() {
      try {
        nativeStorage?.clear();
      } catch {
        // Continue with the in-memory copy.
      }
      fallback.clear();
    }
  };

  try {
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      value: storage
    });
  } catch {
    // Direct native localStorage remains available if the browser disallows wrapping it.
  }
})();
