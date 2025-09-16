/**
 * 观察者工具函数
 */

import type { LazyPicConfig } from '../types';

export class EnhancedIntersectionObserver {
  private observer: IntersectionObserver;
  private observedElements = new Map<Element, () => void>();

  constructor(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ) {
    this.observer = new IntersectionObserver(callback, {
      rootMargin: '50px',
      threshold: 0.1,
      ...options
    });
  }

  observe(element: Element, cleanup?: () => void): void {
    this.observer.observe(element);
    if (cleanup) {
      this.observedElements.set(element, cleanup);
    }
  }

  unobserve(element: Element): void {
    this.observer.unobserve(element);
    const cleanup = this.observedElements.get(element);
    if (cleanup) {
      cleanup();
      this.observedElements.delete(element);
    }
  }

  disconnect(): void {
    this.observedElements.forEach((cleanup) => cleanup());
    this.observedElements.clear();
    this.observer.disconnect();
  }
}

export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  config: LazyPicConfig
): EnhancedIntersectionObserver {
  return new EnhancedIntersectionObserver(callback, {
    rootMargin: config.rootMargin || '50px',
    threshold: config.threshold || 0.1
  });
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;
  return function(this: any, ...args: Parameters<T>) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  return function(this: any, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, wait);
    }
  };
}