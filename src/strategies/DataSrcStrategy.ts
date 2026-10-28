/**
 * data-src strategy.
 *
 * The placeholder <img> stays visible while the real image is preloaded and
 * decoded. A single absolutely positioned overlay crossfades over it, then the
 * cached source is swapped in. There is no second network wait and no
 * requestAnimationFrame loop.
 */

import { BaseStrategy } from './BaseStrategy';
import { decodeImage, play, transitionDuration } from '../utils/animation';
import type { LazyPicConfig } from '../types';

export class DataSrcStrategy extends BaseStrategy {
  private transitionOrigins = new WeakMap<Element, string>();
  private transitionTokens = new WeakMap<Element, number>();

  async execute(element: Element, config: LazyPicConfig): Promise<void> {
    if (!(element instanceof HTMLImageElement)) {
      return;
    }

    const img = element;
    img.decoding = 'async';
    const lazySrc = img.dataset.src;
    if (!lazySrc || img.getAttribute('src') === lazySrc) {
      return;
    }

    const originalSrc = img.getAttribute('src');
    const parent = img.parentElement;
    let overlay: HTMLElement | null = null;
    let mask: HTMLElement | null = null;

    const token = this.beginLoad(element);
    this.lockTransition(element, img);
    this.notifyLoadStart(element);

    if (config.enableBlur) {
      img.style.filter = `blur(${config.blurIntensity ?? 8}px)`;
    }

    try {
      const preloaded = await this.preloadImage(lazySrc, element, 10000);
      if (!this.isCurrentLoad(element, token)) {
        return;
      }

      if (!parent) {
        img.src = lazySrc;
        await this.waitForImageElement(img, 5000, element);
        await decodeImage(img);
        if (!this.isCurrentLoad(element, token)) {
          return;
        }
        this.clearPlaceholder(img);
        this.unlockTransition(element, img);
        this.notifyLoadComplete(element);
        void this.runCompletionEffect(img, config.completionEffect, { duration: 600, intensity: 1 });
        return;
      }

      mask = this.createMaskElement(img, config);
      overlay = this.createOverlay(img, preloaded, element);

      const duration = transitionDuration(config.animationDuration);
      const easing = config.easing || 'ease-out';
      const frames = this.getTransitionFrames(config.animationType);

      const animated = await play(overlay, frames, { duration, easing });
      if (!this.isCurrentLoad(element, token)) {
        return;
      }
      if (!animated) {
        overlay.style.opacity = '1';
        overlay.style.transform = 'none';
        overlay.style.filter = '';
        overlay.style.clipPath = '';
      }

      img.src = lazySrc;
      await this.waitForImageElement(img, 10000, element);
      await decodeImage(img);
      if (!this.isCurrentLoad(element, token)) {
        return;
      }

      this.clearPlaceholder(img);
      overlay.remove();
      this.unregisterNode(element, overlay);
      overlay = null;
      this.unlockTransition(element, img);

      this.notifyLoadComplete(element);
      if (mask) {
        const maskElement = mask;
        void this.removeMaskElement(maskElement, config.mask?.animation || 'fade', 240).then(() => {
          this.unregisterNode(element, maskElement);
        });
      }
      void this.runCompletionEffect(img, config.completionEffect, { duration: 600, intensity: 1 });
    } catch (error) {
      if (!this.isCurrentLoad(element, token)) {
        return;
      }

      if (overlay) {
        overlay.remove();
        this.unregisterNode(element, overlay);
      }
      if (mask) {
        mask.remove();
        this.unregisterNode(element, mask);
      }

      this.clearPlaceholder(img);
      this.unlockTransition(element, img);
      if (originalSrc) {
        img.setAttribute('src', originalSrc);
      } else {
        img.removeAttribute('src');
      }
      this.handleError(error as Error, element);
    }
  }

  /**
   * User stylesheets often declare `transition: all .3s`. Without this lock,
   * clearing the placeholder blur after the overlay is removed starts a fresh
   * 300ms transition, which reads as a soft settle/rebound after the image has
   * already finished loading.
   */
  private lockTransition(owner: Element, img: HTMLImageElement): void {
    if (!this.transitionOrigins.has(owner)) {
      this.transitionOrigins.set(owner, img.style.transition);
      img.style.transition = 'none';
    }
    this.transitionTokens.set(owner, (this.transitionTokens.get(owner) || 0) + 1);
  }

  private unlockTransition(owner: Element, img: HTMLImageElement): void {
    const original = this.transitionOrigins.get(owner);
    if (original === undefined) {
      return;
    }

    const token = (this.transitionTokens.get(owner) || 0) + 1;
    this.transitionTokens.set(owner, token);

    // Let the cleared filter paint for one frame before restoring the CSS
    // transition; otherwise the cleanup itself would animate.
    window.requestAnimationFrame(() => {
      if (this.transitionTokens.get(owner) !== token) {
        return;
      }
      img.style.transition = original;
      this.transitionOrigins.delete(owner);
      this.transitionTokens.delete(owner);
    });
  }

  private flushTransition(owner: Element, img: HTMLImageElement): void {
    const original = this.transitionOrigins.get(owner);
    if (original !== undefined) {
      img.style.transition = original;
    }
    this.transitionOrigins.delete(owner);
    this.transitionTokens.delete(owner);
  }

  private createOverlay(
    img: HTMLImageElement,
    preloaded: HTMLImageElement,
    owner: Element
  ): HTMLElement {
    const parent = img.parentElement!;
    this.ensurePositioned(parent, owner);

    const container = document.createElement('div');
    container.className = 'lazy-pic-transition';
    container.style.opacity = '0';

    const imageRect = img.getBoundingClientRect();
    const parentRect = parent.getBoundingClientRect();

    if (imageRect.width > 1 && imageRect.height > 1) {
      container.style.top = `${imageRect.top - parentRect.top}px`;
      container.style.left = `${imageRect.left - parentRect.left}px`;
      container.style.width = `${imageRect.width}px`;
      container.style.height = `${imageRect.height}px`;
    }

    const computed = getComputedStyle(img);
    if (computed.borderRadius && computed.borderRadius !== '0px') {
      container.style.borderRadius = computed.borderRadius;
    }

    const transitionImg = document.createElement('img');
    transitionImg.src = preloaded.src;
    transitionImg.alt = '';
    transitionImg.decoding = 'async';
    if (img.crossOrigin) {
      transitionImg.crossOrigin = img.crossOrigin;
    }
    if (img.referrerPolicy) {
      transitionImg.referrerPolicy = img.referrerPolicy;
    }
    transitionImg.style.objectFit = computed.objectFit || 'cover';
    transitionImg.style.objectPosition = computed.objectPosition || 'center';

    container.appendChild(transitionImg);
    parent.appendChild(container);
    this.registerNode(owner, container);
    return container;
  }

  private getTransitionFrames(type: string | undefined): Keyframe[] {
    switch (type) {
      case 'slide':
        return [
          { opacity: 0, transform: 'translate3d(0, 24px, 0) scale(.995)' },
          { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }
        ];
      case 'zoom':
      case 'scale':
        return [
          { opacity: 0, transform: 'scale(.94)' },
          { opacity: 1, transform: 'scale(1)' }
        ];
      case 'rotate':
        return [
          { opacity: 0, transform: 'rotate(-2deg) scale(1.03)' },
          { opacity: 1, transform: 'rotate(0deg) scale(1)' }
        ];
      case 'blur':
        return [
          { opacity: 0, filter: 'blur(12px)' },
          { opacity: 1, filter: 'blur(0px)' }
        ];
      case 'flip':
        return [
          { opacity: 0, transform: 'perspective(900px) rotateY(-18deg)' },
          { opacity: 1, transform: 'perspective(900px) rotateY(0deg)' }
        ];
      case 'reveal':
        return [
          { opacity: 1, clipPath: 'inset(0 0 100% 0)' },
          { opacity: 1, clipPath: 'inset(0 0 0 0)' }
        ];
      case 'spiral':
        return [
          { opacity: 1, clipPath: 'circle(0% at 50% 50%)', transform: 'scale(.98)' },
          { opacity: 1, clipPath: 'circle(140% at 50% 50%)', transform: 'scale(1)' }
        ];
      case 'fade':
      default:
        return [
          { opacity: 0 },
          { opacity: 1 }
        ];
    }
  }

  private clearPlaceholder(img: HTMLImageElement): void {
    img.style.filter = '';
    img.style.willChange = '';
  }

  cleanup(element: Element): void {
    super.cleanup(element);

    if (!(element instanceof HTMLImageElement)) {
      return;
    }

    this.clearPlaceholder(element);
    this.flushTransition(element, element);
    element.classList.remove('lazy-pic-loading', 'lazy-pic-loaded');
  }
}
