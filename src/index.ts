/**
 * LazyPic - Elegant Progressive Image Loading
 * @version 0.4.0-beta
 * @author MakotoArai-CN
 * @license Apache-2.0
 */

export { LazyPic } from './core/LazyPic';
export type { LazyPicConfig, LazyPicInstance, LoadStrategy, PlaceholderConfig, QualityConfig } from './types';

// 默认导出
import { LazyPic } from './core/LazyPic';
import type { LazyPicConfig } from './types';

/**
 * 创建 LazyPic 实例的便捷函数
 */
export function createLazyPic(config: LazyPicConfig): LazyPic {
  return new LazyPic(config);
}

/**
 * 兼容性函数 - 支持旧版本 API
 */
export function lazyPic(settings: any): { lazyLoad: () => void } {
  const config: LazyPicConfig = {
    selector: settings.emt,
    animationDuration: settings.animeTime || 1000,
    strategy: settings.tagType === 'data-src' ? 'data-src' : 
             settings.tagType === '2img' ? 'dual-image' : 
             settings.tagType === 'anime' ? 'animation' : 'dual-image',
    enableBlur: settings.Gaussian !== 0 && settings.Gaussian !== false,
    placeholder: {
      width: settings.width,
      height: settings.height,
      backgroundColor: settings.backgroundColor
    }
  };

  const instance = new LazyPic(config);
  
  return {
    lazyLoad: () => instance.init()
  };
}

export default LazyPic;