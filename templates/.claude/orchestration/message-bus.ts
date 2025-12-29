/**
 * Skill Message Bus
 * Inter-skill communication system
 */

import { Message } from './types';

export class SkillMessageBus {
  private subscribers: Map<string, Set<(message: Message) => void>>;
  private messageHistory: Message[];
  private maxHistorySize: number;

  constructor(maxHistorySize: number = 100) {
    this.subscribers = new Map();
    this.messageHistory = [];
    this.maxHistorySize = maxHistorySize;
  }

  /**
   * Publish message to specific recipients
   * @param message - Message to publish
   */
  publish(message: Message): void {
    message.type = message.type || 'broadcast';
    message.timestamp = message.timestamp || Date.now();

    // Add to history
    this.addToHistory(message);

    // Deliver to recipients
    for (const recipient of message.to) {
      const handlers = this.subscribers.get(recipient);
      if (handlers) {
        handlers.forEach(handler => {
          try {
            handler(message);
          } catch (error) {
            console.error(`Error delivering message to ${recipient}:`, error);
          }
        });
      }
    }
  }

  /**
   * Broadcast message to all subscribers
   * @param message - Message to broadcast
   */
  broadcast(message: Message): void {
    message.type = 'broadcast';
    message.timestamp = message.timestamp || Date.now();

    this.addToHistory(message);

    // Deliver to all subscribers
    this.subscribers.forEach((handlers, skillId) => {
      handlers.forEach(handler => {
        try {
          handler(message);
        } catch (error) {
          console.error(`Error broadcasting to ${skillId}:`, error);
        }
      });
    });
  }

  /**
   * Send request and wait for response
   * @param message - Request message
   * @param timeout - Timeout in ms
   * @returns Response message
   */
  async request(message: Message, timeout: number = 5000): Promise<Message> {
    message.type = 'request';
    message.timestamp = Date.now();

    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error(`Request timeout after ${timeout}ms`));
      }, timeout);

      // Subscribe to response
      const responseHandler = (response: Message) => {
        if (response.type === 'response' && response.data?.requestId === message.timestamp) {
          clearTimeout(timeoutId);
          this.unsubscribe(message.from, responseHandler);
          resolve(response);
        }
      };

      this.subscribe(message.from, responseHandler);

      // Send request
      this.publish(message);
    });
  }

  /**
   * Subscribe to messages for a skill
   * @param skillId - Skill ID
   * @param handler - Message handler
   */
  subscribe(skillId: string, handler: (message: Message) => void): void {
    if (!this.subscribers.has(skillId)) {
      this.subscribers.set(skillId, new Set());
    }

    this.subscribers.get(skillId)!.add(handler);
  }

  /**
   * Unsubscribe from messages
   * @param skillId - Skill ID
   * @param handler - Handler to remove
   */
  unsubscribe(skillId: string, handler: (message: Message) => void): void {
    const handlers = this.subscribers.get(skillId);
    if (handlers) {
      handlers.delete(handler);

      if (handlers.size === 0) {
        this.subscribers.delete(skillId);
      }
    }
  }

  /**
   * Unsubscribe all handlers for a skill
   * @param skillId - Skill ID
   */
  unsubscribeAll(skillId: string): void {
    this.subscribers.delete(skillId);
  }

  /**
   * Get message history
   * @param filter - Optional filter
   * @returns Message history
   */
  getHistory(filter?: {
    from?: string;
    to?: string;
    type?: string;
    since?: number;
  }): Message[] {
    let history = [...this.messageHistory];

    if (filter) {
      if (filter.from) {
        history = history.filter(m => m.from === filter.from);
      }

      if (filter.to) {
        history = history.filter(m => m.to.includes(filter.to!));
      }

      if (filter.type) {
        history = history.filter(m => m.type === filter.type);
      }

      if (filter.since) {
        history = history.filter(m => m.timestamp >= filter.since!);
      }
    }

    return history;
  }

  /**
   * Clear message history
   */
  clearHistory(): void {
    this.messageHistory = [];
  }

  /**
   * Get number of active subscribers
   * @returns Subscriber count
   */
  getSubscriberCount(): number {
    return this.subscribers.size;
  }

  /**
   * Add message to history
   * @param message - Message
   */
  private addToHistory(message: Message): void {
    this.messageHistory.push(message);

    // Trim history if too large
    if (this.messageHistory.length > this.maxHistorySize) {
      this.messageHistory = this.messageHistory.slice(-this.maxHistorySize);
    }
  }
}
