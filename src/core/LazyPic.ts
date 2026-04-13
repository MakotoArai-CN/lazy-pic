/**
 * LazyPic 核心类
 */

import type { LazyPicConfig, LazyPicInstance, LoadStrategy } from '../types';
import { EnhancedIntersectionObserver, createIntersectionObserver } from '../utils/observer';
import { TwoImageStrategy } from '../strategies/TwoImageStrategy';
import { DataSrcStrategy } from '../strategies/DataSrcStrategy';
import { AnimationStrategy } from '../strategies/AnimationStrategy';
import { StyleInjector } from './StyleInjector';

export class LazyPic implements LazyPicInstance {
  private config: LazyPicConfig;
  private observer?: EnhancedIntersectionObserver;
  private strategy: LoadStrategy;
  private elements: Element[] = [];
  private styleInjector: StyleInjector;
  private status: 'idle' | 'loading' | 'loaded' | 'error' = 'idle';

  constructor(config: LazyPicConfig) {
    this.config = {
      animationDuration: 1000,
      strategy: 'dual-image',
      enableBlur: true,
      blurIntensity: 8,
      animationType: 'fade',
      easing: 'ease-out',
      rootMargin: '50px',
      threshold: 0.1,
      completionEffect: { enabled: false, type: 'none' },
      ...config
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

    if (config.completionEffect === undefined) {
      this.config.completionEffect = { enabled: false, type: 'none' };
    }

    this.normalizeLegacyConfig();

    this.styleInjector = StyleInjector.getInstance();
    this.strategy = this.createStrategy();
  }

  init(): void {
    this.status = 'loading';
    
    // 注入样式
    this.styleInjector.injectStyles();

    // 获取目标元素
    this.elements = Array.from(document.querySelectorAll(this.config.selector));
    
    if (this.elements.length === 0) {
      console.warn(`LazyPic: No elements found with selector "${this.config.selector}"`);
      this.status = 'idle';
      return;
    }

    // 创建观察者
    this.observer = createIntersectionObserver(
      (entries) => this.handleIntersection(entries),
      this.config
    );

    // 开始观察元素
    this.elements.forEach(element => {
      if (this.observer) {
        this.observer.observe(element, () => this.strategy.cleanup(element));
      }
    });
    
    this.status = 'loaded';
  }

  destroy(): void {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = undefined;
    }
    
    // 清理所有元素
    this.elements.forEach(element => {
      this.strategy.cleanup(element);
    });
    
    this.elements = [];
    this.status = 'idle';
  }

  updateConfig(newConfig: Partial<LazyPicConfig>): void {
    this.config = { ...this.config, ...newConfig };
    if (newConfig.completionEffect === undefined && this.config.completionEffect === undefined) {
      this.config.completionEffect = { enabled: false, type: 'none' };
    }
    this.normalizeLegacyConfig();
    this.strategy = this.createStrategy();

    // 重新初始化
    this.destroy();
    this.init();
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

  async loadImage(element: Element): Promise<void> {
    try {
      await this.strategy.execute(element, this.config);
    } catch (error) {
      this.status = 'error';
      if (this.config.onError) {
        this.config.onError(error as Error, element);
      }
      throw error;
    }
  }

  refresh(): void {
    this.destroy();
    this.init();
  }

  getStatus(): 'idle' | 'loading' | 'loaded' | 'error' {
    return this.status;
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

  private async handleIntersection(entries: IntersectionObserverEntry[]): Promise<void> {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const element = entry.target;
        
        // 停止观察该元素
        if (this.observer) {
          this.observer.unobserve(element);
        }

        // 执行加载策略
        try {
          await this.strategy.execute(element, this.config);
        } catch (error) {
          this.status = 'error';
          if (this.config.onError) {
            this.config.onError(error as Error, element);
          }
        }
      }
    }
  }
}