/**
 * 支持遮罩的优化双图片加载策略
 */

import { BaseStrategy } from './BaseStrategy';
import { animate, easingFunctions } from '../utils/animation';
import { addClass, removeClass } from '../utils/dom';
import type { LazyPicConfig } from '../types';

export class TwoImageStrategy extends BaseStrategy {
  async execute(element: Element, config: LazyPicConfig): Promise<void> {
    const img = element as HTMLImageElement;

    if (!img.src) {
      return;
    }

    this.notifyLoadStart(element);

    try {
      const thumbnail = this.findThumbnail(img);
      if (!thumbnail) {
        await this.fallbackToDataSrc(img, config);
        return;
      }

      addClass(img, 'lazy-pic-loading');
      const mask = this.createMaskElement(img, config);
      await this.waitForImageLoad(img, element);
      await this.executeElegantTransition(img, thumbnail, config, mask, element);
      await this.runCompletionEffect(img, config.completionEffect, { duration: 600, intensity: 1 });

      this.notifyLoadComplete(element);
    } catch (error) {
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
        if (image !== img && (image.classList.contains('thumbnail') || image.classList.contains('lazy-thumbnail'))) {
          return image as HTMLElement;
        }
      }
    }

    return null;
  }

  private waitForImageLoad(img: HTMLImageElement, owner: Element): Promise<void> {
    return this.waitForImageElement(img, 15000, owner);
  }

  private async executeElegantTransition(
    img: HTMLImageElement,
    thumbnail: HTMLElement,
    config: LazyPicConfig,
    mask: HTMLElement | null,
    owner: Element
  ): Promise<void> {
    const duration = config.animationDuration || 1000;
    const easing = easingFunctions[config.easing || 'ease-out'];

    img.style.position = 'relative';
    img.style.zIndex = '3';

    switch (config.animationType) {
      case 'fade':
        await this.fadeTransition(img, thumbnail, duration, easing);
        break;
      case 'slide':
        await this.slideTransition(img, thumbnail, duration);
        break;
      case 'zoom':
      case 'scale':
        await this.zoomTransition(img, thumbnail, duration);
        break;
      case 'blur':
        await this.blurTransition(img, thumbnail, duration);
        break;
      case 'flip':
        await this.flipTransition(img, thumbnail, duration);
        break;
      case 'reveal':
        await this.revealTransition(img, thumbnail, duration);
        break;
      default:
        await this.fadeTransition(img, thumbnail, duration, easing);
    }

    thumbnail.style.display = 'none';

    if (mask) {
      await this.removeMaskElement(mask, config.mask?.animation || 'fade', 400);
      this.unregisterNode(owner, mask);
    }

    removeClass(img, 'lazy-pic-loading');
    addClass(img, 'lazy-pic-loaded');
  }

  private async fadeTransition(
    img: HTMLImageElement,
    thumbnail: HTMLElement,
    duration: number,
    easing: (t: number) => number
  ): Promise<void> {
    img.style.opacity = '0';
    img.style.transform = 'scale(1.05)';

    await Promise.all([
      animate(img, {
        opacity: { from: 0, to: 1 },
        scale: { from: 1.05, to: 1 }
      }, { duration, easing }),
      animate(thumbnail, {
        opacity: { from: 1, to: 0 },
        scale: { from: 1, to: 0.95 }
      }, { duration, easing })
    ]);

    img.style.transform = '';
  }

  private async slideTransition(img: HTMLImageElement, thumbnail: HTMLElement, duration: number): Promise<void> {
    img.style.transform = 'translateY(100%) scale(0.9)';
    img.style.opacity = '0';
    img.style.filter = 'blur(2px)';

    await Promise.all([
      animate(img, {
        translateY: { from: 100, to: 0, unit: '%' },
        scale: { from: 0.9, to: 1 },
        opacity: { from: 0, to: 1 }
      }, { duration, easing: easingFunctions.easeOutCubic }),
      animate(thumbnail, {
        opacity: { from: 1, to: 0 },
        translateY: { from: 0, to: -50, unit: '%' },
        scale: { from: 1, to: 1.1 }
      }, { duration })
    ]);

    img.style.transform = '';
    img.style.filter = '';
    thumbnail.style.transform = '';
  }

  private async zoomTransition(img: HTMLImageElement, thumbnail: HTMLElement, duration: number): Promise<void> {
    img.style.transform = 'scale(0.3) rotate(-10deg)';
    img.style.opacity = '0';
    img.style.filter = 'blur(5px)';

    await Promise.all([
      animate(img, {
        scale: { from: 0.3, to: 1 },
        rotate: { from: -10, to: 0, unit: 'deg' },
        opacity: { from: 0, to: 1 }
      }, { duration, easing: easingFunctions.bounce }),
      animate(thumbnail, {
        opacity: { from: 1, to: 0 },
        scale: { from: 1, to: 1.5 },
        rotate: { from: 0, to: 10, unit: 'deg' }
      }, { duration })
    ]);

    img.style.transform = '';
    img.style.filter = '';
    thumbnail.style.transform = '';
  }

  private async blurTransition(img: HTMLImageElement, thumbnail: HTMLElement, duration: number): Promise<void> {
    img.style.filter = 'blur(20px)';
    img.style.opacity = '0';
    img.style.transform = 'scale(1.1)';

    await Promise.all([
      this.createGradualClearEffect(img, duration),
      animate(thumbnail, {
        opacity: { from: 1, to: 0 }
      }, { duration })
    ]);

    img.style.filter = '';
    img.style.transform = '';
  }

  private async createGradualClearEffect(img: HTMLImageElement, duration: number): Promise<void> {
    const steps = 15;
    const stepDuration = duration / steps;

    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const blurValue = 20 * (1 - progress);
      const scaleValue = 1.1 - 0.1 * progress;
      const opacityValue = progress;

      img.style.filter = `blur(${blurValue}px)`;
      img.style.transform = `scale(${scaleValue})`;
      img.style.opacity = opacityValue.toString();

      await new Promise(resolve => window.setTimeout(resolve, stepDuration));
    }
  }

  private async flipTransition(img: HTMLImageElement, thumbnail: HTMLElement, duration: number): Promise<void> {
    const container = img.parentElement;
    if (container) {
      container.style.perspective = '1000px';
    }

    img.style.transform = 'rotateY(180deg)';
    img.style.opacity = '0';

    await Promise.all([
      animate(img, {
        rotateY: { from: 180, to: 0, unit: 'deg' },
        opacity: { from: 0, to: 1 }
      }, { duration, easing: easingFunctions.easeOutCubic }),
      animate(thumbnail, {
        rotateY: { from: 0, to: -180, unit: 'deg' },
        opacity: { from: 1, to: 0 }
      }, { duration, easing: easingFunctions.easeOutCubic })
    ]);

    img.style.transform = '';
    thumbnail.style.transform = '';
  }

  private async revealTransition(img: HTMLImageElement, thumbnail: HTMLElement, duration: number): Promise<void> {
    img.style.clipPath = 'circle(0% at 50% 50%)';
    img.style.opacity = '1';

    await Promise.all([
      animate(thumbnail, {
        opacity: { from: 1, to: 0 },
        scale: { from: 1, to: 0.8 }
      }, { duration })
    ]);

    img.style.transition = `clip-path ${duration}ms ease-out`;
    img.style.clipPath = 'circle(150% at 50% 50%)';

    await new Promise(resolve => window.setTimeout(resolve, duration));

    img.style.clipPath = '';
    img.style.transition = '';
    thumbnail.style.transform = '';
  }

  private async fallbackToDataSrc(img: HTMLImageElement, config: LazyPicConfig): Promise<void> {
    const dataSrc = img.dataset.src;
    if (dataSrc && dataSrc !== img.src) {
      const newImg = await this.preloadImage(dataSrc, img);
      img.src = newImg.src;
    }

    img.style.opacity = '0';
    await animate(img, { opacity: { from: 0, to: 1 } }, {
      duration: config.animationDuration || 1000
    });
  }

  cleanup(element: Element): void {
    super.cleanup(element);

    const img = element as HTMLImageElement;
    this.resetImageStyles(img);

    const thumbnail = this.findThumbnail(img);
    if (thumbnail) {
      thumbnail.style.display = '';
      thumbnail.style.opacity = '1';
      thumbnail.style.transform = '';
      thumbnail.style.filter = '';
    }

    const container = img.parentElement;
    if (container) {
      const masks = container.querySelectorAll('.lazy-pic-mask-overlay');
      masks.forEach(mask => mask.remove());
    }
  }
}
