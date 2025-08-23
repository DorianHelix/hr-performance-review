// Sync Manager - Handles real-time synchronization between components
import { forceRefreshFromDatabase } from './globalTestConfig';

// Event names
const SYNC_EVENTS = {
  TEST_TYPE_CHANGED: 'test_type_changed',
  PLATFORM_CHANGED: 'platform_changed',
  CONFIG_CHANGED: 'config_changed'
};

// Create a custom event dispatcher
class SyncManager {
  constructor() {
    this.listeners = new Map();
    this.initializeListeners();
  }

  initializeListeners() {
    // Listen for storage changes (from other tabs/windows)
    window.addEventListener('storage', (e) => {
      if (e.key === 'global_test_types' || e.key === 'global_platforms') {
        this.triggerSync(SYNC_EVENTS.CONFIG_CHANGED);
      }
    });
  }

  // Register a listener for sync events
  on(event, callback) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event).add(callback);
    
    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(event);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  }

  // Trigger a sync event
  async trigger(event, data = {}) {
    // Force refresh from database/localStorage
    await forceRefreshFromDatabase();
    
    // Notify all listeners
    const callbacks = this.listeners.get(event);
    if (callbacks) {
      callbacks.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error('Error in sync callback:', error);
        }
      });
    }
    
    // Also trigger the general config changed event
    if (event !== SYNC_EVENTS.CONFIG_CHANGED) {
      this.trigger(SYNC_EVENTS.CONFIG_CHANGED, data);
    }
  }

  // Convenience method for triggering sync
  async triggerSync(event = SYNC_EVENTS.CONFIG_CHANGED) {
    await this.trigger(event);
  }

  // Force all components to refresh
  async forceGlobalRefresh() {
    await forceRefreshFromDatabase();
    this.trigger(SYNC_EVENTS.CONFIG_CHANGED, { forced: true });
  }
}

// Create singleton instance
const syncManager = new SyncManager();

// Export the singleton and event names
export { syncManager, SYNC_EVENTS };

// Hook for React components
export function useSyncEffect(callback, deps = []) {
  const React = require('react');
  
  React.useEffect(() => {
    // Subscribe to config changes
    const unsubscribe = syncManager.on(SYNC_EVENTS.CONFIG_CHANGED, callback);
    
    // Call immediately
    callback();
    
    // Cleanup
    return unsubscribe;
  }, deps);
}

export default syncManager;