// PWA utilities for service worker registration, installation prompts, and offline functionality

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export interface PWAInstallState {
  isInstallable: boolean;
  isInstalled: boolean;
  installPrompt: BeforeInstallPromptEvent | null;
}

// Service Worker registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    console.log('[PWA] Service workers are not supported');
    return null;
  }

  try {
    console.log('[PWA] Registering service worker...');
    const registration = await navigator.serviceWorker.register('./sw.js', {
      scope: './'
    });

    console.log('[PWA] Service worker registered successfully:', registration);

    // Handle service worker updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available, show update prompt
            showUpdatePrompt(registration);
          }
        });
      }
    });

    return registration;
  } catch (error) {
    console.error('[PWA] Service worker registration failed:', error);
    return null;
  }
}

// Update prompt for new service worker versions
function showUpdatePrompt(registration: ServiceWorkerRegistration): void {
  if (confirm('Eine neue Version der App ist verfügbar. Jetzt aktualisieren?')) {
    if (registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  }
}

// PWA install prompt management
export class PWAInstallManager {
  private installPrompt: BeforeInstallPromptEvent | null = null;
  private isInstalled = false;
  private listeners: Set<(state: PWAInstallState) => void> = new Set();

  constructor() {
    this.setupEventListeners();
    this.checkInstallStatus();
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    // Listen for install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      this.installPrompt = e as BeforeInstallPromptEvent;
      this.notifyListeners();
      console.log('[PWA] Install prompt available');
    });

    // Listen for app installed
    window.addEventListener('appinstalled', () => {
      this.isInstalled = true;
      this.installPrompt = null;
      this.notifyListeners();
      console.log('[PWA] App was installed');
    });
  }

  private checkInstallStatus(): void {
    // Check if running in standalone mode (installed)
    try {
      this.isInstalled = (typeof window !== 'undefined' && window.matchMedia) ? 
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true : false;
    } catch (error) {
      console.log('[PWA] matchMedia not available, defaulting to not installed');
      this.isInstalled = false;
    }
  }

  public async showInstallPrompt(): Promise<boolean> {
    if (!this.installPrompt) {
      console.log('[PWA] No install prompt available');
      return false;
    }

    try {
      await this.installPrompt.prompt();
      const { outcome } = await this.installPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('[PWA] User accepted the install prompt');
        this.installPrompt = null;
        this.notifyListeners();
        return true;
      } else {
        console.log('[PWA] User dismissed the install prompt');
        return false;
      }
    } catch (error) {
      console.error('[PWA] Error showing install prompt:', error);
      return false;
    }
  }

  public getState(): PWAInstallState {
    return {
      isInstallable: !!this.installPrompt,
      isInstalled: this.isInstalled,
      installPrompt: this.installPrompt
    };
  }

  public onStateChange(callback: (state: PWAInstallState) => void): () => void {
    this.listeners.add(callback);
    // Call immediately with current state
    callback(this.getState());
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    const state = this.getState();
    this.listeners.forEach(callback => callback(state));
  }
}

// Background sync utility
export function requestBackgroundSync(tag: string): void {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('sync' in window.ServiceWorkerRegistration.prototype)) {
    console.log('[PWA] Background sync not supported');
    return;
  }

  navigator.serviceWorker.ready.then((registration) => {
    return registration.sync.register(tag);
  }).catch((error) => {
    console.error('[PWA] Background sync registration failed:', error);
  });
}

// Offline status management
export class OfflineManager {
  private isOnline = typeof navigator !== 'undefined' ? navigator.onLine : true;
  private listeners: Set<(isOnline: boolean) => void> = new Set();

  constructor() {
    this.setupEventListeners();
  }

  private setupEventListeners(): void {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notifyListeners();
      console.log('[PWA] App is online');
      
      // Trigger background sync when coming online
      this.triggerSync();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notifyListeners();
      console.log('[PWA] App is offline');
    });
  }

  private triggerSync(): void {
    // Request background sync for various data types
    requestBackgroundSync('background-sync-abc-lists');
    requestBackgroundSync('background-sync-basar');
  }

  public getStatus(): boolean {
    return this.isOnline;
  }

  public onStatusChange(callback: (isOnline: boolean) => void): () => void {
    this.listeners.add(callback);
    // Call immediately with current status
    callback(this.isOnline);
    
    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notifyListeners(): void {
    this.listeners.forEach(callback => callback(this.isOnline));
  }
}

// Enhanced storage for PWA with IndexedDB fallback
export class PWAStorage {
  private dbName = 'abc-list-pwa';
  private dbVersion = 1;
  private db: IDBDatabase | null = null;

  constructor() {
    this.initDB();
  }

  private async initDB(): Promise<void> {
    if (!('indexedDB' in window)) {
      console.log('[PWA] IndexedDB not supported, falling back to localStorage');
      return;
    }

    try {
      this.db = await new Promise((resolve, reject) => {
        const request = indexedDB.open(this.dbName, this.dbVersion);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          
          // Create object stores for different data types
          if (!db.objectStoreNames.contains('abc-lists')) {
            db.createObjectStore('abc-lists', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('kawas')) {
            db.createObjectStore('kawas', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('kagas')) {
            db.createObjectStore('kagas', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('stadt-land-fluss')) {
            db.createObjectStore('stadt-land-fluss', { keyPath: 'id' });
          }
          if (!db.objectStoreNames.contains('basar')) {
            db.createObjectStore('basar', { keyPath: 'id' });
          }
        };
      });
      
      console.log('[PWA] IndexedDB initialized successfully');
    } catch (error) {
      console.error('[PWA] IndexedDB initialization failed:', error);
    }
  }

  public async setItem(storeName: string, key: string, value: any): Promise<void> {
    if (this.db) {
      try {
        const transaction = this.db.transaction([storeName], 'readwrite');
        const store = transaction.objectStore(storeName);
        await store.put({ id: key, data: value, timestamp: Date.now() });
        console.log(`[PWA] Data saved to IndexedDB: ${storeName}/${key}`);
      } catch (error) {
        console.error('[PWA] IndexedDB write failed, falling back to localStorage:', error);
        this.fallbackToLocalStorage(key, value);
      }
    } else {
      this.fallbackToLocalStorage(key, value);
    }
  }

  public async getItem(storeName: string, key: string): Promise<any> {
    if (this.db) {
      try {
        const transaction = this.db.transaction([storeName], 'readonly');
        const store = transaction.objectStore(storeName);
        const result = await store.get(key);
        return result?.data || null;
      } catch (error) {
        console.error('[PWA] IndexedDB read failed, falling back to localStorage:', error);
        return this.fallbackFromLocalStorage(key);
      }
    } else {
      return this.fallbackFromLocalStorage(key);
    }
  }

  private fallbackToLocalStorage(key: string, value: any): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error('[PWA] localStorage write failed:', error);
    }
  }

  private fallbackFromLocalStorage(key: string): any {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('[PWA] localStorage read failed:', error);
      return null;
    }
  }
}

// Initialize PWA functionality
export function initializePWA(): {
  installManager: PWAInstallManager;
  offlineManager: OfflineManager;
  storage: PWAStorage;
} {
  console.log('[PWA] Initializing PWA functionality...');
  
  // Register service worker only in browser environment
  if (typeof window !== 'undefined') {
    registerServiceWorker();
  }
  
  // Initialize managers
  const installManager = new PWAInstallManager();
  const offlineManager = new OfflineManager();
  const storage = new PWAStorage();
  
  // Listen for service worker messages only in browser environment
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      const { data } = event;
      
      if (data && data.type === 'BACKGROUND_SYNC') {
        console.log('[PWA] Background sync message received:', data.action);
        // Handle background sync actions here
        // This will be implemented in the data synchronization phase
      }
    });
  }
  
  return {
    installManager,
    offlineManager,
    storage
  };
}