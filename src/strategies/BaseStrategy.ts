/**
 * 加载策略基类
 */

import type { LazyPicConfig, LoadStrategy } from '../types';

export abstract class BaseStrategy implements LoadStrategy {
  protected config: LazyPicConfig;

  constructor(config: LazyPicConfig) {
    this.config = config;
  }

  abstract execute(element: Element, config: LazyPicConfig): Promise<void>;

  cleanup(element: Element): void {
    // 默认清理逻辑
    element.classList.remove('lazy-pic-loading', 'lazy-pic-loaded', 'lazy-pic-error');
  }

  protected async preloadImage(src: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`Failed to load image: ${src}`));
      img.src = src;
    });
  }

  protected handleError(error: Error, element: Element): void {
    element.classList.add('lazy-pic-error');
    element.classList.remove('lazy-pic-loading');
    
    if (this.config.onError) {
      this.config.onError(error, element);
    } else {
      console.error('LazyPic loading error:', error);
    }
  }

  protected notifyLoadStart(element: Element): void {
    element.classList.add('lazy-pic-loading');
    if (this.config.onStartLoad) {
      this.config.onStartLoad(element);
    }
  }

  protected notifyLoadComplete(element: Element): void {
    element.classList.remove('lazy-pic-loading');
    element.classList.add('lazy-pic-loaded');
    if (this.config.onLoad) {
      this.config.onLoad(element);
    }
  }
}