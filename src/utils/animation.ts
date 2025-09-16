/**
 * 优化的动画工具函数 - 完整版本
 */

export type EasingFunction = (t: number) => number;

export const easingFunctions: Record<string, EasingFunction> = {
  linear: (t: number) => t,
  ease: (t: number) => 0.25 * (1 - Math.cos(t * Math.PI)),
  'ease-in': (t: number) => t * t,
  'ease-out': (t: number) => t * (2 - t),
  'ease-in-out': (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInQuad: (t: number) => t * t,
  easeOutQuad: (t: number) => t * (2 - t),
  easeInOutQuad: (t: number) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
  easeInCubic: (t: number) => t * t * t,
  easeOutCubic: (t: number) => (--t) * t * t + 1,
  easeInOutCubic: (t: number) => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1,
  easeInQuart: (t: number) => t * t * t * t,
  easeOutQuart: (t: number) => 1 - (--t) * t * t * t,
  easeInOutQuart: (t: number) => t < 0.5 ? 8 * t * t * t * t : 1 - 8 * (--t) * t * t * t,
  easeInQuint: (t: number) => t * t * t * t * t,
  easeOutQuint: (t: number) => 1 + (--t) * t * t * t * t,
  easeInOutQuint: (t: number) => t < 0.5 ? 16 * t * t * t * t * t : 1 + 16 * (--t) * t * t * t * t,
  easeInSine: (t: number) => 1 - Math.cos(t * Math.PI / 2),
  easeOutSine: (t: number) => Math.sin(t * Math.PI / 2),
  easeInOutSine: (t: number) => -(Math.cos(Math.PI * t) - 1) / 2,
  easeInExpo: (t: number) => t === 0 ? 0 : Math.pow(2, 10 * (t - 1)),
  easeOutExpo: (t: number) => t === 1 ? 1 : 1 - Math.pow(2, -10 * t),
  easeInOutExpo: (t: number) => {
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) return Math.pow(2, 20 * t - 10) / 2;
    return (2 - Math.pow(2, -20 * t + 10)) / 2;
  },
  easeInCirc: (t: number) => 1 - Math.sqrt(1 - t * t),
  easeOutCirc: (t: number) => Math.sqrt(1 - (--t) * t),
  easeInOutCirc: (t: number) => {
    if (t < 0.5) return (1 - Math.sqrt(1 - 4 * t * t)) / 2;
    return (Math.sqrt(1 - (-2 * t + 2) * (-2 * t + 2)) + 1) / 2;
  },
  easeInBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return c3 * t * t * t - c1 * t * t;
  },
  easeOutBack: (t: number) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;
    return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
  },
  easeInOutBack: (t: number) => {
    const c1 = 1.70158;
    const c2 = c1 * 1.525;
    if (t < 0.5) {
      return (Math.pow(2 * t, 2) * ((c2 + 1) * 2 * t - c2)) / 2;
    }
    return (Math.pow(2 * t - 2, 2) * ((c2 + 1) * (t * 2 - 2) + c2) + 2) / 2;
  },
  bounce: (t: number) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    if (t < 1 / d1) {
      return n1 * t * t;
    } else if (t < 2 / d1) {
      return n1 * (t -= 1.5 / d1) * t + 0.75;
    } else if (t < 2.5 / d1) {
      return n1 * (t -= 2.25 / d1) * t + 0.9375;
    } else {
      return n1 * (t -= 2.625 / d1) * t + 0.984375;
    }
  },
  elastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return -Math.pow(2, 10 * t - 10) * Math.sin((t * 10 - 10.75) * c4);
  },
  easeOutElastic: (t: number) => {
    const c4 = (2 * Math.PI) / 3;
    if (t === 0) return 0;
    if (t === 1) return 1;
    return Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
  },
  easeInOutElastic: (t: number) => {
    const c5 = (2 * Math.PI) / 4.5;
    if (t === 0) return 0;
    if (t === 1) return 1;
    if (t < 0.5) {
      return -(Math.pow(2, 20 * t - 10) * Math.sin((20 * t - 11.125) * c5)) / 2;
    }
    return (Math.pow(2, -20 * t + 10) * Math.sin((20 * t - 11.125) * c5)) / 2 + 1;
  }
};

export interface AnimationConfig {
  duration: number;
  easing?: EasingFunction;
  fill?: 'forwards' | 'backwards' | 'both' | 'none';
  delay?: number;
}

export interface AnimationPropertyConfig {
  from: number;
  to: number;
  unit?: string;
}

export function animate(
  element: HTMLElement,
  properties: Record<string, AnimationPropertyConfig>,
  config: AnimationConfig
): Promise<void> {
  return new Promise((resolve) => {
    const { duration, easing = easingFunctions['ease-out'], delay = 0 } = config;
    
    const startAnimation = () => {
      const startTime = performance.now();
      
      function step(currentTime: number) {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const easedProgress = easing(progress);
        
        Object.entries(properties).forEach(([property, propConfig]) => {
          const value = propConfig.from + (propConfig.to - propConfig.from) * easedProgress;
          const unit = propConfig.unit || '';
          
          // 处理不同类型的属性
          if (isTransformProperty(property)) {
            handleTransformProperty(element, property, value, unit);
          } else if (property === 'opacity') {
            element.style.opacity = Math.max(0, Math.min(1, value)).toString();
          } else if (property === 'filter') {
            element.style.filter = `blur(${value}${unit})`;
          } else {
            element.style.setProperty(property, value + unit);
          }
        });
        
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          resolve();
        }
      }
      
      requestAnimationFrame(step);
    };
    
    if (delay > 0) {
      setTimeout(startAnimation, delay);
    } else {
      startAnimation();
    }
  });
}

function isTransformProperty(property: string): boolean {
  const transformProperties = [
    'transform', 'translateX', 'translateY', 'translateZ', 'translate3d',
    'rotate', 'rotateX', 'rotateY', 'rotateZ', 'rotate3d',
    'scale', 'scaleX', 'scaleY', 'scaleZ', 'scale3d',
    'skew', 'skewX', 'skewY'
  ];
  return transformProperties.includes(property);
}

function handleTransformProperty(element: HTMLElement, property: string, value: number, unit: string): void {
  const currentTransform = element.style.transform || '';
  let newTransform = '';
  
  switch (property) {
    case 'translateX':
      newTransform = `translateX(${value}${unit})`;
      break;
    case 'translateY':
      newTransform = `translateY(${value}${unit})`;
      break;
    case 'translateZ':
      newTransform = `translateZ(${value}${unit})`;
      break;
    case 'rotate':
    case 'rotateZ':
      newTransform = `rotate(${value}${unit})`;
      break;
    case 'rotateX':
      newTransform = `rotateX(${value}${unit})`;
      break;
    case 'rotateY':
      newTransform = `rotateY(${value}${unit})`;
      break;
    case 'scale':
      newTransform = `scale(${value})`;
      break;
    case 'scaleX':
      newTransform = `scaleX(${value})`;
      break;
    case 'scaleY':
      newTransform = `scaleY(${value})`;
      break;
    case 'skew':
      newTransform = `skew(${value}${unit})`;
      break;
    case 'skewX':
      newTransform = `skewX(${value}${unit})`;
      break;
    case 'skewY':
      newTransform = `skewY(${value}${unit})`;
      break;
    default:
      element.style.setProperty(property, value + unit);
      return;
  }
  
  updateTransform(element, currentTransform, newTransform);
}

function updateTransform(element: HTMLElement, currentTransform: string, newTransform: string): void {
  const transformType = newTransform.split('(')[0];
  const regex = new RegExp(`${transformType}\KATEX_INLINE_OPEN[^)]*\KATEX_INLINE_CLOSE`, 'g');
  
  if (currentTransform.includes(transformType)) {
    element.style.transform = currentTransform.replace(regex, newTransform);
  } else {
    element.style.transform = `${currentTransform} ${newTransform}`.trim();
  }
}

// 渐进式过渡效果
export function createProgressiveTransition(
  fromElement: HTMLElement,
  options: {
    type: 'pixelate' | 'wipe' | 'reveal' | 'mosaic' | 'spiral' | 'curtain' | 'slice';
    duration: number;
    easing?: EasingFunction;
    direction?: 'horizontal' | 'vertical' | 'diagonal';
  }
): Promise<void> {
  const { type, duration, easing = easingFunctions['ease-out'], direction = 'horizontal' } = options;
  
  switch (type) {
    case 'pixelate':
      return createPixelateTransition(fromElement, duration, easing);
    case 'wipe':
      return createWipeTransition(fromElement, duration, easing, direction);
    case 'reveal':
      return createRevealTransition(fromElement, duration);
    case 'mosaic':
      return createMosaicTransition(fromElement, duration);
    case 'spiral':
      return createSpiralTransition(fromElement, duration, easing);
    case 'curtain':
      return createCurtainTransition(fromElement, duration, easing);
    case 'slice':
      return createSliceTransition(fromElement, duration);
    default:
      return Promise.resolve();
  }
}

// 像素化过渡效果
function createPixelateTransition(
  fromElement: HTMLElement,
  duration: number,
  easing: EasingFunction
): Promise<void> {
  return new Promise((resolve) => {
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    if (!context) {
      resolve();
      return;
    }
    
    const rect = fromElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    canvas.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 10;
      pointer-events: none;
    `;
    
    fromElement.parentElement?.appendChild(canvas);
    
    const startTime = performance.now();
    const maxPixelSize = 20;
    
    function step(currentTime: number) {
      if (!context) {
        resolve();
        return;
      }
      
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easing(progress);
      
      const pixelSize = Math.max(1, maxPixelSize * (1 - easedProgress));
      
      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // 绘制像素化网格
      if (pixelSize > 1) {
        context.fillStyle = `rgba(255, 255, 255, ${0.8 * (1 - easedProgress)})`;
        for (let x = 0; x < canvas.width; x += pixelSize) {
          for (let y = 0; y < canvas.height; y += pixelSize) {
            if (Math.random() > easedProgress) {
              context.fillRect(x, y, pixelSize, pixelSize);
            }
          }
        }
      }
      
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        canvas.remove();
        resolve();
      }
    }
    
    requestAnimationFrame(step);
  });
}

// 擦拭过渡效果
function createWipeTransition(
  fromElement: HTMLElement,
  duration: number,
  easing: EasingFunction,
  direction: string
): Promise<void> {
  return new Promise((resolve) => {
    const mask = document.createElement('div');
    mask.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: ${direction === 'vertical' ? '100%' : '0%'};
      height: ${direction === 'vertical' ? '0%' : '100%'};
      background: linear-gradient(${direction === 'vertical' ? '0deg' : '90deg'}, 
        transparent, rgba(255,255,255,0.9), transparent);
      z-index: 10;
      pointer-events: none;
    `;
    
    fromElement.parentElement?.appendChild(mask);
    
    const properties: Record<string, AnimationPropertyConfig> = direction === 'vertical' 
      ? { height: { from: 0, to: 100, unit: '%' } }
      : { width: { from: 0, to: 100, unit: '%' } };
    
    animate(mask, properties, { duration, easing }).then(() => {
      mask.remove();
      resolve();
    });
  });
}

// 揭示过渡效果
function createRevealTransition(
  fromElement: HTMLElement,
  duration: number
): Promise<void> {
  return new Promise((resolve) => {
    const clipPath = document.createElement('div');
    clipPath.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0,0,0,0.8);
      clip-path: circle(0% at 50% 50%);
      z-index: 10;
      transition: clip-path ${duration}ms cubic-bezier(0.4, 0, 0.2, 1);
      pointer-events: none;
    `;
    
    fromElement.parentElement?.appendChild(clipPath);
    
    requestAnimationFrame(() => {
      clipPath.style.clipPath = 'circle(150% at 50% 50%)';
    });
    
    setTimeout(() => {
      clipPath.remove();
      resolve();
    }, duration);
  });
}

// 马赛克过渡效果
function createMosaicTransition(
  fromElement: HTMLElement,
  duration: number
): Promise<void> {
  return new Promise((resolve) => {
    const container = fromElement.parentElement;
    if (!container) return resolve();
    
    const rect = fromElement.getBoundingClientRect();
    const tileSize = 20;
    const cols = Math.ceil(rect.width / tileSize);
    const rows = Math.ceil(rect.height / tileSize);
    
    const tiles: HTMLElement[] = [];
    
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        const tile = document.createElement('div');
        tile.style.cssText = `
          position: absolute;
          left: ${j * tileSize}px;
          top: ${i * tileSize}px;
          width: ${tileSize}px;
          height: ${tileSize}px;
          background: rgba(255,255,255,0.9);
          z-index: 10;
          opacity: 1;
          transition: opacity ${duration / 2}ms ease-out;
          transition-delay: ${(i + j) * 20}ms;
          pointer-events: none;
        `;
        container.appendChild(tile);
        tiles.push(tile);
      }
    }
    
    setTimeout(() => {
      tiles.forEach(tile => {
        tile.style.opacity = '0';
      });
    }, 100);
    
    setTimeout(() => {
      tiles.forEach(tile => tile.remove());
      resolve();
    }, duration);
  });
}

// 螺旋过渡效果
function createSpiralTransition(
  fromElement: HTMLElement,
  duration: number,
  easing: EasingFunction
): Promise<void> {
  return new Promise((resolve) => {
    const spiral = document.createElement('div');
    spiral.style.cssText = `
      position: absolute;
      top: 50%;
      left: 50%;
      width: 2px;
      height: 2px;
      background: conic-gradient(from 0deg, transparent, rgba(255,255,255,0.8), transparent);
      border-radius: 50%;
      z-index: 10;
      transform: translate(-50%, -50%) scale(0);
      pointer-events: none;
    `;
    
    fromElement.parentElement?.appendChild(spiral);
    
    animate(spiral, {
      scale: { from: 0, to: 100 },
      rotate: { from: 0, to: 720, unit: 'deg' }
    }, { duration, easing }).then(() => {
      spiral.remove();
      resolve();
    });
  });
}

// 窗帘过渡效果
function createCurtainTransition(
  fromElement: HTMLElement,
  duration: number,
  easing: EasingFunction
): Promise<void> {
  return new Promise((resolve) => {
    const container = fromElement.parentElement;
    if (!container) return resolve();
    
    const leftCurtain = document.createElement('div');
    const rightCurtain = document.createElement('div');
    
    const curtainStyle = `
      position: absolute;
      top: 0;
      width: 50%;
      height: 100%;
      background: linear-gradient(90deg, rgba(0,0,0,0.8), rgba(0,0,0,0.9));
      z-index: 10;
      pointer-events: none;
    `;
    
    leftCurtain.style.cssText = curtainStyle + 'left: 0;';
    rightCurtain.style.cssText = curtainStyle + 'right: 0; transform: scaleX(-1);';
    
    container.appendChild(leftCurtain);
    container.appendChild(rightCurtain);
    
    Promise.all([
      animate(leftCurtain, { translateX: { from: 0, to: -100, unit: '%' } }, { duration, easing }),
      animate(rightCurtain, { translateX: { from: 0, to: 100, unit: '%' } }, { duration, easing })
    ]).then(() => {
      leftCurtain.remove();
      rightCurtain.remove();
      resolve();
    });
  });
}

// 切片过渡效果
function createSliceTransition(
  fromElement: HTMLElement,
  duration: number
): Promise<void> {
  return new Promise((resolve) => {
    const container = fromElement.parentElement;
    if (!container) return resolve();
    
    const sliceCount = 8;
    const slices: HTMLElement[] = [];
    
    for (let i = 0; i < sliceCount; i++) {
      const slice = document.createElement('div');
      slice.style.cssText = `
        position: absolute;
        left: ${(i * 100) / sliceCount}%;
        top: 0;
        width: ${100 / sliceCount}%;
        height: 100%;
        background: rgba(255,255,255,0.9);
        z-index: 10;
        transform: translateY(${i % 2 === 0 ? '-100%' : '100%'});
        transition: transform ${duration}ms ease-out;
        transition-delay: ${i * 50}ms;
        pointer-events: none;
      `;
      container.appendChild(slice);
      slices.push(slice);
    }
    
    setTimeout(() => {
      slices.forEach(slice => {
        slice.style.transform = 'translateY(0)';
      });
    }, 100);
    
    setTimeout(() => {
      slices.forEach(slice => {
        slice.style.transform = slice.style.transform.includes('-100%') 
          ? 'translateY(-100%)' 
          : 'translateY(100%)';
      });
    }, duration / 2);
    
    setTimeout(() => {
      slices.forEach(slice => slice.remove());
      resolve();
    }, duration);
  });
}

// 完成效果
export function createCompletionEffect(
  element: HTMLElement,
  type: 'pulse' | 'glow' | 'bounce' | 'flash' | 'ripple' | 'sparkle' | 'rainbow',
  options: { duration: number; intensity: number; color?: string }
): Promise<void> {
  const { duration, intensity, color = '#4CAF50' } = options;
  
  switch (type) {
    case 'pulse':
      return createPulseEffect(element, duration, intensity, color);
    case 'glow':
      return createGlowEffect(element, duration, intensity, color);
    case 'bounce':
      return createBounceEffect(element, duration, intensity);
    case 'flash':
      return createFlashEffect(element, duration, intensity, color);
    case 'ripple':
      return createRippleEffect(element, duration, intensity, color);
    case 'sparkle':
      return createSparkleEffect(element, duration, intensity, color);
    case 'rainbow':
      return createRainbowEffect(element, duration, intensity);
    default:
      return Promise.resolve();
  }
}

function createPulseEffect(element: HTMLElement, duration: number, intensity: number, color: string): Promise<void> {
  const originalBoxShadow = element.style.boxShadow;
  
  return animate(element, {
    scale: { from: 1, to: 1 + intensity * 0.05 }
  }, { duration: duration / 2 }).then(() => {
    element.style.boxShadow = `0 0 ${20 * intensity}px ${color}`;
    return animate(element, {
      scale: { from: 1 + intensity * 0.05, to: 1 }
    }, { duration: duration / 2 });
  }).then(() => {
    element.style.boxShadow = originalBoxShadow;
  });
}

function createGlowEffect(element: HTMLElement, duration: number, intensity: number, color: string): Promise<void> {
  const originalBoxShadow = element.style.boxShadow;
  
  element.style.boxShadow = `0 0 ${30 * intensity}px ${color}`;
  
  return new Promise(resolve => {
    setTimeout(() => {
      element.style.transition = `box-shadow ${duration}ms ease-out`;
      element.style.boxShadow = originalBoxShadow;
      
      setTimeout(() => {
        element.style.transition = '';
        resolve();
      }, duration);
    }, 100);
  });
}

function createBounceEffect(element: HTMLElement, duration: number, intensity: number): Promise<void> {
  return animate(element, {
    scale: { from: 1, to: 1 + intensity * 0.1 }
  }, { duration: duration / 3, easing: easingFunctions.bounce }).then(() => {
    return animate(element, {
      scale: { from: 1 + intensity * 0.1, to: 1 }
    }, { duration: duration * 2 / 3, easing: easingFunctions.bounce });
  });
}

function createFlashEffect(element: HTMLElement, duration: number, intensity: number, color: string): Promise<void> {
  const flash = document.createElement('div');
  flash.style.cssText = `
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${color};
    opacity: 0;
    z-index: 10;
    pointer-events: none;
  `;
  
  element.style.position = 'relative';
  element.appendChild(flash);
  
  return animate(flash, {
    opacity: { from: 0, to: intensity * 0.8 }
  }, { duration: duration / 3 }).then(() => {
    return animate(flash, {
      opacity: { from: intensity * 0.8, to: 0 }
    }, { duration: duration * 2 / 3 });
  }).then(() => {
    flash.remove();
  });
}

function createRippleEffect(element: HTMLElement, duration: number, intensity: number, color: string): Promise<void> {
  const ripple = document.createElement('div');
  const rect = element.getBoundingClientRect();
  
  ripple.style.cssText = `
    position: absolute;
    top: 50%;
    left: 50%;
    width: 10px;
    height: 10px;
    background: ${color};
    border-radius: 50%;
    opacity: ${intensity * 0.8};
    transform: translate(-50%, -50%) scale(0);
    z-index: 10;
    pointer-events: none;
  `;
  
  element.style.position = 'relative';
  element.appendChild(ripple);
  
  const maxScale = Math.max(rect.width, rect.height) / 10;
  
  return animate(ripple, {
    scale: { from: 0, to: maxScale },
    opacity: { from: intensity * 0.8, to: 0 }
  }, { duration, easing: easingFunctions['ease-out'] }).then(() => {
    ripple.remove();
  });
}

function createSparkleEffect(element: HTMLElement, duration: number, intensity: number, color: string): Promise<void> {
  const sparkles: HTMLElement[] = [];
  const sparkleCount = Math.floor(intensity * 10);
  
  element.style.position = 'relative';
  
  for (let i = 0; i < sparkleCount; i++) {
    const sparkle = document.createElement('div');
    sparkle.style.cssText = `
      position: absolute;
      width: 4px;
      height: 4px;
      background: ${color};
      border-radius: 50%;
      opacity: 0;
      z-index: 10;
      pointer-events: none;
      top: ${Math.random() * 100}%;
      left: ${Math.random() * 100}%;
    `;
    element.appendChild(sparkle);
    sparkles.push(sparkle);
    
    // 随机延迟闪烁
    setTimeout(() => {
      animate(sparkle, {
        opacity: { from: 0, to: 1 }
      }, { duration: duration / 4 }).then(() => {
        return animate(sparkle, {
          opacity: { from: 1, to: 0 }
        }, { duration: duration / 4 });
      });
    }, Math.random() * duration / 2);
  }
  
  return new Promise(resolve => {
    setTimeout(() => {
      sparkles.forEach(sparkle => sparkle.remove());
      resolve();
    }, duration);
  });
}

function createRainbowEffect(element: HTMLElement, duration: number, intensity: number): Promise<void> {
  const originalFilter = element.style.filter;
  
  return new Promise(resolve => {
    let hue = 0;
    const step = 360 / (duration / 50);
    
    const interval = setInterval(() => {
      element.style.filter = `hue-rotate(${hue}deg) saturate(${1 + intensity})`;
      hue += step;
      
      if (hue >= 360) {
        clearInterval(interval);
        element.style.filter = originalFilter;
        resolve();
      }
    }, 50);
  });
}

// 工具函数
export function fadeIn(element: HTMLElement, duration: number, easing?: EasingFunction): Promise<void> {
  element.style.opacity = '0';
  return animate(element, { opacity: { from: 0, to: 1 } }, { duration, easing });
}

export function fadeOut(element: HTMLElement, duration: number, easing?: EasingFunction): Promise<void> {
  return animate(element, { opacity: { from: 1, to: 0 } }, { duration, easing });
}

export function slideIn(element: HTMLElement, direction: 'up' | 'down' | 'left' | 'right', duration: number, easing?: EasingFunction): Promise<void> {
  const directions = {
    up: { translateY: { from: 100, to: 0, unit: '%' } },
    down: { translateY: { from: -100, to: 0, unit: '%' } },
    left: { translateX: { from: 100, to: 0, unit: '%' } },
    right: { translateX: { from: -100, to: 0, unit: '%' } }
  };
  
  element.style.opacity = '0';
  return animate(element, {
    opacity: { from: 0, to: 1 },
    ...directions[direction]
  }, { duration, easing });
}

export function slideOut(element: HTMLElement, direction: 'up' | 'down' | 'left' | 'right', duration: number, easing?: EasingFunction): Promise<void> {
  const directions = {
    up: { translateY: { from: 0, to: -100, unit: '%' } },
    down: { translateY: { from: 0, to: 100, unit: '%' } },
    left: { translateX: { from: 0, to: -100, unit: '%' } },
    right: { translateX: { from: 0, to: 100, unit: '%' } }
  };
  
  return animate(element, {
    opacity: { from: 1, to: 0 },
    ...directions[direction]
  }, { duration, easing });
}

export function scaleIn(element: HTMLElement, duration: number, easing?: EasingFunction): Promise<void> {
  element.style.opacity = '0';
  return animate(element, {
    opacity: { from: 0, to: 1 },
    scale: { from: 0.8, to: 1 }
  }, { duration, easing });
}

export function scaleOut(element: HTMLElement, duration: number, easing?: EasingFunction): Promise<void> {
  return animate(element, {
    opacity: { from: 1, to: 0 },
    scale: { from: 1, to: 0.8 }
  }, { duration, easing });
}