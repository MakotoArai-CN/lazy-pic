/**
 * 加载策略基类
 */

import type { CompletionEffectConfig, LazyPicConfig, LoadStrategy, MaskConfig } from '../types';
import { createCompletionEffect } from '../utils/animation';

interface ElementRuntimeState {
  cleanups: Set<() => void>;
  nodes: Set<Node>;
}

export abstract class BaseStrategy implements LoadStrategy {
  protected config: LazyPicConfig;
  private elementStates = new WeakMap<Element, ElementRuntimeState>();

  constructor(config: LazyPicConfig) {
    this.config = config;
  }

  abstract execute(element: Element, config: LazyPicConfig): Promise<void>;

  cleanup(element: Element): void {
    const state = this.elementStates.get(element);

    if (state) {
      state.cleanups.forEach(cleanup => cleanup());
      state.nodes.forEach(node => {
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      });
      this.elementStates.delete(element);
    }

    element.classList.remove('lazy-pic-loading', 'lazy-pic-loaded', 'lazy-pic-error');
  }

  protected async preloadImage(src: string, owner?: Element, timeoutMs = 10000): Promise<HTMLImageElement> {
    const img = new Image();
    img.src = src;
    await this.waitForImageElement(img, timeoutMs, owner, `Failed to load image: ${src}`);
    return img;
  }

  protected waitForImageElement(
    img: HTMLImageElement,
    timeoutMs = 10000,
    owner?: Element,
    errorMessage = 'Image load failed'
  ): Promise<void> {
    if (img.complete && img.naturalHeight > 0) {
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      const onLoad = () => {
        cleanup();
        resolve();
      };
      const onError = () => {
        cleanup();
        reject(new Error(errorMessage));
      };
      const timeout = window.setTimeout(() => {
        cleanup();
        reject(new Error('Image load timeout'));
      }, timeoutMs);

      const cleanup = () => {
        window.clearTimeout(timeout);
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
      };

      img.addEventListener('load', onLoad, { once: true });
      img.addEventListener('error', onError, { once: true });

      if (owner) {
        this.registerCleanup(owner, cleanup);
      }

      if (!img.src) {
        cleanup();
        reject(new Error('Image src is empty'));
      }
    });
  }

  protected registerCleanup(element: Element, cleanup: () => void): void {
    this.getElementState(element).cleanups.add(cleanup);
  }

  protected registerNode(element: Element, node: Node): void {
    this.getElementState(element).nodes.add(node);
  }

  protected unregisterNode(element: Element, node: Node): void {
    this.getElementState(element).nodes.delete(node);
  }

  protected createMaskElement(
    owner: Element,
    config: LazyPicConfig,
    options: {
      container?: HTMLElement | null;
      style?: Partial<CSSStyleDeclaration>;
      maskConfig?: MaskConfig;
    } = {}
  ): HTMLElement | null {
    const maskConfig = options.maskConfig ?? config.mask;
    if (!maskConfig?.enabled) {
      return null;
    }

    const container = options.container ?? (owner instanceof HTMLElement ? owner.parentElement : null);
    if (!container) {
      return null;
    }

    const mask = document.createElement('div');
    mask.className = 'lazy-pic-mask-overlay';
    Object.assign(mask.style, {
      position: 'absolute',
      top: '0',
      left: '0',
      width: '100%',
      height: '100%',
      zIndex: '5',
      opacity: `${maskConfig.opacity ?? 0.4}`,
      transition: 'all 0.3s ease',
      ...options.style
    });

    switch (maskConfig.type) {
      case 'gradient':
        mask.classList.add('lazy-pic-mask-gradient');
        break;
      case 'pattern':
        mask.classList.add('lazy-pic-mask-pattern');
        break;
      case 'blur':
        mask.style.backdropFilter = 'blur(5px)';
        mask.style.backgroundColor = 'rgba(255,255,255,0.1)';
        break;
      case 'custom':
        this.appendSafeContent(mask, maskConfig.customContent);
        break;
      default:
        mask.style.backgroundColor = maskConfig.color || 'rgba(0,0,0,0.3)';
    }

    const originalPosition = container.style.position;
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
      this.registerCleanup(owner, () => {
        container.style.position = originalPosition;
      });
    }

    container.appendChild(mask);
    this.registerNode(owner, mask);
    return mask;
  }

  protected async removeMaskElement(mask: HTMLElement | null, animation = 'fade', duration = 300): Promise<void> {
    if (!mask) {
      return;
    }

    switch (animation) {
      case 'slide':
        mask.style.transition = `all ${duration}ms ease`;
        mask.style.transform = 'translateX(100%)';
        mask.style.opacity = '0';
        break;
      case 'zoom':
        mask.style.transition = `all ${duration}ms ease`;
        mask.style.transform = 'scale(0)';
        mask.style.opacity = '0';
        break;
      case 'dissolve':
        await this.createDissolveEffect(mask, duration);
        break;
      default:
        mask.style.transition = `opacity ${duration}ms ease`;
        mask.style.opacity = '0';
    }

    await new Promise<void>(resolve => {
      window.setTimeout(() => {
        mask.remove();
        resolve();
      }, duration);
    });
  }

  protected appendSafeContent(container: HTMLElement, content?: string | HTMLElement): void {
    if (!content) {
      return;
    }

    if (typeof content === 'string') {
      container.textContent = content;
      return;
    }

    container.appendChild(content.cloneNode(true));
  }

  protected async runCompletionEffect(
    element: HTMLElement,
    effectConfig?: CompletionEffectConfig,
    defaults: { duration: number; intensity: number } = { duration: 600, intensity: 1 }
  ): Promise<void> {
    if (!effectConfig?.enabled || !effectConfig.type || effectConfig.type === 'none') {
      return;
    }

    await createCompletionEffect(element, effectConfig.type, {
      duration: effectConfig.duration ?? defaults.duration,
      intensity: effectConfig.intensity ?? defaults.intensity,
      color: effectConfig.color
    });
  }

  protected resetImageStyles(img: HTMLImageElement): void {
    img.style.opacity = '';
    img.style.transform = '';
    img.style.filter = '';
    img.style.clipPath = '';
    img.style.transition = '';
    img.style.position = '';
    img.style.zIndex = '';
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

  private async createDissolveEffect(mask: HTMLElement, duration: number): Promise<void> {
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      mask.style.opacity = (1 - (i + 1) / steps).toString();
      mask.style.filter = `blur(${i * 2}px)`;
      await new Promise(resolve => window.setTimeout(resolve, duration / steps));
    }
  }

  private getElementState(element: Element): ElementRuntimeState {
    let state = this.elementStates.get(element);
    if (!state) {
      state = {
        cleanups: new Set(),
        nodes: new Set()
      };
      this.elementStates.set(element, state);
    }
    return state;
  }
}
