/**
 * 增强的动画组件 - 优化版本
 */

export function createDotsLoader(color = '#007bff', speed = 1): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-dots-loader';
  container.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    width: 100%;
    height: 100%;
  `;
  
  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    dot.style.cssText = `
      display: block;
      width: 12px;
      height: 12px;
      border-radius: 50%;
      background-color: ${color};
      animation: lazy-pic-dots-bounce ${1.4 / speed}s ease-in-out infinite;
      animation-delay: ${i * 0.16 / speed}s;
    `;
    container.appendChild(dot);
  }
  
  return container;
}

export function createSpinnerLoader(color = '#007bff', size = 40): HTMLElement {
  const spinner = document.createElement('div');
  spinner.className = 'lazy-pic-spinner-loader';
  spinner.style.cssText = `
    width: ${size}px;
    height: ${size}px;
    border: 3px solid rgba(0,0,0,0.1);
    border-top: 3px solid ${color};
    border-radius: 50%;
    animation: lazy-pic-spin 1s linear infinite;
  `;
  
  return spinner;
}

export function createPulseLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-pulse-loader';
  container.style.cssText = `
    position: relative;
    width: 80px;
    height: 80px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  for (let i = 0; i < 2; i++) {
    const pulse = document.createElement('div');
    pulse.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      border: 3px solid ${color};
      border-radius: 50%;
      animation: lazy-pic-pulse 2s ease-out infinite;
      animation-delay: ${i}s;
    `;
    container.appendChild(pulse);
  }
  
  return container;
}

export function createWaveLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-wave-loader';
  container.style.cssText = `
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 4px;
    height: 100%;
  `;
  
  for (let i = 0; i < 5; i++) {
    const bar = document.createElement('div');
    bar.style.cssText = `
      width: 6px;
      height: 40px;
      background-color: ${color};
      border-radius: 3px;
      animation: lazy-pic-wave 1.2s ease-in-out infinite;
      animation-delay: ${i * 0.1}s;
    `;
    container.appendChild(bar);
  }
  
  return container;
}

export function createSkeletonLoader(width = '100%', height = '200px'): HTMLElement {
  const skeleton = document.createElement('div');
  skeleton.className = 'lazy-pic-skeleton-loader';
  skeleton.style.cssText = `
    width: ${width};
    height: ${height};
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: lazy-pic-shimmer 1.5s infinite;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
  `;

  // 添加装饰性元素
  const decorations = [
    { width: '60%', height: '16px', top: '20px', left: '20px' },
    { width: '80%', height: '12px', top: '45px', left: '20px' },
    { width: '45%', height: '12px', top: '65px', left: '20px' }
  ];

  decorations.forEach(dec => {
    const element = document.createElement('div');
    element.style.cssText = `
      position: absolute;
      top: ${dec.top};
      left: ${dec.left};
      width: ${dec.width};
      height: ${dec.height};
      background: rgba(255, 255, 255, 0.4);
      border-radius: 4px;
    `;
    skeleton.appendChild(element);
  });
  
  return skeleton;
}

export function createShimmerLoader(width = '100%', height = '200px'): HTMLElement {
  const shimmer = document.createElement('div');
  shimmer.className = 'lazy-pic-shimmer-loader';
  shimmer.style.cssText = `
    width: ${width};
    height: ${height};
    background: linear-gradient(45deg, transparent 30%, rgba(255,255,255,0.5) 50%, transparent 70%);
    background-color: #f6f7f8;
    background-size: 200% 100%;
    animation: lazy-pic-shimmer 2s infinite;
    border-radius: 8px;
    position: relative;
    overflow: hidden;
  `;
  
  return shimmer;
}

export function createRippleLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-ripple-loader';
  container.style.cssText = `
    position: relative;
    width: 100px;
    height: 100px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  for (let i = 0; i < 3; i++) {
    const ripple = document.createElement('div');
    ripple.style.cssText = `
      position: absolute;
      width: 100%;
      height: 100%;
      border: 2px solid ${color};
      border-radius: 50%;
      opacity: 0;
      animation: lazy-pic-ripple 3s ease-out infinite;
      animation-delay: ${i * 0.6}s;
    `;
    container.appendChild(ripple);
  }
  
  return container;
}

export function createBreathingLoader(color = '#007bff'): HTMLElement {
  const breathing = document.createElement('div');
  breathing.className = 'lazy-pic-breathing-loader';
  breathing.style.cssText = `
    width: 80px;
    height: 80px;
    background-color: ${color};
    border-radius: 50%;
    animation: lazy-pic-breathing 2s ease-in-out infinite;
  `;
  
  return breathing;
}

export function createParticlesLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-particles-loader';
  container.style.cssText = `
    position: relative;
    width: 120px;
    height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  `;

  for (let i = 0; i < 12; i++) {
    const particle = document.createElement('div');
    const angle = (i * 30) * Math.PI / 180;
    const radius = 40;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    particle.style.cssText = `
      position: absolute;
      width: 10px;
      height: 10px;
      background-color: ${color};
      border-radius: 50%;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) translate(${x}px, ${y}px) scale(0);
      animation: lazy-pic-particles 2s ease-in-out infinite;
      animation-delay: ${i * 0.1}s;
    `;
    container.appendChild(particle);
  }
  
  return container;
}

export const animationStyles = `
  @keyframes lazy-pic-dots-bounce {
    0%, 80%, 100% {
      transform: scale(0);
      opacity: 0.5;
    }
    40% {
      transform: scale(1);
      opacity: 1;
    }
  }
  
  @keyframes lazy-pic-spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  @keyframes lazy-pic-pulse {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
  
  @keyframes lazy-pic-wave {
    0%, 40%, 100% {
      transform: scaleY(0.4);
    }
    20% {
      transform: scaleY(1);
    }
  }
  
  @keyframes lazy-pic-shimmer {
    0% {
      background-position: -200% 0;
    }
    100% {
      background-position: 200% 0;
    }
  }
  
  @keyframes lazy-pic-ripple {
    0% {
      transform: scale(0);
      opacity: 1;
    }
    100% {
      transform: scale(1);
      opacity: 0;
    }
  }
  
  @keyframes lazy-pic-breathing {
    0%, 100% {
      transform: scale(1);
      opacity: 0.7;
    }
    50% {
      transform: scale(1.1);
      opacity: 1;
    }
  }
  
  @keyframes lazy-pic-particles {
    0%, 100% {
      transform: translate(-50%, -50%) translate(var(--x, 0), var(--y, 0)) scale(0);
      opacity: 0;
    }
    50% {
      transform: translate(-50%, -50%) translate(var(--x, 0), var(--y, 0)) scale(1);
      opacity: 1;
    }
  }
  
  .lazy-pic-loader-container {
    display: flex;
    align-items: center;
    justify-content: center;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(2px);
    transition: all 0.3s ease;
    z-index: 10;
  }
  
  .lazy-pic-animation-placeholder {
    border: none !important;
    box-shadow: none !important;
  }
  
  .lazy-pic-blur {
    filter: blur(8px);
    transform: scale(1.02);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .lazy-pic-unblur {
    filter: blur(0px);
    transform: scale(1);
  }
  
  .lazy-pic-fade-in {
    opacity: 0;
    transform: translateY(10px);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
  }
  
  .lazy-pic-fade-in.loaded {
    opacity: 1;
    transform: translateY(0);
  }
  
  .lazy-pic-loading {
    position: relative;
  }
  
  .lazy-pic-loaded {
    animation: lazy-pic-loaded-pulse 0.6s ease-out;
  }
  
  @keyframes lazy-pic-loaded-pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.01); }
    100% { transform: scale(1); }
  }
  
  .lazy-pic-error {
    opacity: 0.7;
    filter: grayscale(1);
  }
  
  .lazy-pic-mask-overlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 5;
    transition: all 0.3s ease;
  }
  
  .lazy-pic-mask-gradient {
    background: linear-gradient(45deg, rgba(0,0,0,0.1), rgba(255,255,255,0.1));
  }
  
  .lazy-pic-mask-pattern {
    background-image: repeating-linear-gradient(
      45deg,
      transparent,
      transparent 2px,
      rgba(0,0,0,0.1) 2px,
      rgba(0,0,0,0.1) 4px
    );
  }
  
  .lazy-pic-full-skeleton,
  .lazy-pic-full-shimmer {
    width: 100%;
    height: 100%;
    min-height: 150px;
    border-radius: inherit;
  }
`;