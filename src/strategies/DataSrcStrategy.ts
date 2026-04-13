/**
 * 极致优化的 Data-src 加载策略
 */

import { BaseStrategy } from './BaseStrategy';
import { animate, easingFunctions } from '../utils/animation';
import { addClass, removeClass } from '../utils/dom';
import type { LazyPicConfig } from '../types';

export class DataSrcStrategy extends BaseStrategy {
  async execute(element: Element, config: LazyPicConfig): Promise<void> {
    const img = element as HTMLImageElement;
    const dataSrc = img.dataset.src;

    if (!dataSrc || img.src === dataSrc) {
      return;
    }

    this.notifyLoadStart(element);

    try {
      addClass(img, 'lazy-pic-loading');

      const mask = this.createMaskElement(img, config);

      if (config.enableBlur) {
        addClass(img, 'lazy-pic-blur');
        img.style.filter = `blur(${config.blurIntensity || 8}px)`;
      }

      const newImg = await this.preloadImage(dataSrc, element);
      await this.createUltraElegantTransition(img, newImg, config, mask, element);
      await this.runCompletionEffect(img, config.completionEffect, { duration: 600, intensity: 1 });

      this.notifyLoadComplete(element);
    } catch (error) {
      this.handleError(error as Error, element);
    }
  }

  private async createUltraElegantTransition(
    img: HTMLImageElement,
    newImg: HTMLImageElement,
    config: LazyPicConfig,
    mask: HTMLElement | null,
    owner: Element
  ): Promise<void> {
    const container = img.parentElement;
    if (!container) {
      img.src = newImg.src;
      await this.waitForImageLoad(img, owner);
      this.cleanupImageStyles(img);
      return;
    }

    const originalPosition = container.style.position;
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    const transitionContainer = document.createElement('div');
    transitionContainer.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      overflow: hidden;
      z-index: 1;
      pointer-events: none;
    `;

    const transitionImg = document.createElement('img');
    transitionImg.src = newImg.src;
    transitionImg.alt = img.alt || '';

    const imgStyles = getComputedStyle(img);
    transitionImg.style.cssText = `
      width: 100%;
      height: 100%;
      object-fit: ${imgStyles.objectFit || 'cover'};
      object-position: ${imgStyles.objectPosition || 'center'};
      opacity: 0;
      position: absolute;
      top: 0;
      left: 0;
    `;

    try {
      await this.waitForImageLoad(transitionImg, owner);
    } catch (error) {
      console.warn('Transition image load failed, falling back to direct update:', error);
      img.src = newImg.src;
      this.cleanupImageStyles(img);
      if (mask) {
        await this.removeMaskElement(mask, config.mask?.animation || 'fade');
        this.unregisterNode(owner, mask);
      }
      return;
    }

    transitionContainer.appendChild(transitionImg);
    container.appendChild(transitionContainer);
    this.registerNode(owner, transitionContainer);

    try {
      await this.executeAdvancedTransitionAnimation(img, transitionImg, transitionContainer, config);
      img.src = newImg.src;
      await this.waitForImageLoad(img, owner);
      this.cleanupImageStyles(img);
    } catch (error) {
      console.warn('Transition animation failed:', error);
      img.src = newImg.src;
      this.cleanupImageStyles(img);
    }

    if (mask) {
      await this.removeMaskElement(mask, config.mask?.animation || 'fade');
      this.unregisterNode(owner, mask);
    }

    removeClass(img, 'lazy-pic-blur');
    removeClass(img, 'lazy-pic-loading');
    addClass(img, 'lazy-pic-loaded');

    transitionContainer.remove();
    this.unregisterNode(owner, transitionContainer);

    if (originalPosition) {
      container.style.position = originalPosition;
    } else {
      container.style.position = '';
    }
  }

  private waitForImageLoad(img: HTMLImageElement, owner: Element): Promise<void> {
    return this.waitForImageElement(img, 10000, owner);
  }

  private cleanupImageStyles(img: HTMLImageElement): void {
    this.resetImageStyles(img);
    img.style.opacity = '1';
  }

  private async executeAdvancedTransitionAnimation(
    originalImg: HTMLImageElement,
    transitionImg: HTMLImageElement,
    transitionContainer: HTMLElement,
    config: LazyPicConfig
  ): Promise<void> {
    const duration = config.animationDuration || 1000;
    const easing = easingFunctions[config.easing || 'ease-out'];

    switch (config.animationType) {
      case 'fade':
        await this.createFadeTransition(originalImg, transitionImg, duration, easing);
        break;
      case 'slide':
        await this.createSlideTransition(originalImg, transitionImg, duration);
        break;
      case 'zoom':
      case 'scale':
        await this.createScaleTransition(originalImg, transitionImg, duration);
        break;
      case 'rotate':
        await this.createRotateTransition(originalImg, transitionImg, duration);
        break;
      case 'blur':
        await this.createBlurTransition(originalImg, transitionImg, duration);
        break;
      case 'flip':
        await this.createFlipTransition(originalImg, transitionImg, transitionContainer, duration);
        break;
      case 'reveal':
        await this.createRevealTransition(originalImg, transitionImg, transitionContainer, duration);
        break;
      case 'spiral':
        await this.createSpiralTransition(originalImg, transitionImg, duration);
        break;
      default:
        await this.createFadeTransition(originalImg, transitionImg, duration, easing);
    }
  }

  private async createFadeTransition(
    originalImg: HTMLImageElement,
    transitionImg: HTMLImageElement,
    duration: number,
    easing: (t: number) => number
  ): Promise<void> {
    await Promise.all([
      animate(transitionImg, {
        opacity: { from: 0, to: 1 },
        scale: { from: 1.02, to: 1 }
      }, { duration, easing }),
      animate(originalImg, {
        opacity: { from: parseFloat(originalImg.style.opacity) || 1, to: 0 },
        scale: { from: 1, to: 0.98 }
      }, { duration, easing })
    ]);
  }

  private async createSlideTransition(
    originalImg: HTMLImageElement,
    transitionImg: HTMLImageElement,
    duration: number
  ): Promise<void> {
    transitionImg.style.transform = 'translateY(50px) scale(0.95)';
    transitionImg.style.filter = 'blur(2px)';

    await Promise.all([
      animate(transitionImg, {
        opacity: { from: 0, to: 1 },
        translateY: { from: 50, to: 0, unit: 'px' },
        scale: { from: 0.95, to: 1 }
      }, { duration, easing: easingFunctions.easeOutCubic }),
      animate(originalImg, {
        opacity: { from: parseFloat(originalImg.style.opacity) || 1, to: 0 },
        translateY: { from: 0, to: -30, unit: 'px' },
        scale: { from: 1, to: 1.05 }
      }, { duration, easing: easingFunctions.easeOutCubic })
    ]);

    transitionImg.style.filter = '';
  }

  private async createScaleTransition(
    originalImg: HTMLImageElement,
    transitionImg: HTMLImageElement,
    duration: number
  ): Promise<void> {
    transitionImg.style.transform = 'scale(0.7) rotate(-5deg)';
    transitionImg.style.filter = 'blur(3px)';

    await Promise.all([
      animate(transitionImg, {
        opacity: { from: 0, to: 1 },
        scale: { from: 0.7, to: 1 },
        rotate: { from: -5, to: 0, unit: 'deg' }
      }, { duration, easing: easingFunctions.bounce }),
      animate(originalImg, {
        opacity: { from: parseFloat(originalImg.style.opacity) || 1, to: 0 },
        scale: { from: 1, to: 1.3 },
        rotate: { from: 0, to: 5, unit: 'deg' }
      }, { duration })
    ]);

    transitionImg.style.filter = '';
  }

  private async createRotateTransition(
    originalImg: HTMLImageElement,
    transitionImg: HTMLImageElement,
    duration: number
  ): Promise<void> {
    transitionImg.style.transform = 'rotateY(90deg) scale(0.8)';

    await Promise.all([
      animate(transitionImg, {
        opacity: { from: 0, to: 1 },
        rotateY: { from: 90, to: 0, unit: 'deg' },
        scale: { from: 0.8, to: 1 }
      }, { duration, easing: easingFunctions.elastic }),
      animate(originalImg, {
        opacity: { from: parseFloat(originalImg.style.opacity) || 1, to: 0 },
        rotateY: { from: 0, to: -90, unit: 'deg' }
      }, { duration })
    ]);
  }

  private async createBlurTransition(
    originalImg: HTMLImageElement,
    transitionImg: HTMLImageElement,
    duration: number
  ): Promise<void> {
    transitionImg.style.filter = 'blur(15px) brightness(1.2)';

    await Promise.all([
      animate(transitionImg, {
        opacity: { from: 0, to: 1 }
      }, { duration }),
      animate(originalImg, {
        opacity: { from: parseFloat(originalImg.style.opacity) || 1, to: 0 }
      }, { duration })
    ]);

    const clearSteps = 10;
    for (let i = 0; i < clearSteps; i++) {
      const blurValue = 15 * (1 - (i + 1) / clearSteps);
      const brightnessValue = 1.2 - 0.2 * ((i + 1) / clearSteps);
      transitionImg.style.filter = `blur(${blurValue}px) brightness(${brightnessValue})`;
      await new Promise(resolve => window.setTimeout(resolve, duration / clearSteps));
    }

    transitionImg.style.filter = '';
  }

  private async createFlipTransition(
    originalImg: HTMLImageElement,
    transitionImg: HTMLImageElement,
    container: HTMLElement,
    duration: number
  ): Promise<void> {
    container.style.perspective = '1000px';
    container.style.transformStyle = 'preserve-3d';
    transitionImg.style.transform = 'rotateX(-90deg)';
    transitionImg.style.transformOrigin = 'center bottom';

    await Promise.all([
      animate(transitionImg, {
        opacity: { from: 0, to: 1 },
        rotateX: { from: -90, to: 0, unit: 'deg' }
      }, { duration, easing: easingFunctions.easeOutCubic }),
      animate(originalImg, {
        opacity: { from: parseFloat(originalImg.style.opacity) || 1, to: 0 },
        rotateX: { from: 0, to: 90, unit: 'deg' }
      }, { duration, easing: easingFunctions.easeOutCubic })
    ]);
  }

  private async createRevealTransition(
    originalImg: HTMLImageElement,
    transitionImg: HTMLImageElement,
    container: HTMLElement,
    duration: number
  ): Promise<void> {
    const revealMask = document.createElement('div');
    revealMask.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, transparent 0%, rgba(255,255,255,1) 50%, transparent 100%);
      transform: translateX(-100%);
      z-index: 2;
      pointer-events: none;
    `;

    container.appendChild(revealMask);
    transitionImg.style.opacity = '1';

    await animate(originalImg, {
      opacity: { from: parseFloat(originalImg.style.opacity) || 1, to: 0 }
    }, { duration: duration * 0.3 });

    await animate(revealMask, {
      translateX: { from: -100, to: 100, unit: '%' }
    }, { duration: duration * 1.5, easing: easingFunctions.easeOutCubic });

    revealMask.remove();
  }

  private async createSpiralTransition(
    originalImg: HTMLImageElement,
    transitionImg: HTMLImageElement,
    duration: number
  ): Promise<void> {
    transitionImg.style.clipPath = 'polygon(50% 50%, 50% 0%, 50% 0%, 50% 0%)';
    transitionImg.style.opacity = '1';

    await animate(originalImg, {
      opacity: { from: parseFloat(originalImg.style.opacity) || 1, to: 0 }
    }, { duration: duration * 0.3 });

    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const angle = progress * 720;
      const radius = progress * 50;
      const points: string[] = [];

      for (let j = 0; j <= Math.ceil(angle / 10); j++) {
        const currentAngle = (j * 10) * Math.PI / 180;
        const currentRadius = Math.min(j / Math.max(angle / 10, 1) * radius, 50);
        const x = 50 + currentRadius * Math.cos(currentAngle);
        const y = 50 + currentRadius * Math.sin(currentAngle);
        points.push(`${x}% ${y}%`);
      }

      if (points.length > 2) {
        transitionImg.style.clipPath = `polygon(${points.join(', ')})`;
      }

      await new Promise(resolve => window.setTimeout(resolve, duration / steps));
    }

    transitionImg.style.clipPath = '';
  }

  cleanup(element: Element): void {
    super.cleanup(element);

    const img = element as HTMLImageElement;
    this.cleanupImageStyles(img);
    removeClass(img, 'lazy-pic-blur');
    removeClass(img, 'lazy-pic-unblur');
    removeClass(img, 'lazy-pic-loading');
    removeClass(img, 'lazy-pic-loaded');

    const container = img.parentElement;
    if (container) {
      const masks = container.querySelectorAll('.lazy-pic-mask-overlay');
      masks.forEach(mask => mask.remove());

      const transitionContainers = container.querySelectorAll('div[style*="position: absolute"][style*="z-index: 1"]');
      transitionContainers.forEach(tc => {
        const transitionElement = tc as HTMLElement;
        if (transitionElement.style.pointerEvents === 'none') {
          transitionElement.remove();
        }
      });

      if (container.style.position === 'relative' && !container.getAttribute('data-original-position')) {
        container.style.position = '';
      }
    }
  }
}
