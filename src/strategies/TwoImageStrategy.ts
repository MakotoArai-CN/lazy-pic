/**
 * Dual-image strategy: a lightweight thumbnail stays visible while the full
 * image loads, then both layers crossfade on the compositor.
 */

import { BaseStrategy } from './BaseStrategy';
import { cancelAnimations, decodeImage, play, transitionDuration } from '../utils/animation';
import type { LazyPicConfig } from '../types';

interface OriginalStyles {
  opacity: string;
  transform: string;
  filter: string;
  clipPath: string;
  position: string;
  zIndex: string;
}

interface TransitionFrames {
  image: Keyframe[];
  thumbnail: Keyframe[];
}

export class TwoImageStrategy extends BaseStrategy {
  private originalStyles = new WeakMap<Element, OriginalStyles>();

  /** Hide the full image before it enters the viewport so the thumbnail is what users see. */
  prepare(element: Element, _config?: LazyPicConfig): void {
    if (!(element instanceof HTMLImageElement)) {
      return;
    }

    const lazySrc = element.dataset.src;
    const ready = element.complete && element.naturalWidth > 0 &&
      (!lazySrc || element.getAttribute('src') === lazySrc);

    if (!ready && this.findThumbnail(element)) {
      element.classList.add('lazy-pic-pending');
    }
  }

  async execute(element: Element, config: LazyPicConfig): Promise<void> {
    if (!(element instanceof HTMLImageElement)) {
      return;
    }

    const img = element;
    img.decoding = 'async';
    const lazySrc = img.dataset.src;
    const target = lazySrc || img.src;

    if (!target) {
      img.classList.remove('lazy-pic-pending');
      return;
    }

    // Fast path for images that were already loaded before LazyPic ran or on refresh.
    const alreadyLoaded = img.complete && img.naturalWidth > 0;
    const sourceReady = !lazySrc || img.getAttribute('src') === lazySrc;
    if (alreadyLoaded && sourceReady) {
      const loadedThumbnail = this.findThumbnail(img);
      if (loadedThumbnail) {
        loadedThumbnail.style.opacity = '0';
        loadedThumbnail.style.visibility = 'hidden';
      }
      img.classList.remove('lazy-pic-pending');
      this.notifyLoadComplete(element);
      return;
    }

    const thumbnail = this.findThumbnail(img);
    if (thumbnail) {
      img.classList.add('lazy-pic-pending');
    }

    const token = this.beginLoad(element);
    this.notifyLoadStart(element);
    this.saveOriginalStyles(element, img);

    try {
      if (lazySrc && img.getAttribute('src') !== lazySrc) {
        await this.preloadImage(lazySrc, element, 15000);
        if (!this.isCurrentLoad(element, token)) {
          return;
        }
        img.src = lazySrc;
      }

      await this.waitForImageElement(img, 15000, element);
      await decodeImage(img);
      if (!this.isCurrentLoad(element, token)) {
        return;
      }

      if (thumbnail) {
        const mask = this.createMaskElement(img, config);
        await this.revealWithThumbnail(img, thumbnail, config, mask, element);
      } else {
        await this.revealSolo(img, config, element);
      }

      if (!this.isCurrentLoad(element, token)) {
        return;
      }

      this.notifyLoadComplete(element);
      // Post-load flourishes are cosmetic: never keep onLoad waiting for them.
      void this.runCompletionEffect(img, config.completionEffect, { duration: 600, intensity: 1 });
    } catch (error) {
      if (!this.isCurrentLoad(element, token)) {
        return;
      }
      this.restoreOriginalStyles(element, img);
      this.handleError(error as Error, element);
    }
  }

  private findThumbnail(img: HTMLImageElement): HTMLElement | null {
    let sibling = img.previousElementSibling;
    if (sibling && sibling.tagName === 'IMG') {
      return sibling as HTMLElement;
    }

    sibling = img.nextElementSibling;
    if (sibling && sibling.tagName === 'IMG') {
      return sibling as HTMLElement;
    }

    const container = img.parentElement;
    if (container) {
      const images = container.querySelectorAll('img');
      for (const image of images) {
        if (
          image !== img &&
          (image.classList.contains('thumbnail') || image.classList.contains('lazy-thumbnail'))
        ) {
          return image as HTMLElement;
        }
      }
    }

    return null;
  }

  private async revealWithThumbnail(
    img: HTMLImageElement,
    thumbnail: HTMLElement,
    config: LazyPicConfig,
    mask: HTMLElement | null,
    owner: Element
  ): Promise<void> {
    const duration = transitionDuration(config.animationDuration);
    const easing = config.easing || 'ease-out';
    const frames = this.getTransitionFrames(config.animationType);

    img.style.position = 'relative';
    img.style.zIndex = '2';
    img.style.willChange = 'opacity, transform';
    thumbnail.style.willChange = 'opacity';
    thumbnail.style.display = '';
    thumbnail.style.visibility = '';

    await Promise.all([
      play(img, frames.image, { duration, easing }),
      play(thumbnail, frames.thumbnail, { duration, easing, commit: false })
    ]);

    img.style.willChange = '';
    thumbnail.style.willChange = '';
    img.classList.remove('lazy-pic-pending');
    this.restoreOriginalStyles(owner, img);
    // Hide in place instead of collapsing layout; display:none here made
    // in-flow thumbnails jump the full image at the exact end of the fade.
    thumbnail.style.opacity = '0';
    thumbnail.style.visibility = 'hidden';
    thumbnail.style.transform = '';

    if (mask) {
      void this.removeMaskElement(mask, config.mask?.animation || 'fade', 240).then(() => {
        this.unregisterNode(owner, mask);
      });
    }
  }

  private async revealSolo(img: HTMLImageElement, config: LazyPicConfig, owner: Element): Promise<void> {
    const duration = transitionDuration(config.animationDuration);
    const easing = config.easing || 'ease-out';

    img.style.willChange = 'opacity';
    await play(img, [
      { opacity: 0 },
      { opacity: 1 }
    ], { duration, easing });

    img.style.willChange = '';
    img.classList.remove('lazy-pic-pending');
    this.restoreOriginalStyles(owner, img);
  }

  private getTransitionFrames(type: string | undefined): TransitionFrames {
    switch (type) {
      case 'slide':
        return {
          image: [
            { opacity: 0, transform: 'translate3d(0, 18px, 0) scale(.995)' },
            { opacity: 1, transform: 'translate3d(0, 0, 0) scale(1)' }
          ],
          thumbnail: [
            { opacity: 1, transform: 'translate3d(0, 0, 0)' },
            { opacity: 0, transform: 'translate3d(0, -10px, 0)' }
          ]
        };
      case 'zoom':
      case 'scale':
        return {
          image: [
            { opacity: 0, transform: 'scale(1.05)' },
            { opacity: 1, transform: 'scale(1)' }
          ],
          thumbnail: [
            { opacity: 1, transform: 'scale(1)' },
            { opacity: 0, transform: 'scale(1.02)' }
          ]
        };
      case 'blur':
        return {
          image: [
            { opacity: 0, filter: 'blur(10px)', transform: 'scale(1.015)' },
            { opacity: 1, filter: 'blur(0px)', transform: 'scale(1)' }
          ],
          thumbnail: [{ opacity: 1 }, { opacity: 0 }]
        };
      case 'flip':
        return {
          image: [
            { opacity: 0, transform: 'perspective(900px) rotateY(-14deg) scale(.99)' },
            { opacity: 1, transform: 'perspective(900px) rotateY(0deg) scale(1)' }
          ],
          thumbnail: [
            { opacity: 1, transform: 'perspective(900px) rotateY(0deg)' },
            { opacity: 0, transform: 'perspective(900px) rotateY(10deg)' }
          ]
        };
      case 'reveal':
        return {
          image: [
            { opacity: 1, clipPath: 'circle(0% at 50% 50%)' },
            { opacity: 1, clipPath: 'circle(140% at 50% 50%)' }
          ],
          thumbnail: [
            { opacity: 1 },
            { opacity: 0, offset: 0.78 },
            { opacity: 0 }
          ]
        };
      case 'rotate':
        return {
          image: [
            { opacity: 0, transform: 'rotate(-1.5deg) scale(1.04)' },
            { opacity: 1, transform: 'rotate(0deg) scale(1)' }
          ],
          thumbnail: [{ opacity: 1 }, { opacity: 0 }]
        };
      case 'spiral':
        return {
          image: [
            { opacity: 0, transform: 'scale(.86) rotate(-8deg)' },
            { opacity: 1, transform: 'scale(1) rotate(0deg)' }
          ],
          thumbnail: [{ opacity: 1 }, { opacity: 0 }]
        };
      case 'fade':
      default:
        return {
          image: [{ opacity: 0 }, { opacity: 1 }],
          thumbnail: [{ opacity: 1 }, { opacity: 0 }]
        };
    }
  }

  private saveOriginalStyles(owner: Element, img: HTMLImageElement): void {
    this.originalStyles.set(owner, {
      opacity: img.style.opacity,
      transform: img.style.transform,
      filter: img.style.filter,
      clipPath: img.style.clipPath,
      position: img.style.position,
      zIndex: img.style.zIndex
    });
  }

  private restoreOriginalStyles(owner: Element, img: HTMLImageElement): void {
    const styles = this.originalStyles.get(owner);
    if (!styles) {
      return;
    }

    img.style.opacity = styles.opacity;
    img.style.transform = styles.transform;
    img.style.filter = styles.filter;
    img.style.clipPath = styles.clipPath;
    img.style.position = styles.position;
    img.style.zIndex = styles.zIndex;
    this.originalStyles.delete(owner);
  }

  cleanup(element: Element): void {
    super.cleanup(element);

    if (!(element instanceof HTMLImageElement)) {
      return;
    }

    const img = element;
    const thumbnail = this.findThumbnail(img);

    this.restoreOriginalStyles(element, img);
    this.resetImageStyles(img);

    if (thumbnail) {
      cancelAnimations(thumbnail);
      thumbnail.style.display = '';
      thumbnail.style.visibility = '';
      thumbnail.style.opacity = '';
      thumbnail.style.transform = '';
      thumbnail.style.filter = '';
      thumbnail.style.willChange = '';
    }
  }
}
