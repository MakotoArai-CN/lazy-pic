/**
 * LazyPic core orchestration.
 */

import type { LazyPicConfig, LazyPicInstance, LoadStrategy } from '../types';
import { createIntersectionObserver, EnhancedIntersectionObserver } from '../utils/observer';
import { TwoImageStrategy } from '../strategies/TwoImageStrategy';
import { DataSrcStrategy } from '../strategies/DataSrcStrategy';
import { AnimationStrategy } from '../strategies/AnimationStrategy';
import { StyleInjector } from './StyleInjector';

const DEFAULT_CONFIG: Omit<LazyPicConfig, 'selector'> = {
  animationDuration: 600,
  strategy: 'dual-image',
  enableBlur: true,
  blurIntensity: 8,
  animationType: 'fade',
  easing: 'ease-out',
  rootMargin: '200px',
  threshold: 0.01,
  completionEffect: { enabled: false, type: 'none' }
};

export class LazyPic implements LazyPicInstance {
  private config: LazyPicConfig;
  private observer?: EnhancedIntersectionObserver;
  private strategy: LoadStrategy;
  private elements: Element[] = [];
  private styleInjector: StyleInjector;
  private status: 'idle' | 'loading' | 'loaded' | 'error' = 'idle';
  private loadingElements = new WeakMap<Element, Promise<void>>();
  private generation = 0;

  constructor(config: LazyPicConfig) {
    this.config = {
      ...DEFAULT_CONFIG,
      ...config,
      completionEffect: {
        enabled: false,
        type: 'none',
        ...(config.completionEffect || {})
      }
    };

    if (config.legacyStrategy) {
      console.warn(`LazyPic: legacy strategy "${config.legacyStrategy}" is deprecated and not implemented.`);
    }
    if (config.onProgress) {
      console.warn('LazyPic: onProgress is deprecated and not emitted by the current runtime.');
    }
    if (config.quality) {
      console.warn('LazyPic: quality config is deprecated and currently has no runtime effect.');
    }

    this.normalizeLegacyConfig();
    this.styleInjector = StyleInjector.getInstance();
    this.strategy = this.createStrategy();
  }

  init(): void {
    if (typeof document === 'undefined') {
      return;
    }

    this.status = 'loading';
    this.styleInjector.injectStyles();

    if (!this.config.selector) {
      console.warn('LazyPic: a selector is required.');
      this.status = 'idle';
      return;
    }

    this.elements = Array.from(document.querySelectorAll(this.config.selector));

    if (this.elements.length === 0) {
      console.warn(`LazyPic: No elements found with selector "${this.config.selector}"`);
      this.status = 'idle';
      return;
    }

    // Graceful fallback for environments without IntersectionObserver.
    if (typeof IntersectionObserver === 'undefined') {
      this.elements.forEach(element => {
        this.prepareElement(element);
        void this.startLoad(element);
      });
      this.status = 'loaded';
      return;
    }

    this.observer = createIntersectionObserver(
      (entries) => this.handleIntersection(entries),
      this.config
    );

    this.elements.forEach(element => {
      this.prepareElement(element);
      this.observer?.observe(element);
    });

    this.status = 'loaded';
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }

    this.elements.forEach(element => {
      this.strategy.cleanup(element);
    });

    this.elements = [];
    this.loadingElements = new WeakMap<Element, Promise<void>>();
    this.generation += 1;
    this.status = 'idle';
  }

  updateConfig(newConfig: Partial<LazyPicConfig>): void {
    this.destroy();

    this.config = {
      ...this.config,
      ...newConfig,
      completionEffect: {
        enabled: false,
        type: 'none',
        ...(newConfig.completionEffect || this.config.completionEffect || {})
      }
    };
    this.normalizeLegacyConfig();
    this.strategy = this.createStrategy();
    this.init();
  }

  loadImage(element: Element): Promise<void> {
    this.styleInjector.injectStyles();
    this.prepareElement(element);
    return this.startLoad(element);
  }

  refresh(): void {
    this.destroy();
    this.init();
  }

  getStatus(): 'idle' | 'loading' | 'loaded' | 'error' {
    return this.status;
  }

  private prepareElement(element: Element): void {
    this.strategy.prepare?.(element, this.config);
  }

  private normalizeLegacyConfig(): void {
    if (!this.config.easing) {
      return;
    }

    const legacyEasingMap: Record<string, LazyPicConfig['easing']> = {
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out'
    };

    const normalized = legacyEasingMap[this.config.easing as string];
    if (normalized) {
      this.config.easing = normalized;
    }
  }

  private createStrategy(): LoadStrategy {
    switch (this.config.strategy) {
      case 'data-src':
        return new DataSrcStrategy(this.config);
      case 'animation':
        return new AnimationStrategy(this.config);
      case 'dual-image':
      default:
        return new TwoImageStrategy(this.config);
    }
  }

  /**
   * Loads every intersecting element independently. The previous implementation
   * awaited each strategy in a loop, which serialized the entire viewport behind
   * the first image's animation.
   */
  private handleIntersection(entries: IntersectionObserverEntry[]): void {
    for (const entry of entries) {
      if (!entry.isIntersecting) {
        continue;
      }

      this.observer?.unobserve(entry.target);
      void this.startLoad(entry.target);
    }
  }

  private startLoad(element: Element): Promise<void> {
    const existing = this.loadingElements.get(element);
    if (existing) {
      return existing;
    }

    const loadingElements = this.loadingElements;
    const generation = this.generation;
    const task = this.strategy
      .execute(element, this.config)
      .then(() => {
        if (generation === this.generation) {
          this.status = 'loaded';
        }
      })
      .catch((error: Error) => {
        if (generation === this.generation) {
          this.status = 'error';
          if (this.config.onError) {
            this.config.onError(error, element);
          }
        }
      })
      .finally(() => {
        loadingElements.delete(element);
      });

    loadingElements.set(element, task);
    return task;
  }
}
