export interface LazyPicConfig {
  /** 目标元素的选择器 */
  selector: string;
  /** 动画持续时间（毫秒） */
  animationDuration?: number;
  /** 懒加载策略类型 */
  strategy?: 'dual-image' | 'data-src' | 'animation';
  /** @deprecated `progressive` 和 `mosaic` 目前未实现，请改用已有策略 */
  legacyStrategy?: 'progressive' | 'mosaic';
  /** 是否启用高斯模糊效果 */
  enableBlur?: boolean;
  /** 模糊强度 */
  blurIntensity?: number;
  /** 动画类型 */
  animationType?: 'fade' | 'slide' | 'zoom' | 'blur' | 'scale' | 'rotate' | 'flip' | 'reveal' | 'spiral';
  /** 缓动函数类型 */
  easing?: 'linear' | 'ease' | 'ease-in' | 'ease-out' | 'ease-in-out' | 'bounce' | 'elastic';
  /** 根边距 */
  rootMargin?: string;
  /** 阈值 */
  threshold?: number | number[];
  /** 占位符配置 */
  placeholder?: PlaceholderConfig;
  /** @deprecated 质量优化配置当前未在运行时生效 */
  quality?: QualityConfig;
  /** 加载完成效果配置 */
  completionEffect?: CompletionEffectConfig;
  /** 占位遮罩配置 */
  mask?: MaskConfig;
  /** 错误处理回调 */
  onError?: (error: Error, element: Element) => void;
  /** 加载完成回调 */
  onLoad?: (element: Element) => void;
  /** 开始加载回调 */
  onStartLoad?: (element: Element) => void;
  /** @deprecated 加载进度回调当前未在运行时触发 */
  onProgress?: (progress: number, element: Element) => void;
}

export interface PlaceholderConfig {
  /** 占位符宽度 */
  width?: string;
  /** 占位符高度 */
  height?: string;
  /** 自定义占位符内容（字符串会被当作纯文本处理） */
  customContent?: string | HTMLElement;
  /** 显示加载文本 */
  showText?: boolean;
  /** 加载文本内容 */
  loadingText?: string;
  /** 背景颜色 */
  backgroundColor?: string;
  /** 背景渐变 */
  backgroundGradient?: string;
  /** 动画类型 */
  animation?: 'dots' | 'spinner' | 'pulse' | 'wave' | 'skeleton' | 'shimmer' | 'ripple' | 'breathing' | 'particles' | 'progress-bar' | 'skeleton-lines' | 'diagonal-shimmer' | 'orbit' | 'grid' | 'typing' | 'bars' | 'arc' | 'wave-dots' | 'scanner' | 'radar' | 'shine' | 'pulse-ring' | 'cube' | 'equalizer' | 'blink' | 'ladder' | 'flow';
  /** 动画颜色 */
  color?: string;
  /** 动画速度 */
  animationSpeed?: number;
  /** 完全覆盖原图 */
  fullCover?: boolean;
}

export interface CompletionEffectConfig {
  /** 是否启用完成效果 */
  enabled?: boolean;
  /** 效果类型 */
  type?: 'pulse' | 'glow' | 'bounce' | 'flash' | 'ripple' | 'sparkle' | 'rainbow' | 'none';
  /** 效果持续时间 */
  duration?: number;
  /** 效果强度 */
  intensity?: number;
  /** 自定义效果颜色 */
  color?: string;
}

export interface MaskConfig {
  /** 是否启用遮罩 */
  enabled?: boolean;
  /** 遮罩类型 */
  type?: 'overlay' | 'gradient' | 'pattern' | 'blur' | 'custom';
  /** 遮罩颜色 */
  color?: string;
  /** 遮罩透明度 */
  opacity?: number;
  /** 遮罩动画 */
  animation?: 'fade' | 'slide' | 'zoom' | 'dissolve';
  /** 自定义遮罩内容 */
  customContent?: string | HTMLElement;
}

export interface QualityConfig {
  /** 启用渐进式JPEG */
  progressive?: boolean;
  /** 图片格式优化 */
  format?: 'auto' | 'webp' | 'avif' | 'jpeg' | 'png';
  /** 响应式图片 */
  responsive?: boolean;
  /** 预加载策略 */
  preload?: 'none' | 'metadata' | 'auto';
}

export interface LazyPicInstance {
  /** 初始化懒加载 */
  init(): void;
  /** 销毁实例 */
  destroy(): void;
  /** 更新配置 */
  updateConfig(config: Partial<LazyPicConfig>): void;
  /** 手动触发加载 */
  loadImage(element: Element): Promise<void>;
  /** 重新扫描元素 */
  refresh(): void;
  /** 获取加载状态 */
  getStatus(): 'idle' | 'loading' | 'loaded' | 'error';
}

export interface LoadStrategy {
  /** 执行加载策略 */
  execute(element: Element, config: LazyPicConfig): Promise<void>;
  /** 清理资源 */
  cleanup(element: Element): void;
}