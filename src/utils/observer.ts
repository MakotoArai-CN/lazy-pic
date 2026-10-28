/**
 * IntersectionObserver wrapper.
 *
 * Cleanup is intentionally owned by LazyPic.destroy(): running strategy cleanup
 * when an element is unobserved (at the start of loading) used to wipe the
 * loading classes and styles that the strategy had just applied.
 */

import type { LazyPicConfig } from '../types';

export class EnhancedIntersectionObserver {
  private observer: IntersectionObserver;

  constructor(
    callback: (entries: IntersectionObserverEntry[]) => void,
    options: IntersectionObserverInit = {}
  ) {
    this.observer = new IntersectionObserver(callback, {
      rootMargin: '200px',
      threshold: 0.01,
      ...options
    });
  }

  observe(element: Element): void {
    this.observer.observe(element);
  }

  unobserve(element: Element): void {
    this.observer.unobserve(element);
  }

  disconnect(): void {
    this.observer.disconnect();
  }
}

export function createIntersectionObserver(
  callback: (entries: IntersectionObserverEntry[]) => void,
  config: LazyPicConfig
): EnhancedIntersectionObserver {
  return new EnhancedIntersectionObserver(callback, {
    rootMargin: config.rootMargin || '200px',
    threshold: config.threshold ?? 0.01
  });
}
