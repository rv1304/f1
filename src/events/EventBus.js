/**
 * VelocityForge Event Bus
 * 
 * High-performance pub-sub system for real-time event coordination
 * between agents and simulation systems.
 */

export class EventBus {
  constructor() {
    this.listeners = new Map();
    this.eventQueue = [];
    this.maxQueueSize = 10000;
    this.stats = {
      eventsEmitted: 0,
      eventsProcessed: 0,
      listenersRegistered: 0,
      averageProcessingTime: 0
    };
  }

  /**
   * Subscribe to an event type
   */
  on(eventType, callback, priority = 0) {
    if (!this.listeners.has(eventType)) {
      this.listeners.set(eventType, []);
    }
    
    const listener = {
      callback,
      priority,
      id: this.generateListenerId()
    };
    
    this.listeners.get(eventType).push(listener);
    
    // Sort by priority (higher priority first)
    this.listeners.get(eventType).sort((a, b) => b.priority - a.priority);
    
    this.stats.listenersRegistered++;
    
    return listener.id;
  }

  /**
   * Subscribe to an event type (one-time)
   */
  once(eventType, callback, priority = 0) {
    const listenerId = this.on(eventType, (data) => {
      callback(data);
      this.off(eventType, listenerId);
    }, priority);
    
    return listenerId;
  }

  /**
   * Unsubscribe from an event type
   */
  off(eventType, listenerId) {
    if (!this.listeners.has(eventType)) return false;
    
    const listeners = this.listeners.get(eventType);
    const index = listeners.findIndex(listener => listener.id === listenerId);
    
    if (index !== -1) {
      listeners.splice(index, 1);
      return true;
    }
    
    return false;
  }

  /**
   * Emit an event
   */
  emit(eventType, data = null) {
    const event = {
      type: eventType,
      data,
      timestamp: performance.now(),
      id: this.generateEventId()
    };
    
    // Add to queue for batch processing
    this.eventQueue.push(event);
    
    // Prevent queue overflow
    if (this.eventQueue.length > this.maxQueueSize) {
      this.eventQueue.shift(); // Remove oldest event
    }
    
    this.stats.eventsEmitted++;
  }

  /**
   * Process all queued events
   */
  processEvents() {
    const startTime = performance.now();
    const processedEvents = [];
    
    while (this.eventQueue.length > 0) {
      const event = this.eventQueue.shift();
      this.processEvent(event);
      processedEvents.push(event);
    }
    
    const processingTime = performance.now() - startTime;
    this.stats.eventsProcessed += processedEvents.length;
    this.stats.averageProcessingTime = (this.stats.averageProcessingTime * 0.9) + (processingTime * 0.1);
    
    return processedEvents;
  }

  /**
   * Process a single event
   */
  processEvent(event) {
    const listeners = this.listeners.get(event.type);
    if (!listeners || listeners.length === 0) return;
    
    // Call all listeners for this event type
    for (const listener of listeners) {
      try {
        listener.callback(event.data);
      } catch (error) {
        console.error(`Error in event listener for ${event.type}:`, error);
      }
    }
  }

  /**
   * Emit event immediately (bypasses queue)
   */
  emitImmediate(eventType, data = null) {
    const event = {
      type: eventType,
      data,
      timestamp: performance.now(),
      id: this.generateEventId()
    };
    
    this.processEvent(event);
    this.stats.eventsEmitted++;
    this.stats.eventsProcessed++;
  }

  /**
   * Clear all events of a specific type
   */
  clearEvents(eventType) {
    this.eventQueue = this.eventQueue.filter(event => event.type !== eventType);
  }

  /**
   * Clear all queued events
   */
  clearAllEvents() {
    this.eventQueue = [];
  }

  /**
   * Get event statistics
   */
  getStats() {
    return {
      ...this.stats,
      queuedEvents: this.eventQueue.length,
      activeListeners: Array.from(this.listeners.values()).reduce((sum, listeners) => sum + listeners.length, 0)
    };
  }

  /**
   * Get listeners for a specific event type
   */
  getListeners(eventType) {
    return this.listeners.get(eventType) || [];
  }

  /**
   * Check if there are listeners for an event type
   */
  hasListeners(eventType) {
    const listeners = this.listeners.get(eventType);
    return listeners && listeners.length > 0;
  }

  /**
   * Generate unique listener ID
   */
  generateListenerId() {
    return `listener_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Generate unique event ID
   */
  generateEventId() {
    return `event_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Create a namespaced event bus
   */
  createNamespace(namespace) {
    return new NamespacedEventBus(this, namespace);
  }

  /**
   * Cleanup resources
   */
  destroy() {
    this.listeners.clear();
    this.eventQueue = [];
    this.stats = {
      eventsEmitted: 0,
      eventsProcessed: 0,
      listenersRegistered: 0,
      averageProcessingTime: 0
    };
  }
}

/**
 * Namespaced Event Bus
 * 
 * Provides a scoped event bus that automatically prefixes event types
 * with a namespace for better organization.
 */
class NamespacedEventBus {
  constructor(parentBus, namespace) {
    this.parentBus = parentBus;
    this.namespace = namespace;
  }

  on(eventType, callback, priority = 0) {
    return this.parentBus.on(`${this.namespace}:${eventType}`, callback, priority);
  }

  once(eventType, callback, priority = 0) {
    return this.parentBus.once(`${this.namespace}:${eventType}`, callback, priority);
  }

  off(eventType, listenerId) {
    return this.parentBus.off(`${this.namespace}:${eventType}`, listenerId);
  }

  emit(eventType, data = null) {
    this.parentBus.emit(`${this.namespace}:${eventType}`, data);
  }

  emitImmediate(eventType, data = null) {
    this.parentBus.emitImmediate(`${this.namespace}:${eventType}`, data);
  }

  hasListeners(eventType) {
    return this.parentBus.hasListeners(`${this.namespace}:${eventType}`);
  }

  getListeners(eventType) {
    return this.parentBus.getListeners(`${this.namespace}:${eventType}`);
  }
}
