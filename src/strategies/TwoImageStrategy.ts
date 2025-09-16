/**
 * 支持遮罩的优化双图片加载策略
 */

import { BaseStrategy } from './BaseStrategy';
import { animate, easingFunctions, createCompletionEffect } from '../utils/animation';
import { addClass, removeClass } from '../utils/dom';
import type { LazyPicConfig } from '../types';

export class TwoImageStrategy extends BaseStrategy {
  private maskElement?: HTMLElement;

  async execute(element: Element, config: LazyPicConfig): Promise<void> {
    const img = element as HTMLImageElement;
    
    if (!img.src) {
      return;
    }

    this.notifyLoadStart(element);

    try {
      // 查找缩略图（前一个或后一个兄弟元素）
      const thumbnail = this.findThumbnail(img);
      
      if (!thumbnail) {
        // 如果没有缩略图，使用替代策略
        await this.fallbackToDataSrc(img, config);
        return;
      }

      addClass(img, 'lazy-pic-loading');
      
      // 创建遮罩（如果启用）
      if (config.mask?.enabled) {
        this.maskElement = this.createMask(img, config);
      }
      
      // 等待原图加载完成
      await this.waitForImageLoad(img);
      
      // 执行优雅的过渡动画
      await this.executeElegantTransition(img, thumbnail, config);

      // 执行完成效果
      if (config.completionEffect?.enabled) {
        await this.executeCompletionEffect(img, config.completionEffect);
      }

      this.notifyLoadComplete(element);
    } catch (error) {
      this.handleError(error as Error, element);
    }
  }

  private createMask(img: HTMLImageElement, config: LazyPicConfig): HTMLElement {
    const mask = document.createElement('div');
    mask.className = 'lazy-pic-mask-overlay';
    
    const maskConfig = config.mask!;
    
    mask.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 5;
      opacity: ${maskConfig.opacity || 0.4};
      transition: all 0.3s ease;
    `;
    
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
        if (maskConfig.customContent) {
          if (typeof maskConfig.customContent === 'string') {
            mask.innerHTML = maskConfig.customContent;
          } else {
            mask.appendChild(maskConfig.customContent);
          }
        }
        break;
      default:
        mask.style.backgroundColor = maskConfig.color || 'rgba(0,0,0,0.3)';
    }
    
    const container = img.parentElement;
    if (container) {
      if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
      }
      container.appendChild(mask);
    }
    
    return mask;
  }

  private findThumbnail(img: HTMLImageElement): HTMLElement | null {
    // 查找前一个兄弟元素
    let sibling = img.previousElementSibling;
    if (sibling && sibling.tagName === 'IMG') {
      return sibling as HTMLElement;
    }
    
    // 查找后一个兄弟元素
    sibling = img.nextElementSibling;
    if (sibling && sibling.tagName === 'IMG') {
      return sibling as HTMLElement;
    }
    
    // 查找父元素中的其他图片
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

  private async waitForImageLoad(img: HTMLImageElement): Promise<void> {
    if (img.complete && img.naturalHeight > 0) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 15000); // 15秒超时
      
      img.onload = () => {
        clearTimeout(timeout);
        resolve();
      };
      
      img.onerror = () => {
        clearTimeout(timeout);
        reject(new Error('Image load failed'));
      };
    });
  }

  private async executeElegantTransition(
    img: HTMLImageElement,
    thumbnail: HTMLElement,
    config: LazyPicConfig
  ): Promise<void> {
    const duration = config.animationDuration || 1000;
    const easing = easingFunctions[config.easing || 'ease-out'];
    
    // 确保主图片在缩略图上方
    img.style.position = 'relative';
    img.style.zIndex = '3';
    
    // 根据动画类型执行不同的过渡
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
    
    // 隐藏缩略图
    thumbnail.style.display = 'none';
    
    // 移除遮罩
    if (this.maskElement) {
      await this.removeMask(this.maskElement, config.mask?.animation || 'fade');
    }
    
    // 清理样式
    removeClass(img, 'lazy-pic-loading');
    addClass(img, 'lazy-pic-loaded');
  }

  private async fadeTransition(
    img: HTMLImageElement, 
    thumbnail: HTMLElement, 
    duration: number, 
    easing: any
  ): Promise<void> {
    // 增强淡入效果，添加轻微缩放
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
    // 主图从下方滑入，添加深度效果
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
    // 主图缩放进入，添加旋转效果
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
    // 高级模糊过渡
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
      
      await new Promise(resolve => setTimeout(resolve, stepDuration));
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
    // 圆形展开效果
    img.style.clipPath = 'circle(0% at 50% 50%)';
    img.style.opacity = '1';
    
    await Promise.all([
      animate(img, {
        // 使用 CSS transition 而不是 animate 来处理 clip-path
      }, { duration: 0 }),
      animate(thumbnail, {
        opacity: { from: 1, to: 0 },
        scale: { from: 1, to: 0.8 }
      }, { duration })
    ]);
    
    // 使用 CSS transition 来处理 clip-path 动画
    img.style.transition = `clip-path ${duration}ms ease-out`;
    img.style.clipPath = 'circle(150% at 50% 50%)';
    
    await new Promise(resolve => setTimeout(resolve, duration));
    
    img.style.clipPath = '';
    img.style.transition = '';
    thumbnail.style.transform = '';
  }

  private async removeMask(mask: HTMLElement, animation: string): Promise<void> {
    const duration = 400;
    
    switch (animation) {
      case 'slide':
        await animate(mask, {
          translateX: { from: 0, to: -100, unit: '%' },
          opacity: { from: 1, to: 0 }
        }, { duration });
        break;
      case 'zoom':
        await animate(mask, {
          scale: { from: 1, to: 0 },
          opacity: { from: 1, to: 0 }
        }, { duration });
        break;
      case 'dissolve':
        await this.createDissolveEffect(mask, duration);
        break;
      default:
        await animate(mask, { 
          opacity: { from: 1, to: 0 }
        }, { duration });
    }
    
    mask.remove();
    this.maskElement = undefined;
  }

  private async createDissolveEffect(mask: HTMLElement, duration: number): Promise<void> {
    const steps = 10;
    for (let i = 0; i < steps; i++) {
      mask.style.opacity = (1 - (i + 1) / steps).toString();
      mask.style.filter = `blur(${i * 3}px)`;
      await new Promise(resolve => setTimeout(resolve, duration / steps));
    }
  }

  private async executeCompletionEffect(img: HTMLImageElement, effectConfig: any): Promise<void> {
    const { type, duration = 600, intensity = 1, color } = effectConfig;
    
    if (type && type !== 'none') {
      await createCompletionEffect(img, type, { duration, intensity, color });
    }
  }

  private async fallbackToDataSrc(img: HTMLImageElement, config: LazyPicConfig): Promise<void> {
    // 如果没有缩略图，回退到 data-src 策略
    const dataSrc = img.dataset.src;
    if (dataSrc && dataSrc !== img.src) {
      const newImg = await this.preloadImage(dataSrc);
      img.src = newImg.src;
    }
    
    // 简单的淡入效果
    img.style.opacity = '0';
    await animate(img, { opacity: { from: 0, to: 1 } }, { 
      duration: config.animationDuration || 1000 
    });
  }

  cleanup(element: Element): void {
    super.cleanup(element);
    
    const img = element as HTMLImageElement;
    img.style.position = '';
    img.style.zIndex = '';
    img.style.opacity = '';
    img.style.transform = '';
    img.style.filter = '';
    img.style.clipPath = '';
    img.style.transition = '';
    
    // 清理遮罩
    if (this.maskElement) {
      this.maskElement.remove();
      this.maskElement = undefined;
    }
    
    // 恢复缩略图显示
    const thumbnail = this.findThumbnail(img);
    if (thumbnail) {
      thumbnail.style.display = '';
      thumbnail.style.opacity = '1';
      thumbnail.style.transform = '';
      thumbnail.style.filter = '';
    }
    
    // 清理容器中的遮罩
    const container = img.parentElement;
    if (container) {
      const masks = container.querySelectorAll('.lazy-pic-mask-overlay');
      masks.forEach(mask => mask.remove());
    }
  }
}