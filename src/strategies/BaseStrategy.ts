/**
 * Shared loading strategy primitives.
 */

import type { CompletionEffectConfig, LazyPicConfig, LoadStrategy, MaskConfig } from '../types';
import {
  cancelAnimations,
  createCompletionEffect,
  decodeImage,
  play
} from '../utils/animation';

interface ElementRuntimeState {
  cleanups: Set<() => void>;
  nodes: Set<Node>;
}

export abstract class BaseStrategy implements LoadStrategy {
  protected config: LazyPicConfig;
  private elementStates = new WeakMap<Element, ElementRuntimeState>();
  private loadTokens = new WeakMap<Element, number>();

  constructor(config: LazyPicConfig) {
    this.config = config;
  }

  abstract execute(element: Element, config: LazyPicConfig): Promise<void>;

  cleanup(element: Element): void {
    // Invalidate any in-flight execute() for this element before tearing down.
    this.loadTokens.set(element, (this.loadTokens.get(element) || 0) + 1);
    cancelAnimations(element);

    const state = this.elementStates.get(element);

    if (state) {
      state.cleanups.forEach(cleanup => cleanup());
      state.nodes.forEach(node => {
        if (node instanceof Element) {
          cancelAnimations(node);
        }
        if (node.parentNode) {
          node.parentNode.removeChild(node);
        }
      });
      this.elementStates.delete(element);
    }

    element.classList.remove(
      'lazy-pic-loading',
      'lazy-pic-loaded',
      'lazy-pic-pending',
      'lazy-pic-error'
    );
  }

  /** Starts a load session. Returns a token used to detect stale async work. */
  protected beginLoad(element: Element): number {
    const token = (this.loadTokens.get(element) || 0) + 1;
    this.loadTokens.set(element, token);
    return token;
  }

  protected isCurrentLoad(element: Element, token: number): boolean {
    return this.loadTokens.get(element) === token;
  }

  protected async preloadImage(src: string, owner?: Element, timeoutMs = 10000): Promise<HTMLImageElement> {
    if (!src) {
      throw new Error('Image src is empty');
    }

    const img = new Image();
    img.decoding = 'async';
    if (owner instanceof HTMLImageElement) {
      if (owner.crossOrigin) {
        img.crossOrigin = owner.crossOrigin;
      }
      if (owner.referrerPolicy) {
        img.referrerPolicy = owner.referrerPolicy;
      }
    }
    img.src = src;
    await this.waitForImageElement(img, timeoutMs, owner, `Failed to load image: ${src}`);
    await decodeImage(img);
    return img;
  }

  protected waitForImageElement(
    img: HTMLImageElement,
    timeoutMs = 10000,
    owner?: Element,
    errorMessage = 'Image load failed'
  ): Promise<void> {
    if (img.complete) {
      return img.naturalWidth > 0
        ? Promise.resolve()
        : Promise.reject(new Error(errorMessage));
    }

    return new Promise((resolve, reject) => {
      let settled = false;
      let timeout = 0;

      const dispose = () => {
        window.clearTimeout(timeout);
        img.removeEventListener('load', onLoad);
        img.removeEventListener('error', onError);
        if (owner) {
          this.unregisterCleanup(owner, dispose);
        }
      };

      const settle = (error?: Error) => {
        if (settled) {
          return;
        }
        settled = true;
        dispose();
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      };

      const onLoad = () => settle();
      const onError = () => settle(new Error(errorMessage));

      timeout = window.setTimeout(() => settle(new Error('Image load timeout')), timeoutMs);
      img.addEventListener('load', onLoad, { once: true });
      img.addEventListener('error', onError, { once: true });

      if (owner) {
        this.registerCleanup(owner, dispose);
      }
    });
  }

  protected ensurePositioned(container: HTMLElement, owner: Element): void {
    if (getComputedStyle(container).position !== 'static') {
      return;
    }

    const previous = container.style.position;
    container.style.position = 'relative';
    this.registerCleanup(owner, () => {
      container.style.position = previous;
    });
  }

  protected registerCleanup(element: Element, cleanup: () => void): void {
    this.getElementState(element).cleanups.add(cleanup);
  }

  protected unregisterCleanup(element: Element, cleanup: () => void): void {
    this.elementStates.get(element)?.cleanups.delete(cleanup);
  }

  protected registerNode(element: Element, node: Node): void {
    this.getElementState(element).nodes.add(node);
  }

  protected unregisterNode(element: Element, node: Node): void {
    this.elementStates.get(element)?.nodes.delete(node);
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
    mask.style.opacity = `${maskConfig.opacity ?? 0.4}`;
    Object.assign(mask.style, options.style);

    switch (maskConfig.type) {
      case 'gradient':
        mask.classList.add('lazy-pic-mask-gradient');
        break;
      case 'pattern':
        mask.classList.add('lazy-pic-mask-pattern');
        break;
      case 'blur':
        mask.style.backdropFilter = 'blur(5px)';
        mask.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
        break;
      case 'custom':
        this.appendSafeContent(mask, maskConfig.customContent);
        break;
      default:
        mask.style.backgroundColor = maskConfig.color || 'rgba(0, 0, 0, 0.3)';
    }

    this.ensurePositioned(container, owner);
    container.appendChild(mask);
    this.registerNode(owner, mask);
    return mask;
  }

  protected async removeMaskElement(mask: HTMLElement | null, animation = 'fade', duration = 240): Promise<void> {
    if (!mask || !mask.parentNode) {
      return;
    }

    const timeout = Math.min(Math.max(duration, 80), 400);
    let keyframes: Keyframe[];

    switch (animation) {
      case 'slide':
        keyframes = [{ opacity: 1, transform: 'translate3d(0, 0, 0)' }, { opacity: 0, transform: 'translate3d(30%, 0, 0)' }];
        break;
      case 'zoom':
        keyframes = [{ opacity: 1, transform: 'scale(1)' }, { opacity: 0, transform: 'scale(.96)' }];
        break;
      case 'dissolve':
        keyframes = [{ opacity: 1, filter: 'blur(0)' }, { opacity: 0, filter: 'blur(6px)' }];
        break;
      default:
        keyframes = [{ opacity: 1 }, { opacity: 0 }];
    }

    await play(mask, keyframes, { duration: timeout, easing: 'ease-out' });
    mask.remove();
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
    img.style.willChange = '';
  }

  protected handleError(error: Error, element: Element): void {
    element.classList.remove('lazy-pic-loading', 'lazy-pic-pending');
    element.classList.add('lazy-pic-error');

    if (this.config.onError) {
      this.config.onError(error, element);
    } else {
      console.error('LazyPic loading error:', error);
    }
  }

  protected notifyLoadStart(element: Element): void {
    element.classList.remove('lazy-pic-loaded', 'lazy-pic-error');
    element.classList.add('lazy-pic-loading');
    if (this.config.onStartLoad) {
      this.config.onStartLoad(element);
    }
  }

  protected notifyLoadComplete(element: Element): void {
    element.classList.remove('lazy-pic-loading', 'lazy-pic-pending', 'lazy-pic-error');
    element.classList.add('lazy-pic-loaded');
    if (this.config.onLoad) {
      this.config.onLoad(element);
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
