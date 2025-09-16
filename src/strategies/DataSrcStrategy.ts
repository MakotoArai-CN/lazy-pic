/**
 * 极致优化的 Data-src 加载策略 
 */

import { BaseStrategy } from './BaseStrategy';
import { animate, easingFunctions, createCompletionEffect } from '../utils/animation';
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
      // 添加加载状态样式
      addClass(img, 'lazy-pic-loading');
      
      // 创建遮罩（如果启用）
      const mask = this.createMask(img, config);
      
      // 添加模糊效果（如果启用）
      if (config.enableBlur) {
        addClass(img, 'lazy-pic-blur');
        img.style.filter = `blur(${config.blurIntensity || 8}px)`;
      }

      // 预加载新图片
      const newImg = await this.preloadImage(dataSrc);
      
      // 创建极致优雅的过渡
      await this.createUltraElegantTransition(img, newImg, config, mask);

      // 执行完成效果
      if (config.completionEffect?.enabled) {
        await this.executeCompletionEffect(img, config.completionEffect);
      }

      this.notifyLoadComplete(element);
    } catch (error) {
      this.handleError(error as Error, element);
    }
  }

  private createMask(img: HTMLImageElement, config: LazyPicConfig): HTMLElement | null {
    if (!config.mask?.enabled) return null;
    
    const mask = document.createElement('div');
    mask.className = 'lazy-pic-mask-overlay';
    
    const maskConfig = config.mask;
    
    switch (maskConfig.type) {
      case 'gradient':
        mask.classList.add('lazy-pic-mask-gradient');
        break;
      case 'pattern':
        mask.classList.add('lazy-pic-mask-pattern');
        break;
      case 'blur':
        mask.style.backdropFilter = 'blur(5px)';
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
    
    mask.style.opacity = (maskConfig.opacity || 0.5).toString();
    
    const container = img.parentElement;
    if (container) {
      if (getComputedStyle(container).position === 'static') {
        container.style.position = 'relative';
      }
      container.appendChild(mask);
    }
    
    return mask;
  }

  private async createUltraElegantTransition(
    img: HTMLImageElement, 
    newImg: HTMLImageElement, 
    config: LazyPicConfig,
    mask: HTMLElement | null
  ): Promise<void> {
    const container = img.parentElement;
    if (!container) {
      // 如果没有容器，直接更新图片
      img.src = newImg.src;
      await this.waitForImageLoad(img);
      this.cleanupImageStyles(img);
      return;
    }

    // 设置容器为相对定位
    const originalPosition = container.style.position;
    if (getComputedStyle(container).position === 'static') {
      container.style.position = 'relative';
    }

    // 创建高质量过渡容器
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

    // 创建新图片元素用于过渡 - 修复：正确创建新的img元素
    const transitionImg = document.createElement('img');
    transitionImg.src = newImg.src;
    transitionImg.alt = img.alt || '';
    
    // 复制原图片的重要样式
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

    // 确保过渡图片加载完成
    try {
      await this.waitForImageLoad(transitionImg);
    } catch (error) {
      // 如果过渡图片加载失败，直接更新原图片
      console.warn('Transition image load failed, falling back to direct update:', error);
      img.src = newImg.src;
      this.cleanupImageStyles(img);
      if (mask) {
        await this.removeMask(mask, config.mask?.animation || 'fade');
      }
      return;
    }

    transitionContainer.appendChild(transitionImg);
    container.appendChild(transitionContainer);

    try {
      // 根据动画类型执行不同的过渡效果
      await this.executeAdvancedTransitionAnimation(img, transitionImg, transitionContainer, config);

      // 更新原图片源
      img.src = newImg.src;
      
      // 确保原图片加载完成
      await this.waitForImageLoad(img);
      
      // 修复：确保原图片完全显示
      this.cleanupImageStyles(img);
      
    } catch (error) {
      console.warn('Transition animation failed:', error);
      // 即使动画失败，也要更新图片
      img.src = newImg.src;
      this.cleanupImageStyles(img);
    }
    
    // 清理遮罩
    if (mask) {
      await this.removeMask(mask, config.mask?.animation || 'fade');
    }
    
    // 清理样式和状态
    removeClass(img, 'lazy-pic-blur');
    removeClass(img, 'lazy-pic-loading');
    addClass(img, 'lazy-pic-loaded');
    
    // 移除过渡容器
    transitionContainer.remove();
    
    // 恢复容器定位
    if (originalPosition) {
      container.style.position = originalPosition;
    } else {
      // 如果原来没有设置position，恢复为static
      container.style.position = '';
    }
  }

  private async waitForImageLoad(img: HTMLImageElement): Promise<void> {
    if (img.complete && img.naturalHeight > 0) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 10000); // 10秒超时
      
      const cleanup = () => {
        clearTimeout(timeout);
        img.onload = null;
        img.onerror = null;
      };
      
      img.onload = () => {
        cleanup();
        resolve();
      };
      
      img.onerror = () => {
        cleanup();
        reject(new Error('Image load failed'));
      };
      
      // 如果图片已经开始加载但还没完成，等待完成
      if (img.src && !img.complete) {
        // 图片正在加载中，等待onload事件
        return;
      }
      
      // 如果src为空或其他异常情况
      if (!img.src) {
        cleanup();
        reject(new Error('Image src is empty'));
      }
    });
  }

  private cleanupImageStyles(img: HTMLImageElement): void {
    // 确保图片完全显示
    img.style.opacity = '1';
    img.style.transform = '';
    img.style.filter = '';
    img.style.clipPath = '';
    img.style.transition = '';
    img.style.position = '';
    img.style.zIndex = '';
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
        await this.createSpiralTransition(originalImg, transitionImg, transitionContainer, duration);
        break;
        
      default:
        await this.createFadeTransition(originalImg, transitionImg, duration, easing);
    }
  }

  private async createFadeTransition(
    originalImg: HTMLImageElement,
    transitionImg: HTMLImageElement,
    duration: number,
    easing: any
  ): Promise<void> {
    // 增强的淡入淡出效果，添加轻微的缩放
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
    // 增强的滑动效果，添加深度感
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
    // 增强的缩放效果，添加旋转和模糊
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
    // 3D旋转效果
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
    // 高级模糊过渡，添加亮度变化
    transitionImg.style.filter = 'blur(15px) brightness(1.2)';
    
    await Promise.all([
      animate(transitionImg, { 
        opacity: { from: 0, to: 1 }
      }, { duration }),
      animate(originalImg, {
        opacity: { from: parseFloat(originalImg.style.opacity) || 1, to: 0 }
      }, { duration })
    ]);
    
    // 逐步清晰化
    const clearSteps = 10;
    for (let i = 0; i < clearSteps; i++) {
      const blurValue = 15 * (1 - (i + 1) / clearSteps);
      const brightnessValue = 1.2 - 0.2 * ((i + 1) / clearSteps);
      transitionImg.style.filter = `blur(${blurValue}px) brightness(${brightnessValue})`;
      await new Promise(resolve => setTimeout(resolve, duration / clearSteps));
    }
    
    transitionImg.style.filter = '';
  }

  private async createFlipTransition(
    originalImg: HTMLImageElement,
    transitionImg: HTMLImageElement,
    container: HTMLElement,
    duration: number
  ): Promise<void> {
    // 3D翻转效果
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
    // 创建遮罩揭示效果
    const mask = document.createElement('div');
    mask.style.cssText = `
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
    
    container.appendChild(mask);
    transitionImg.style.opacity = '1';
    
    // 先淡出原图
    await animate(originalImg, {
      opacity: { from: parseFloat(originalImg.style.opacity) || 1, to: 0 }
    }, { duration: duration * 0.3 });
    
    await animate(mask, {
      translateX: { from: -100, to: 100, unit: '%' }
    }, { duration: duration * 1.5, easing: easingFunctions.easeOutCubic });
    
    mask.remove();
  }

  private async createSpiralTransition(
    originalImg: HTMLImageElement,
    transitionImg: HTMLImageElement,
    _container: HTMLElement,
    duration: number
  ): Promise<void> {
    // 螺旋展开效果
    transitionImg.style.clipPath = 'polygon(50% 50%, 50% 0%, 50% 0%, 50% 0%)';
    transitionImg.style.opacity = '1';
    
    // 先淡出原图
    await animate(originalImg, {
      opacity: { from: parseFloat(originalImg.style.opacity) || 1, to: 0 }
    }, { duration: duration * 0.3 });
    
    const steps = 20;
    for (let i = 0; i <= steps; i++) {
      const progress = i / steps;
      const angle = progress * 360 * 2; // 两圈螺旋
      const radius = progress * 50; // 从中心扩展到边缘
      
      // 计算螺旋点
      const points = [];
      for (let j = 0; j <= Math.ceil(angle / 10); j++) {
        const currentAngle = (j * 10) * Math.PI / 180;
        const currentRadius = Math.min(j / (angle / 10) * radius, 50);
        const x = 50 + currentRadius * Math.cos(currentAngle);
        const y = 50 + currentRadius * Math.sin(currentAngle);
        points.push(`${x}% ${y}%`);
      }
      
      if (points.length > 2) {
        transitionImg.style.clipPath = `polygon(${points.join(', ')})`;
      }
      
      await new Promise(resolve => setTimeout(resolve, duration / steps));
    }
    
    transitionImg.style.clipPath = '';
  }

  private async removeMask(mask: HTMLElement, animation: string): Promise<void> {
    switch (animation) {
      case 'slide':
        await animate(mask, {
          translateX: { from: 0, to: 100, unit: '%' },
          opacity: { from: 1, to: 0 }
        }, { duration: 300 });
        break;
      case 'zoom':
        await animate(mask, {
          scale: { from: 1, to: 0 },
          opacity: { from: 1, to: 0 }
        }, { duration: 300 });
        break;
      case 'dissolve':
        // 创建溶解效果
        for (let i = 0; i < 10; i++) {
          mask.style.opacity = (1 - (i + 1) / 10).toString();
          mask.style.filter = `blur(${i * 2}px)`;
          await new Promise(resolve => setTimeout(resolve, 30));
        }
        break;
      default:
        await animate(mask, { opacity: { from: 1, to: 0 } }, { duration: 300 });
    }
    
    mask.remove();
  }

  private async executeCompletionEffect(img: HTMLImageElement, effectConfig: any): Promise<void> {
    const { type, duration = 600, intensity = 1, color } = effectConfig;
    
    if (type && type !== 'none') {
      await createCompletionEffect(img, type, { duration, intensity, color });
    }
  }

  cleanup(element: Element): void {
    super.cleanup(element);
    
    const img = element as HTMLImageElement;
    
    // 完全恢复图片样式
    this.cleanupImageStyles(img);
    removeClass(img, 'lazy-pic-blur');
    removeClass(img, 'lazy-pic-unblur');
    removeClass(img, 'lazy-pic-loading');
    removeClass(img, 'lazy-pic-loaded');
    
    // 清理遮罩和过渡容器
    const container = img.parentElement;
    if (container) {
      // 清理遮罩
      const masks = container.querySelectorAll('.lazy-pic-mask-overlay');
      masks.forEach(mask => mask.remove());
      
      // 清理可能残留的过渡容器 - 修复类型错误
      const transitionContainers = container.querySelectorAll('div[style*="position: absolute"][style*="z-index: 1"]');
      transitionContainers.forEach(tc => {
        const element = tc as HTMLElement;
        if (element.style.pointerEvents === 'none') {
          element.remove();
        }
      });
      
      // 恢复容器样式（如果是我们设置的）
      if (container.style.position === 'relative' && !container.getAttribute('data-original-position')) {
        container.style.position = '';
      }
    }
  }
}