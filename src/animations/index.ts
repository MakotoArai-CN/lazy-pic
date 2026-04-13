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

export function createProgressBarLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-progress-bar-loader';
  container.style.cssText = `
    width: min(220px, 70%);
    height: 10px;
    border-radius: 999px;
    background: rgba(0, 0, 0, 0.08);
    overflow: hidden;
    position: relative;
  `;

  const bar = document.createElement('div');
  bar.style.cssText = `
    width: 45%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, ${color}, rgba(255,255,255,0.9), ${color});
    background-size: 200% 100%;
    animation: lazy-pic-progress-bar 1.4s ease-in-out infinite;
  `;

  container.appendChild(bar);
  return container;
}

export function createSkeletonLinesLoader(color = '#d9d9d9'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-skeleton-lines-loader';
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 12px;
    width: min(240px, 72%);
  `;

  ['100%', '82%', '68%'].forEach((width, index) => {
    const line = document.createElement('div');
    line.style.cssText = `
      width: ${width};
      height: ${index === 0 ? '14px' : '10px'};
      border-radius: 999px;
      background: linear-gradient(90deg, rgba(0,0,0,0.05) 25%, ${color} 50%, rgba(0,0,0,0.05) 75%);
      background-size: 200% 100%;
      animation: lazy-pic-shimmer 1.6s infinite;
    `;
    container.appendChild(line);
  });

  return container;
}

export function createDiagonalShimmerLoader(color = '#ffffff'): HTMLElement {
  const shimmer = document.createElement('div');
  shimmer.className = 'lazy-pic-diagonal-shimmer-loader';
  shimmer.style.cssText = `
    width: 100%;
    height: 100%;
    background: linear-gradient(135deg, rgba(0,0,0,0.04) 0%, rgba(0,0,0,0.08) 45%, rgba(0,0,0,0.04) 100%);
    position: relative;
    overflow: hidden;
  `;

  const sweep = document.createElement('div');
  sweep.style.cssText = `
    position: absolute;
    inset: -30%;
    background: linear-gradient(135deg, transparent 35%, ${color} 50%, transparent 65%);
    opacity: 0.55;
    animation: lazy-pic-diagonal-shimmer 1.8s linear infinite;
  `;

  shimmer.appendChild(sweep);
  return shimmer;
}

export function createOrbitLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-orbit-loader';
  container.style.cssText = `
    position: relative;
    width: 88px;
    height: 88px;
  `;

  const core = document.createElement('div');
  core.style.cssText = `
    position: absolute;
    left: 50%;
    top: 50%;
    width: 18px;
    height: 18px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background-color: ${color};
    box-shadow: 0 0 20px ${color}55;
  `;
  container.appendChild(core);

  for (let i = 0; i < 3; i++) {
    const orbit = document.createElement('div');
    orbit.style.cssText = `
      position: absolute;
      inset: ${10 + i * 10}px;
      border-radius: 50%;
      border: 1px solid ${color}${i === 0 ? '55' : i === 1 ? '33' : '22'};
      animation: lazy-pic-orbit ${1.8 + i * 0.35}s linear infinite;
    `;

    const dot = document.createElement('div');
    dot.style.cssText = `
      position: absolute;
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: ${color};
      top: -5px;
      left: 50%;
      transform: translateX(-50%);
    `;

    orbit.appendChild(dot);
    container.appendChild(orbit);
  }

  return container;
}

export function createGridLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-grid-loader';
  container.style.cssText = `
    display: grid;
    grid-template-columns: repeat(3, 14px);
    gap: 6px;
  `;

  for (let i = 0; i < 9; i++) {
    const cell = document.createElement('div');
    cell.style.cssText = `
      width: 14px;
      height: 14px;
      border-radius: 4px;
      background-color: ${color};
      opacity: 0.2;
      animation: lazy-pic-grid 1.2s ease-in-out infinite;
      animation-delay: ${i * 0.08}s;
    `;
    container.appendChild(cell);
  }

  return container;
}

export function createTypingLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-typing-loader';
  container.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
    color: ${color};
    font-size: 14px;
    font-weight: 500;
  `;

  const label = document.createElement('span');
  label.textContent = 'Loading';
  container.appendChild(label);

  for (let i = 0; i < 3; i++) {
    const dot = document.createElement('span');
    dot.style.cssText = `
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: ${color};
      animation: lazy-pic-dots-bounce 1.4s ease-in-out infinite;
      animation-delay: ${i * 0.15}s;
    `;
    container.appendChild(dot);
  }

  return container;
}

export function createBarsLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-bars-loader';
  container.style.cssText = `
    display: flex;
    align-items: end;
    gap: 6px;
    height: 48px;
  `;

  [18, 34, 26, 40].forEach((height, index) => {
    const bar = document.createElement('div');
    bar.style.cssText = `
      width: 8px;
      height: ${height}px;
      border-radius: 999px;
      background-color: ${color};
      animation: lazy-pic-bars 1s ease-in-out infinite;
      animation-delay: ${index * 0.1}s;
    `;
    container.appendChild(bar);
  });

  return container;
}

export function createArcLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-arc-loader';
  container.style.cssText = `
    position: relative;
    width: 72px;
    height: 72px;
    border-radius: 50%;
    border: 4px solid rgba(0,0,0,0.08);
    border-top-color: ${color};
    border-right-color: ${color};
    animation: lazy-pic-spin 1.1s linear infinite;
  `;

  return container;
}

export function createWaveDotsLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-wave-dots-loader';
  container.style.cssText = `
    display: flex;
    align-items: center;
    gap: 8px;
  `;

  for (let i = 0; i < 5; i++) {
    const dot = document.createElement('span');
    dot.style.cssText = `
      width: 10px;
      height: 10px;
      border-radius: 50%;
      background-color: ${color};
      animation: lazy-pic-wave-dots 1.2s ease-in-out infinite;
      animation-delay: ${i * 0.08}s;
    `;
    container.appendChild(dot);
  }

  return container;
}

export function createScannerLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-scanner-loader';
  container.style.cssText = `
    position: relative;
    width: min(220px, 70%);
    height: 90px;
    border-radius: 14px;
    background: rgba(0, 0, 0, 0.05);
    overflow: hidden;
  `;

  const scanLine = document.createElement('div');
  scanLine.style.cssText = `
    position: absolute;
    left: 0;
    right: 0;
    height: 22px;
    background: linear-gradient(180deg, transparent, ${color}44, transparent);
    animation: lazy-pic-scanner 1.8s ease-in-out infinite;
  `;

  container.appendChild(scanLine);
  return container;
}

export function createRadarLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-radar-loader';
  container.style.cssText = `
    position: relative;
    width: 92px;
    height: 92px;
    border-radius: 50%;
    border: 1px solid ${color}33;
    overflow: hidden;
  `;

  for (let i = 1; i <= 2; i++) {
    const ring = document.createElement('div');
    ring.style.cssText = `
      position: absolute;
      inset: ${i * 14}px;
      border-radius: 50%;
      border: 1px solid ${color}22;
    `;
    container.appendChild(ring);
  }

  const sweep = document.createElement('div');
  sweep.style.cssText = `
    position: absolute;
    inset: 0;
    border-radius: 50%;
    background: conic-gradient(transparent 0deg, ${color}66 70deg, transparent 120deg);
    animation: lazy-pic-spin 1.8s linear infinite;
  `;
  container.appendChild(sweep);

  return container;
}

export function createShineLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-shine-loader';
  container.style.cssText = `
    position: relative;
    width: min(220px, 70%);
    height: 60px;
    border-radius: 18px;
    background: linear-gradient(90deg, rgba(0,0,0,0.05), rgba(0,0,0,0.08), rgba(0,0,0,0.05));
    overflow: hidden;
  `;

  const shine = document.createElement('div');
  shine.style.cssText = `
    position: absolute;
    inset: 0;
    background: linear-gradient(110deg, transparent 20%, ${color}33 50%, transparent 80%);
    transform: translateX(-100%);
    animation: lazy-pic-shine 1.6s ease-in-out infinite;
  `;
  container.appendChild(shine);

  return container;
}

export function createPulseRingLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-pulse-ring-loader';
  container.style.cssText = `
    position: relative;
    width: 96px;
    height: 96px;
  `;

  for (let i = 0; i < 3; i++) {
    const ring = document.createElement('div');
    ring.style.cssText = `
      position: absolute;
      inset: ${i * 8}px;
      border-radius: 50%;
      border: 2px solid ${color};
      opacity: 0;
      animation: lazy-pic-pulse-ring 2.2s ease-out infinite;
      animation-delay: ${i * 0.3}s;
    `;
    container.appendChild(ring);
  }

  return container;
}

export function createCubeLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-cube-loader';
  container.style.cssText = `
    position: relative;
    width: 54px;
    height: 54px;
    transform-style: preserve-3d;
    animation: lazy-pic-cube 1.8s ease-in-out infinite;
  `;

  for (let i = 0; i < 4; i++) {
    const face = document.createElement('div');
    face.style.cssText = `
      position: absolute;
      inset: 0;
      border-radius: 10px;
      background: ${color};
      opacity: ${0.2 + i * 0.18};
      transform: rotate(${i * 90}deg) translateZ(${i * 2}px);
    `;
    container.appendChild(face);
  }

  return container;
}

export function createEqualizerLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-equalizer-loader';
  container.style.cssText = `
    display: flex;
    align-items: end;
    gap: 5px;
    height: 46px;
  `;

  [18, 30, 42, 26, 36].forEach((height, index) => {
    const bar = document.createElement('div');
    bar.style.cssText = `
      width: 7px;
      height: ${height}px;
      border-radius: 999px;
      background-color: ${color};
      animation: lazy-pic-equalizer 0.9s ease-in-out infinite;
      animation-delay: ${index * 0.08}s;
    `;
    container.appendChild(bar);
  });

  return container;
}

export function createBlinkLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-blink-loader';
  container.style.cssText = `
    width: 86px;
    height: 48px;
    border-radius: 999px;
    background: ${color}22;
    position: relative;
    overflow: hidden;
  `;

  const pupil = document.createElement('div');
  pupil.style.cssText = `
    position: absolute;
    left: 50%;
    top: 50%;
    width: 18px;
    height: 18px;
    transform: translate(-50%, -50%);
    border-radius: 50%;
    background: ${color};
    animation: lazy-pic-blink 1.8s ease-in-out infinite;
  `;

  container.appendChild(pupil);
  return container;
}

export function createLadderLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-ladder-loader';
  container.style.cssText = `
    display: flex;
    flex-direction: column;
    gap: 8px;
    width: min(180px, 60%);
  `;

  [100, 82, 64, 46].forEach((width, index) => {
    const rung = document.createElement('div');
    rung.style.cssText = `
      width: ${width}%;
      height: 8px;
      border-radius: 999px;
      background: ${color};
      opacity: 0.15;
      animation: lazy-pic-ladder 1.2s ease-in-out infinite;
      animation-delay: ${index * 0.1}s;
    `;
    container.appendChild(rung);
  });

  return container;
}

export function createFlowLoader(color = '#007bff'): HTMLElement {
  const container = document.createElement('div');
  container.className = 'lazy-pic-flow-loader';
  container.style.cssText = `
    display: flex;
    gap: 6px;
    padding: 12px 16px;
    border-radius: 16px;
    background: rgba(0,0,0,0.05);
  `;

  for (let i = 0; i < 4; i++) {
    const pill = document.createElement('div');
    pill.style.cssText = `
      width: 28px;
      height: 10px;
      border-radius: 999px;
      background: ${color};
      opacity: 0.2;
      animation: lazy-pic-flow 1s ease-in-out infinite;
      animation-delay: ${i * 0.12}s;
    `;
    container.appendChild(pill);
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

  @keyframes lazy-pic-progress-bar {
    0% { transform: translateX(-120%); }
    50% { transform: translateX(120%); }
    100% { transform: translateX(320%); }
  }

  @keyframes lazy-pic-diagonal-shimmer {
    0% { transform: translate(-120%, -120%) rotate(0deg); }
    100% { transform: translate(120%, 120%) rotate(0deg); }
  }

  @keyframes lazy-pic-orbit {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes lazy-pic-grid {
    0%, 100% { transform: scale(0.7); opacity: 0.2; }
    50% { transform: scale(1); opacity: 1; }
  }

  @keyframes lazy-pic-bars {
    0%, 100% { transform: scaleY(0.45); opacity: 0.45; }
    50% { transform: scaleY(1); opacity: 1; }
  }

  @keyframes lazy-pic-wave-dots {
    0%, 100% { transform: translateY(0); opacity: 0.4; }
    50% { transform: translateY(-8px); opacity: 1; }
  }

  @keyframes lazy-pic-scanner {
    0%, 100% { transform: translateY(-18px); }
    50% { transform: translateY(86px); }
  }

  @keyframes lazy-pic-shine {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }

  @keyframes lazy-pic-pulse-ring {
    0% { transform: scale(0.75); opacity: 0.8; }
    100% { transform: scale(1.1); opacity: 0; }
  }

  @keyframes lazy-pic-cube {
    0%, 100% { transform: rotateX(0deg) rotateY(0deg); }
    50% { transform: rotateX(180deg) rotateY(180deg); }
  }

  @keyframes lazy-pic-equalizer {
    0%, 100% { transform: scaleY(0.35); opacity: 0.45; }
    50% { transform: scaleY(1); opacity: 1; }
  }

  @keyframes lazy-pic-blink {
    0%, 42%, 100% { transform: translate(-50%, -50%) scaleY(1); }
    48%, 52% { transform: translate(-50%, -50%) scaleY(0.15); }
  }

  @keyframes lazy-pic-ladder {
    0%, 100% { opacity: 0.15; transform: translateX(0); }
    50% { opacity: 1; transform: translateX(8px); }
  }

  @keyframes lazy-pic-flow {
    0%, 100% { opacity: 0.2; transform: translateX(0); }
    50% { opacity: 1; transform: translateX(8px); }
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
    animation: none;
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
  .lazy-pic-full-shimmer,
  .lazy-pic-diagonal-shimmer-loader {
    width: 100%;
    height: 100%;
    min-height: 150px;
    border-radius: inherit;
  }
`;

