/**
 * 完全覆盖的动画占位符加载策略 - 修复版本
 */

import { BaseStrategy } from './BaseStrategy';
import { createCompletionEffect } from '../utils/animation';
import { 
  createDotsLoader, 
  createSpinnerLoader, 
  createPulseLoader, 
  createWaveLoader,
  createRippleLoader,
  createBreathingLoader,
  createParticlesLoader
} from '../animations';
import type { LazyPicConfig } from '../types';

export class AnimationStrategy extends BaseStrategy {
  private placeholderElement?: HTMLElement;
  private maskElement?: HTMLElement;
  private originalImgStyles?: {
    position: string;
    zIndex: string;
    opacity: string;
    transform: string;
    transition: string;
  };

  async execute(element: Element, config: LazyPicConfig): Promise<void> {
    const img = element as HTMLImageElement;
    const dataSrc = img.dataset.src || img.src;
    
    if (!dataSrc) {
      throw new Error('data-src attribute or src is required for animation strategy');
    }

    this.notifyLoadStart(element);

    try {
      // 保存原始样式
      this.saveOriginalStyles(img);
      
      // 创建完全覆盖的占位符动画
      this.showFullCoverPlaceholder(img, config);

      // 预加载图片
      const startTime = Date.now();
      const newImg = await this.preloadImage(dataSrc);
      const loadTime = Date.now() - startTime;
      
      // 确保最小显示时间，避免闪烁
      const minDisplayTime = 800;
      if (loadTime < minDisplayTime) {
        await new Promise(resolve => setTimeout(resolve, minDisplayTime - loadTime));
      }
      
      // 更新图片源
      if (img.dataset.src) {
        img.src = newImg.src;
        // 确保图片完全加载后再继续
        await this.waitForImageComplete(img);
      }

      // 优雅地隐藏占位符
      await this.hideFullCoverPlaceholder(config);

      // 恢复原始样式
      this.restoreOriginalStyles(img);

      // 执行完成效果
      if (config.completionEffect?.enabled) {
        await this.executeCompletionEffect(img, config.completionEffect);
      }

      this.notifyLoadComplete(element);
    } catch (error) {
      await this.hideFullCoverPlaceholder(config);
      this.restoreOriginalStyles(img);
      this.handleError(error as Error, element);
    }
  }

  private saveOriginalStyles(img: HTMLImageElement): void {
    this.originalImgStyles = {
      position: img.style.position,
      zIndex: img.style.zIndex,
      opacity: img.style.opacity,
      transform: img.style.transform,
      transition: img.style.transition
    };
  }

  private restoreOriginalStyles(img: HTMLImageElement): void {
    if (this.originalImgStyles) {
      Object.assign(img.style, this.originalImgStyles);
      this.originalImgStyles = undefined;
    }
  }

  private async waitForImageComplete(img: HTMLImageElement): Promise<void> {
    if (img.complete && img.naturalHeight > 0) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Image load timeout'));
      }, 5000);
      
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

  private showFullCoverPlaceholder(img: HTMLImageElement, config: LazyPicConfig): void {
    const placeholder = config.placeholder;
    const container = img.parentElement;
    
    if (!container) return;

    // 确保容器有相对定位
    const containerStyle = getComputedStyle(container);
    if (containerStyle.position === 'static') {
      container.style.position = 'relative';
    }

    // 获取图片样式
    const imgStyle = getComputedStyle(img);
    
    // 创建遮罩层（如果启用）
    if (config.mask?.enabled) {
      this.maskElement = this.createMask(img, config);
    }

    // 创建完全覆盖的占位符容器
    this.placeholderElement = document.createElement('div');
    this.placeholderElement.className = 'lazy-pic-loader-container lazy-pic-animation-placeholder';
    
    // 精确覆盖图片的样式
    Object.assign(this.placeholderElement.style, {
      position: 'absolute',
      top: img.offsetTop + 'px',
      left: img.offsetLeft + 'px',
      width: img.offsetWidth + 'px',
      height: img.offsetHeight + 'px',
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

    // 添加渐变背景（如果指定）
    if (placeholder?.backgroundGradient) {
      this.placeholderElement.style.background = placeholder.backgroundGradient;
    }

    // 创建动画元素容器
    const animationContainer = document.createElement('div');
    animationContainer.style.cssText = `
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      position: relative;
    `;

    // 创建动画元素
    const animationElement = this.createAdvancedAnimationElement(
      placeholder?.animation || 'skeleton',
      placeholder?.color,
      placeholder?.animationSpeed,
      {
        width: img.offsetWidth,
        height: img.offsetHeight
      }
    );
    
    animationContainer.appendChild(animationElement);
    this.placeholderElement.appendChild(animationContainer);

    // 隐藏原图片
    img.style.opacity = '0';
    img.style.transition = 'none';

    // 插入占位符
    container.appendChild(this.placeholderElement);

    // 添加入场动画
    this.placeholderElement.style.opacity = '0';
    this.placeholderElement.style.transform = 'scale(0.98)';
    
    requestAnimationFrame(() => {
      if (this.placeholderElement) {
        this.placeholderElement.style.transition = 'all 0.3s ease';
        this.placeholderElement.style.opacity = '1';
        this.placeholderElement.style.transform = 'scale(1)';
      }
    });
  }

  private createMask(img: HTMLImageElement, config: LazyPicConfig): HTMLElement {
    const mask = document.createElement('div');
    mask.className = 'lazy-pic-mask-overlay';
    
    const maskConfig = config.mask!;
    
    mask.style.cssText = `
      position: absolute;
      top: ${img.offsetTop}px;
      left: ${img.offsetLeft}px;
      width: ${img.offsetWidth}px;
      height: ${img.offsetHeight}px;
      z-index: 99;
      opacity: ${maskConfig.opacity || 0.3};
      border-radius: ${getComputedStyle(img).borderRadius || '0px'};
    `;
    
    switch (maskConfig.type) {
      case 'gradient':
        mask.classList.add('lazy-pic-mask-gradient');
        break;
      case 'pattern':
        mask.classList.add('lazy-pic-mask-pattern');
        break;
      case 'blur':
        mask.style.backdropFilter = 'blur(8px)';
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
        mask.style.backgroundColor = maskConfig.color || 'rgba(0,0,0,0.2)';
    }
    
    const container = img.parentElement;
    if (container) {
      container.appendChild(mask);
    }
    
    return mask;
  }

  private createAdvancedAnimationElement(
    type: string, 
    color = '#007bff', 
    speed = 1,
    dimensions: { width: number; height: number }
  ): HTMLElement {
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

    // 添加一些装饰性的骨架元素 - 根据尺寸自适应
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
      // 中等尺寸的骨架屏
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
    
    // 根据尺寸添加装饰元素
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

  private async hideFullCoverPlaceholder(config: LazyPicConfig): Promise<void> {
    const duration = Math.min(config.animationDuration || 600, 800);
    
    // 创建退场动画序列
    const promises: Promise<void>[] = [];
    
    if (this.placeholderElement) {
      // 主占位符退场动画 - 更平滑的退场
      promises.push(
        new Promise<void>((resolve) => {
          if (!this.placeholderElement) {
            resolve();
            return;
          }

          this.placeholderElement.style.transition = `all ${duration * 0.8}ms cubic-bezier(0.4, 0, 0.2, 1)`;
          this.placeholderElement.style.opacity = '0';
          this.placeholderElement.style.transform = 'scale(0.95)';
          
          setTimeout(() => {
            this.placeholderElement?.remove();
            this.placeholderElement = undefined;
            resolve();
          }, duration * 0.8);
        })
      );
    }
    
    if (this.maskElement) {
      // 遮罩退场动画
      const maskAnimation = config.mask?.animation || 'fade';
      promises.push(this.removeMask(this.maskElement, maskAnimation));
    }
    
    // 同时显示原图
    const container = this.placeholderElement?.parentElement;
    const img = container?.querySelector('img') as HTMLImageElement;
    if (img) {
      setTimeout(() => {
        img.style.transition = `opacity ${duration * 0.6}ms ease`;
        img.style.opacity = '1';
      }, duration * 0.2);
    }
    
    await Promise.all(promises);
  }

  private async removeMask(mask: HTMLElement, animation: string): Promise<void> {
    const duration = 400;
    
    return new Promise<void>((resolve) => {
      mask.style.transition = `all ${duration}ms ease`;
      
      switch (animation) {
        case 'slide':
          mask.style.transform = 'translateX(100%)';
          mask.style.opacity = '0';
          break;
        case 'zoom':
          mask.style.transform = 'scale(0)';
          mask.style.opacity = '0';
          break;
        case 'dissolve':
          this.createDissolveEffect(mask, duration).then(resolve);
          return;
        default:
          mask.style.opacity = '0';
      }
      
      setTimeout(() => {
        mask.remove();
        resolve();
      }, duration);
    });
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
    const { type, duration = 800, intensity = 1.2, color } = effectConfig;
    
    if (type && type !== 'none') {
      await createCompletionEffect(img, type, { duration, intensity, color });
    }
  }

  cleanup(element: Element): void {
    super.cleanup(element);
    
    const img = element as HTMLImageElement;
    
    // 恢复原始样式
    this.restoreOriginalStyles(img);
    
    if (this.placeholderElement) {
      this.placeholderElement.remove();
      this.placeholderElement = undefined;
    }
    
    if (this.maskElement) {
      this.maskElement.remove();
      this.maskElement = undefined;
    }
    
    // 清理容器中的遮罩
    const container = img.parentElement;
    if (container) {
      const masks = container.querySelectorAll('.lazy-pic-mask-overlay, .lazy-pic-animation-placeholder');
      masks.forEach(mask => mask.remove());
    }
  }
}