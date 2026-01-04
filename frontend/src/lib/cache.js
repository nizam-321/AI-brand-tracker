//path: frontend/src/lib/cache.js
class APICache {
  constructor() {
    this.cache = new Map();
    this.timestamps = new Map();
    this.TTL = 5 * 60 * 1000;
  }

  generateKey(endpoint, params = {}) {
    return `${endpoint}:${JSON.stringify(params)}`;
  }

  set(endpoint, params, data) {
    const key = this.generateKey(endpoint, params);
    this.cache.set(key, data);
    this.timestamps.set(key, Date.now());
  }

  get(endpoint, params = {}) {
    const key = this.generateKey(endpoint, params);
    const timestamp = this.timestamps.get(key);
    
    if (!timestamp) return null;
    if (Date.now() - timestamp > this.TTL) {
      this.cache.delete(key);
      this.timestamps.delete(key);
      return null;
    }
    
    return this.cache.get(key);
  }

  invalidate(endpoint) {
    for (const key of this.cache.keys()) {
      if (key.startsWith(endpoint)) {
        this.cache.delete(key);
        this.timestamps.delete(key);
      }
    }
  }

  clear() {
    this.cache.clear();
    this.timestamps.clear();
  }
}

export const apiCache = new APICache();
