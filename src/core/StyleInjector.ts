/**
 * 样式注入器
 */

import { animationStyles } from '../animations';

export class StyleInjector {
  private static instance: StyleInjector;
  private styleElement?: HTMLStyleElement;
  private injected = false;

  static getInstance(): StyleInjector {
    if (!StyleInjector.instance) {
      StyleInjector.instance = new StyleInjector();
    }
    return StyleInjector.instance;
  }

  injectStyles(): void {
    if (this.injected) return;

    this.styleElement = document.createElement('style');
    this.styleElement.id = 'lazy-pic-styles';
    this.styleElement.innerHTML = animationStyles;
    
    document.head.appendChild(this.styleElement);
    this.injected = true;
  }

  removeStyles(): void {
    if (this.styleElement) {
      this.styleElement.remove();
      this.styleElement = undefined;
      this.injected = false;
    }
  }

  addCustomStyles(styles: string): void {
    if (!this.injected) {
      this.injectStyles();
    }
    
    if (this.styleElement) {
      this.styleElement.innerHTML += styles;
    }
  }
}