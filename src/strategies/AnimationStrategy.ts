/**
 * Full-cover placeholder strategy.
 *
 * The loader is only mounted when an image is not ready almost instantly, so a
 * cached image never flashes a skeleton. Nothing artificially delays the reveal
 * and the placeholder fades out alongside the image fade-in.
 */

import { BaseStrategy } from './BaseStrategy';
import { createLoader } from '../animations';
import { decodeImage, play, transitionDuration } from '../utils/animation';
import type { LazyPicConfig } from '../types';

interface OriginalStyles {
  opacity: string;
  transition: string;
}

export class AnimationStrategy extends BaseStrategy {
  private originalStyles = new WeakMap<Element, OriginalStyles>();

  async execute(element: Element, config: LazyPicConfig): Promise<void> {
    if (!(element instanceof HTMLImageElement)) {
      return;
    }

    const img = element;
    img.decoding = 'async';
    const lazySrc = img.dataset.src;
    const target = lazySrc || img.src;

    if (!target) {
      this.handleError(new Error('data-src attribute or src is required for animation strategy'), element);
      return;
    }

    // Already loaded before LazyPic ran (or on refresh): nothing to animate.
    const alreadyLoaded = img.complete && img.naturalWidth > 0;
    const sourceReady = !lazySrc || img.getAttribute('src') === lazySrc;
    if (alreadyLoaded && sourceReady) {
      this.notifyLoadComplete(element);
      return;
    }

    const token = this.beginLoad(element);
    this.notifyLoadStart(element);
    this.saveOriginalStyles(element, img);

    let placeholder: HTMLElement | null = null;
    let mask: HTMLElement | null = null;
    let placeholderTimer = 0;

    img.style.opacity = '0';
    img.style.transition = 'none';

    const preload = this.preloadImage(target, element, 15000);

    // Avoid a skeleton flash on fast/cached responses, but give feedback quickly
    // when the network actually takes time.
    placeholderTimer = window.setTimeout(() => {
      const state = this.showPlaceholder(element, img, config);
      placeholder = state.placeholder;
      mask = state.mask;
    }, 100);
    const clearPlaceholderTimer = () => window.clearTimeout(placeholderTimer);
    this.registerCleanup(element, clearPlaceholderTimer);

    try {
      await preload;
      window.clearTimeout(placeholderTimer);
      this.unregisterCleanup(element, clearPlaceholderTimer);
      if (!this.isCurrentLoad(element, token)) {
        return;
      }

      if (lazySrc && img.getAttribute('src') !== lazySrc) {
        img.src = lazySrc;
        await this.waitForImageElement(img, 5000, element);
      }
      await decodeImage(img);
      if (!this.isCurrentLoad(element, token)) {
        return;
      }

      if (placeholder) {
        await this.revealWithPlaceholder(img, placeholder, config, element);
      } else {
        img.style.opacity = '1';
      }

      if (!this.isCurrentLoad(element, token)) {
        return;
      }

      this.restoreOriginalStyles(element, img);
      this.notifyLoadComplete(element);

      if (mask) {
        const maskElement = mask;
        void this.removeMaskElement(maskElement, config.mask?.animation || 'fade', 220).then(() => {
          this.unregisterNode(element, maskElement);
        });
      }
      void this.runCompletionEffect(img, config.completionEffect, { duration: 800, intensity: 1.2 });
    } catch (error) {
      window.clearTimeout(placeholderTimer);
      this.unregisterCleanup(element, clearPlaceholderTimer);
      if (!this.isCurrentLoad(element, token)) {
        return;
      }
      this.removePlaceholder(placeholder, element);

      if (mask) {
        void this.removeMaskElement(mask, config.mask?.animation || 'fade', 160).then(() => {
          this.unregisterNode(element, mask!);
        });
      }

      this.restoreOriginalStyles(element, img);
      this.handleError(error as Error, element);
    }
  }

  private showPlaceholder(
    owner: Element,
    img: HTMLImageElement,
    config: LazyPicConfig
  ): { placeholder: HTMLElement | null; mask: HTMLElement | null } {
    const container = img.parentElement;
    if (!container) {
      return { placeholder: null, mask: null };
    }

    this.ensurePositioned(container, owner);

    const imgRect = img.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    const width = imgRect.width || img.offsetWidth;
    const height = imgRect.height || img.offsetHeight;
    const placeholderConfig = config.placeholder;

    const placeholder = document.createElement('div');
    placeholder.className = 'lazy-pic-placeholder';

    if (width > 1 && height > 1) {
      placeholder.style.top = `${imgRect.top - containerRect.top}px`;
      placeholder.style.left = `${imgRect.left - containerRect.left}px`;
      placeholder.style.width = `${width}px`;
      placeholder.style.height = `${height}px`;
    } else {
      placeholder.style.inset = '0';
      placeholder.style.width = '100%';
      placeholder.style.height = '100%';
    }

    if (placeholderConfig?.width) {
      placeholder.style.width = placeholderConfig.width;
    }
    if (placeholderConfig?.height) {
      placeholder.style.height = placeholderConfig.height;
    }

    const computed = getComputedStyle(img);
    if (computed.borderRadius && computed.borderRadius !== '0px') {
      placeholder.style.borderRadius = computed.borderRadius;
    }

    if (placeholderConfig?.backgroundColor) {
      placeholder.style.backgroundColor = placeholderConfig.backgroundColor;
    }
    if (placeholderConfig?.backgroundGradient) {
      placeholder.style.background = placeholderConfig.backgroundGradient;
    }

    if (placeholderConfig?.customContent) {
      const custom = document.createElement('div');
      custom.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%;';
      this.appendSafeContent(custom, placeholderConfig.customContent);
      placeholder.appendChild(custom);
    } else {
      placeholder.appendChild(
        createLoader(
          placeholderConfig?.animation || 'skeleton',
          placeholderConfig?.color || '#007bff',
          placeholderConfig?.animationSpeed || 1
        )
      );
    }

    if (placeholderConfig?.showText && placeholderConfig.loadingText) {
      const text = document.createElement('span');
      text.className = 'lazy-pic-loader-text';
      text.textContent = placeholderConfig.loadingText;
      placeholder.appendChild(text);
    }

    const mask = this.createMaskElement(owner, config, { container });

    placeholder.style.opacity = '1';
    placeholder.style.transform = 'scale(1)';
    container.appendChild(placeholder);
    this.registerNode(owner, placeholder);

    // The inline end state above is the fallback; WAAPI overrides it while
    // running, so reduced-motion users simply see the placeholder immediately.
    void play(placeholder, [
      { opacity: 0, transform: 'scale(.985)' },
      { opacity: 1, transform: 'scale(1)' }
    ], { duration: 180, easing: 'ease-out' });

    return { placeholder, mask };
  }

  private async revealWithPlaceholder(
    img: HTMLImageElement,
    placeholder: HTMLElement,
    config: LazyPicConfig,
    owner: Element
  ): Promise<void> {
    const duration = Math.min(transitionDuration(config.animationDuration) * 0.45, 320);
    const easing = config.easing || 'ease-out';

    await Promise.all([
      play(img, [
        { opacity: 0 },
        { opacity: 1 }
      ], { duration: Math.min(duration + 60, 380), easing }),
      play(placeholder, [
        { opacity: 1, transform: 'scale(1)' },
        { opacity: 0, transform: 'scale(.985)' }
      ], { duration, easing })
    ]);

    placeholder.remove();
    this.unregisterNode(owner, placeholder);
  }

  private removePlaceholder(placeholder: HTMLElement | null, owner: Element): void {
    if (!placeholder) {
      return;
    }
    placeholder.remove();
    this.unregisterNode(owner, placeholder);
  }

  private saveOriginalStyles(owner: Element, img: HTMLImageElement): void {
    this.originalStyles.set(owner, {
      opacity: img.style.opacity,
      transition: img.style.transition
    });
  }

  private restoreOriginalStyles(owner: Element, img: HTMLImageElement): void {
    const styles = this.originalStyles.get(owner);
    if (!styles) {
      return;
    }

    img.style.opacity = styles.opacity;
    img.style.transition = styles.transition;
    this.originalStyles.delete(owner);
  }

  cleanup(element: Element): void {
    super.cleanup(element);

    if (!(element instanceof HTMLImageElement)) {
      return;
    }

    this.restoreOriginalStyles(element, element);
  }
}
