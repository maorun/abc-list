
let store: Record<string, string> = {};

const localStorageMock = {
  getItem(key: string) {
    return store[key] || null;
  },
  setItem(key: string, value: string) {
    store[key] = value.toString();
  },
  removeItem(key: string) {
    delete store[key];
  },
  clear() {
    store = {};
  },
};

Object.defineProperty(window, "localStorage", {
  value: localStorageMock,
  writable: true,
});
