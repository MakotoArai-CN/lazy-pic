/**
 * 完全覆盖的动画占位符加载策略 - 修复版本
 */

import { BaseStrategy } from './BaseStrategy';
import {
  createDotsLoader,
  createSpinnerLoader,
  createPulseLoader,
  createWaveLoader,
  createRippleLoader,
  createBreathingLoader,
  createParticlesLoader,
  createProgressBarLoader,
  createSkeletonLinesLoader,
  createDiagonalShimmerLoader,
  createOrbitLoader,
  createGridLoader,
  createTypingLoader,
  createBarsLoader,
  createArcLoader,
  createWaveDotsLoader,
  createScannerLoader,
  createRadarLoader,
  createShineLoader,
  createPulseRingLoader,
  createCubeLoader,
  createEqualizerLoader,
  createBlinkLoader,
  createLadderLoader,
  createFlowLoader
} from '../animations';
import type { LazyPicConfig } from '../types';

export class AnimationStrategy extends BaseStrategy {
  private originalStyles = new WeakMap<Element, {
    position: string;
    zIndex: string;
    opacity: string;
    transform: string;
    transition: string;
  }>();

  async execute(element: Element, config: LazyPicConfig): Promise<void> {
    const img = element as HTMLImageElement;
    const dataSrc = img.dataset.src || img.src;
    let placeholderElement: HTMLElement | null = null;
    let maskElement: HTMLElement | null = null;

    if (!dataSrc) {
      throw new Error('data-src attribute or src is required for animation strategy');
    }

    this.notifyLoadStart(element);

    try {
      this.saveOriginalStyles(element, img);

      const placeholderState = this.showFullCoverPlaceholder(element, img, config);
      placeholderElement = placeholderState.placeholder;
      maskElement = placeholderState.mask;

      const startTime = Date.now();
      const newImg = await this.preloadImage(dataSrc, element);
      const loadTime = Date.now() - startTime;

      const minDisplayTime = 800;
      if (loadTime < minDisplayTime) {
        await new Promise(resolve => window.setTimeout(resolve, minDisplayTime - loadTime));
      }

      if (img.dataset.src) {
        img.src = newImg.src;
        await this.waitForImageComplete(img, element);
      }

      await this.hideFullCoverPlaceholder(img, placeholderElement, maskElement, config, element);
      this.restoreOriginalStyles(element, img);
      await this.runCompletionEffect(img, config.completionEffect, { duration: 800, intensity: 1.2 });

      this.notifyLoadComplete(element);
    } catch (error) {
      await this.hideFullCoverPlaceholder(img, placeholderElement, maskElement, config, element);
      this.restoreOriginalStyles(element, img);
      this.handleError(error as Error, element);
    }
  }

  private saveOriginalStyles(owner: Element, img: HTMLImageElement): void {
    this.originalStyles.set(owner, {
      position: img.style.position,
      zIndex: img.style.zIndex,
      opacity: img.style.opacity,
      transform: img.style.transform,
      transition: img.style.transition
    });
  }

  private restoreOriginalStyles(owner: Element, img: HTMLImageElement): void {
    const styles = this.originalStyles.get(owner);
    if (styles) {
      Object.assign(img.style, styles);
      this.originalStyles.delete(owner);
    }
  }

  private waitForImageComplete(img: HTMLImageElement, owner: Element): Promise<void> {
    return this.waitForImageElement(img, 5000, owner);
  }

  private showFullCoverPlaceholder(owner: Element, img: HTMLImageElement, config: LazyPicConfig): {
    placeholder: HTMLElement | null;
    mask: HTMLElement | null;
  } {
    const placeholder = config.placeholder;
    const container = img.parentElement;

    if (!container) {
      return { placeholder: null, mask: null };
    }

    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    const imgStyle = getComputedStyle(img);
    const mask = this.createMaskElement(owner, config, {
      container,
      style: {
        top: `${img.offsetTop}px`,
        left: `${img.offsetLeft}px`,
        width: `${img.offsetWidth}px`,
        height: `${img.offsetHeight}px`,
        zIndex: '99',
        borderRadius: imgStyle.borderRadius || '0px'
      }
    });

    const placeholderElement = document.createElement('div');
    placeholderElement.className = 'lazy-pic-loader-container lazy-pic-animation-placeholder';

    Object.assign(placeholderElement.style, {
      position: 'absolute',
      top: `${img.offsetTop}px`,
      left: `${img.offsetLeft}px`,
      width: `${img.offsetWidth}px`,
      height: `${img.offsetHeight}px`,
      backgroundColor: placeholder?.backgroundColor || 'rgba(248, 249, 250, 0.98)',
      backdropFilter: 'blur(3px)',
      borderRadius: imgStyle.borderRadius || '0px',
      zIndex: '100',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      boxSizing: 'border-box'
    });

    if (placeholder?.backgroundGradient) {
      placeholderElement.style.background = placeholder.backgroundGradient;
    }

    const animationContainer = document.createElement('div');
    animationContainer.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      position: relative;
    `;

    const animationElement = this.createAdvancedAnimationElement(
      placeholder?.animation || 'skeleton',
      placeholder?.color,
      placeholder?.animationSpeed,
      {
        width: img.offsetWidth,
        height: img.offsetHeight
      },
      placeholder?.customContent
    );

    animationContainer.appendChild(animationElement);
    if (placeholder?.showText && placeholder.loadingText) {
      const text = document.createElement('span');
      text.textContent = placeholder.loadingText;
      text.style.cssText = 'position:absolute;bottom:16px;left:50%;transform:translateX(-50%);font-size:14px;color:#666;';
      animationContainer.appendChild(text);
    }
    placeholderElement.appendChild(animationContainer);

    img.style.opacity = '0';
    img.style.transition = 'none';

    container.appendChild(placeholderElement);
    this.registerNode(owner, placeholderElement);

    placeholderElement.style.opacity = '0';
    placeholderElement.style.transform = 'scale(0.98)';

    requestAnimationFrame(() => {
      placeholderElement.style.transition = 'all 0.3s ease';
      placeholderElement.style.opacity = '1';
      placeholderElement.style.transform = 'scale(1)';
    });

    return { placeholder: placeholderElement, mask };
  }

  private createCustomPlaceholder(content: string | HTMLElement): HTMLElement {
    const container = document.createElement('div');
    container.style.cssText = 'display:flex;align-items:center;justify-content:center;width:100%;height:100%;';
    this.appendSafeContent(container, content);
    return container;
  }

  private createAdvancedAnimationElement(
    type: string,
    color = '#007bff',
    speed = 1,
    dimensions: { width: number; height: number },
    customContent?: string | HTMLElement
  ): HTMLElement {
    if (customContent) {
      return this.createCustomPlaceholder(customContent);
    }

    const { width, height } = dimensions;

    switch (type) {
      case 'skeleton':
        return this.createFullSkeleton(width, height);
      case 'shimmer':
        return this.createFullShimmer(width, height);
      case 'spinner':
        return createSpinnerLoader(color, Math.min(width, height, 60));
      case 'pulse':
        return createPulseLoader(color);
      case 'wave':
        return createWaveLoader(color);
      case 'ripple':
        return createRippleLoader(color);
      case 'breathing':
        return createBreathingLoader(color);
      case 'particles':
        return createParticlesLoader(color);
      case 'progress-bar':
        return createProgressBarLoader(color);
      case 'skeleton-lines':
        return createSkeletonLinesLoader(color);
      case 'diagonal-shimmer':
        return createDiagonalShimmerLoader(color);
      case 'orbit':
        return createOrbitLoader(color);
      case 'grid':
        return createGridLoader(color);
      case 'typing':
        return createTypingLoader(color);
      case 'bars':
        return createBarsLoader(color);
      case 'arc':
        return createArcLoader(color);
      case 'wave-dots':
        return createWaveDotsLoader(color);
      case 'scanner':
        return createScannerLoader(color);
      case 'radar':
        return createRadarLoader(color);
      case 'shine':
        return createShineLoader(color);
      case 'pulse-ring':
        return createPulseRingLoader(color);
      case 'cube':
        return createCubeLoader(color);
      case 'equalizer':
        return createEqualizerLoader(color);
      case 'blink':
        return createBlinkLoader(color);
      case 'ladder':
        return createLadderLoader(color);
      case 'flow':
        return createFlowLoader(color);
      case 'dots':
      default:
        return createDotsLoader(color, speed);
    }
  }

  private createFullSkeleton(width: number, height: number): HTMLElement {
    const skeleton = document.createElement('div');
    skeleton.className = 'lazy-pic-full-skeleton';
    skeleton.style.cssText = `
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
      background-size: 200% 100%;
      animation: lazy-pic-shimmer 1.5s infinite;
      position: relative;
      overflow: hidden;
    `;

    if (width > 200 && height > 150) {
      const elements = [
        { width: '60%', height: '20px', top: '20px', left: '20px' },
        { width: '80%', height: '16px', top: '50px', left: '20px' },
        { width: '40%', height: '16px', top: '80px', left: '20px' }
      ];

      elements.forEach(el => {
        const skeletonEl = document.createElement('div');
        skeletonEl.style.cssText = `
          position: absolute;
          top: ${el.top};
          left: ${el.left};
          width: ${el.width};
          height: ${el.height};
          background: rgba(255, 255, 255, 0.3);
          border-radius: 4px;
        `;
        skeleton.appendChild(skeletonEl);
      });
    } else if (width > 100 && height > 100) {
      const centerEl = document.createElement('div');
      centerEl.style.cssText = `
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 80%;
        height: 60%;
        background: rgba(255, 255, 255, 0.2);
        border-radius: 8px;
      `;
      skeleton.appendChild(centerEl);
    }

    return skeleton;
  }

  private createFullShimmer(width: number, height: number): HTMLElement {
    const shimmer = document.createElement('div');
    shimmer.className = 'lazy-pic-full-shimmer';
    shimmer.style.cssText = `
      width: 100%;
      height: 100%;
      background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%);
      background-color: #f6f7f8;
      background-size: 200% 100%;
      animation: lazy-pic-shimmer 2s infinite;
      position: relative;
      overflow: hidden;
    `;

    if (width > 150 && height > 150) {
      const overlay = document.createElement('div');
      overlay.style.cssText = `
        position: absolute;
        top: 20px;
        left: 20px;
        right: 20px;
        bottom: 20px;
        border: 2px solid rgba(255, 255, 255, 0.3);
        border-radius: 4px;
      `;
      shimmer.appendChild(overlay);
    }

    return shimmer;
  }

  private async hideFullCoverPlaceholder(
    img: HTMLImageElement,
    placeholder: HTMLElement | null,
    mask: HTMLElement | null,
    config: LazyPicConfig,
    owner: Element
  ): Promise<void> {
    const duration = Math.min(config.animationDuration || 600, 800);
    const promises: Promise<void>[] = [];

    if (placeholder) {
      promises.push(
        new Promise<void>((resolve) => {
          placeholder.style.transition = `all ${duration * 0.8}ms cubic-bezier(0.4, 0, 0.2, 1)`;
          placeholder.style.opacity = '0';
          placeholder.style.transform = 'scale(0.95)';

          window.setTimeout(() => {
            placeholder.remove();
            this.unregisterNode(owner, placeholder);
            resolve();
          }, duration * 0.8);
        })
      );
    }

    if (mask) {
      promises.push(
        this.removeMaskElement(mask, config.mask?.animation || 'fade', 400).then(() => {
          this.unregisterNode(owner, mask);
        })
      );
    }

    window.setTimeout(() => {
      img.style.transition = `opacity ${duration * 0.6}ms ease`;
      img.style.opacity = '1';
    }, duration * 0.2);

    await Promise.all(promises);
  }

  cleanup(element: Element): void {
    super.cleanup(element);

    const img = element as HTMLImageElement;
    this.restoreOriginalStyles(element, img);

    const container = img.parentElement;
    if (container) {
      const masks = container.querySelectorAll('.lazy-pic-mask-overlay, .lazy-pic-animation-placeholder');
      masks.forEach(mask => mask.remove());
    }
  }
}
