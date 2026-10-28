/**
 * Compact placeholder loader system.
 *
 * Every loader is a tiny, static markup template plus one shared stylesheet.
 * Keeping the markup and CSS out of per-loader inline styles removes ~20 KB of
 * duplicated strings from the bundle and lets the browser cache a single style
 * sheet for all placeholders.
 */

type LoaderKind =
  | 'skeleton'
  | 'shimmer'
  | 'spinner'
  | 'dots'
  | 'pulse'
  | 'wave'
  | 'progress-bar'
  | 'grid'
  | 'scanner'
  | 'orbit';

const LOADER_TEMPLATES: Record<LoaderKind, string> = {
  skeleton: '<i></i><i></i><i></i>',
  shimmer: '',
  spinner: '',
  dots: '<i></i><i></i><i></i>',
  pulse: '<i></i><i></i>',
  wave: '<i></i><i></i><i></i><i></i><i></i>',
  'progress-bar': '<i></i>',
  grid: '<i></i>'.repeat(9),
  scanner: '',
  orbit: '<i></i>'
};

/**
 * Older loader names remain valid config values; they resolve to the closest
 * modern visual instead of shipping a separate implementation.
 */
const LOADER_ALIASES: Record<string, LoaderKind> = {
  'skeleton-lines': 'skeleton',
  'diagonal-shimmer': 'shimmer',
  shine: 'shimmer',
  breathing: 'pulse',
  ripple: 'pulse',
  particles: 'pulse',
  'pulse-ring': 'pulse',
  typing: 'dots',
  'wave-dots': 'dots',
  arc: 'spinner',
  bars: 'wave',
  equalizer: 'wave',
  ladder: 'wave',
  flow: 'wave',
  blink: 'wave',
  cube: 'orbit',
  radar: 'orbit'
};

export function createLoader(type: string, color = '#007bff', speed = 1): HTMLElement {
  const kind = LOADER_ALIASES[type] || (type in LOADER_TEMPLATES ? (type as LoaderKind) : 'skeleton');
  const loader = document.createElement('div');
  loader.className = `lazy-pic-loader lazy-pic-loader--${kind}`;
  loader.style.setProperty('--lp-color', color);

  const safeSpeed = Number.isFinite(speed) && speed > 0 ? speed : 1;
  if (safeSpeed !== 1) {
    // Duration factor: 2x speed means half the duration.
    loader.style.setProperty('--lp-speed', String(1 / safeSpeed));
  }

  loader.innerHTML = LOADER_TEMPLATES[kind];
  return loader;
}

export const animationStyles = `
  .lazy-pic-pending { opacity: 0; }
  .lazy-pic-loading { position: relative; }
  .lazy-pic-error { opacity: .7; filter: grayscale(1); }

  .lazy-pic-placeholder,
  .lazy-pic-loader-container {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    box-sizing: border-box;
    pointer-events: none;
    background: rgba(248, 249, 250, .96);
    z-index: 10;
  }

  .lazy-pic-loader-text {
    position: absolute;
    bottom: 14px;
    left: 50%;
    transform: translateX(-50%);
    font: 500 13px/1.4 system-ui, -apple-system, "Segoe UI", sans-serif;
    color: #6b7280;
    white-space: nowrap;
  }

  .lazy-pic-transition {
    position: absolute;
    inset: 0;
    overflow: hidden;
    pointer-events: none;
    z-index: 2;
    border-radius: inherit;
  }

  .lazy-pic-transition img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center;
  }

  .lazy-pic-mask-overlay {
    position: absolute;
    inset: 0;
    pointer-events: none;
    z-index: 5;
    background: rgba(0, 0, 0, .3);
  }

  .lazy-pic-mask-gradient {
    background: linear-gradient(45deg, rgba(0, 0, 0, .1), rgba(255, 255, 255, .1));
  }

  .lazy-pic-mask-pattern {
    background-image: repeating-linear-gradient(45deg, transparent 0 2px, rgba(0, 0, 0, .1) 2px 4px);
  }

  .lazy-pic-loader {
    --lp-color: #007bff;
    --lp-speed: 1;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    box-sizing: border-box;
    color: var(--lp-color);
  }

  .lazy-pic-loader i { display: block; }

  .lazy-pic-loader--skeleton {
    overflow: hidden;
    background: linear-gradient(100deg, #f1f3f5 20%, #e9ecef 45%, #f1f3f5 70%);
  }

  .lazy-pic-loader--skeleton::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(100deg, transparent 25%, rgba(255, 255, 255, .62) 50%, transparent 75%);
    transform: translateX(-100%);
    animation: lazy-pic-sheen calc(1.6s * var(--lp-speed)) ease-in-out infinite;
  }

  .lazy-pic-loader--skeleton i {
    position: absolute;
    left: 10%;
    height: 10px;
    border-radius: 999px;
    background: rgba(255, 255, 255, .62);
  }

  .lazy-pic-loader--skeleton i:nth-child(1) { top: 34%; width: 55%; }
  .lazy-pic-loader--skeleton i:nth-child(2) { top: 48%; width: 70%; }
  .lazy-pic-loader--skeleton i:nth-child(3) { top: 62%; width: 42%; }

  .lazy-pic-loader--shimmer {
    background: #f3f4f6;
    overflow: hidden;
  }

  .lazy-pic-loader--shimmer::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(100deg, transparent 25%, rgba(255, 255, 255, .8) 50%, transparent 75%);
    transform: translateX(-100%);
    animation: lazy-pic-sheen calc(1.8s * var(--lp-speed)) ease-in-out infinite;
  }

  .lazy-pic-loader--spinner::after {
    content: "";
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 3px solid rgba(0, 0, 0, .08);
    border-top-color: var(--lp-color);
    animation: lazy-pic-spin calc(.9s * var(--lp-speed)) linear infinite;
  }

  .lazy-pic-loader--dots { gap: 7px; }

  .lazy-pic-loader--dots i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--lp-color);
    opacity: .35;
    animation: lazy-pic-bounce calc(1.2s * var(--lp-speed)) ease-in-out infinite;
  }

  .lazy-pic-loader--dots i:nth-child(1) { animation-delay: calc(-.24s * var(--lp-speed)); }
  .lazy-pic-loader--dots i:nth-child(2) { animation-delay: calc(-.12s * var(--lp-speed)); }

  .lazy-pic-loader--pulse i {
    position: absolute;
    inset: 0;
    margin: auto;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    border: 2px solid var(--lp-color);
    opacity: 0;
    animation: lazy-pic-pulse calc(2s * var(--lp-speed)) ease-out infinite;
  }

  .lazy-pic-loader--pulse i:nth-child(2) { animation-delay: calc(-1s * var(--lp-speed)); }

  .lazy-pic-loader--wave { gap: 4px; height: auto; }

  .lazy-pic-loader--wave i {
    width: 4px;
    height: 26px;
    border-radius: 999px;
    background: var(--lp-color);
    animation: lazy-pic-wave calc(1.1s * var(--lp-speed)) ease-in-out infinite;
  }

  .lazy-pic-loader--wave i:nth-child(1) { animation-delay: calc(-.4s * var(--lp-speed)); }
  .lazy-pic-loader--wave i:nth-child(2) { animation-delay: calc(-.3s * var(--lp-speed)); }
  .lazy-pic-loader--wave i:nth-child(3) { animation-delay: calc(-.2s * var(--lp-speed)); }
  .lazy-pic-loader--wave i:nth-child(4) { animation-delay: calc(-.1s * var(--lp-speed)); }

  .lazy-pic-loader--progress-bar {
    width: min(220px, 70%);
    height: 8px;
    flex: none;
    border-radius: 999px;
    background: rgba(0, 0, 0, .07);
    overflow: hidden;
  }

  .lazy-pic-loader--progress-bar i {
    width: 45%;
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, transparent, var(--lp-color), transparent);
    animation: lazy-pic-progress calc(1.4s * var(--lp-speed)) ease-in-out infinite;
  }

  .lazy-pic-loader--grid {
    display: grid;
    grid-template-columns: repeat(3, 9px);
    gap: 5px;
    width: auto;
    height: auto;
  }

  .lazy-pic-loader--grid i {
    width: 9px;
    height: 9px;
    border-radius: 3px;
    background: var(--lp-color);
    opacity: .2;
    animation: lazy-pic-grid calc(1.2s * var(--lp-speed)) ease-in-out infinite;
  }

  .lazy-pic-loader--grid i:nth-child(2) { animation-delay: calc(.08s * var(--lp-speed)); }
  .lazy-pic-loader--grid i:nth-child(3) { animation-delay: calc(.16s * var(--lp-speed)); }
  .lazy-pic-loader--grid i:nth-child(4) { animation-delay: calc(.24s * var(--lp-speed)); }
  .lazy-pic-loader--grid i:nth-child(5) { animation-delay: calc(.32s * var(--lp-speed)); }
  .lazy-pic-loader--grid i:nth-child(6) { animation-delay: calc(.4s * var(--lp-speed)); }
  .lazy-pic-loader--grid i:nth-child(7) { animation-delay: calc(.48s * var(--lp-speed)); }
  .lazy-pic-loader--grid i:nth-child(8) { animation-delay: calc(.56s * var(--lp-speed)); }
  .lazy-pic-loader--grid i:nth-child(9) { animation-delay: calc(.64s * var(--lp-speed)); }

  .lazy-pic-loader--scanner {
    overflow: hidden;
    border-radius: 12px;
    background: rgba(0, 0, 0, .035);
  }

  .lazy-pic-loader--scanner::after {
    content: "";
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 30%, var(--lp-color) 50%, transparent 70%);
    opacity: .18;
    transform: translateY(-100%);
    animation: lazy-pic-scan calc(2s * var(--lp-speed)) ease-in-out infinite;
  }

  .lazy-pic-loader--orbit::before,
  .lazy-pic-loader--orbit::after {
    content: "";
    position: absolute;
    border-radius: 50%;
    border: 1px solid var(--lp-color);
  }

  .lazy-pic-loader--orbit::before {
    inset: 0;
    margin: auto;
    width: 40px;
    height: 40px;
    opacity: .3;
    animation: lazy-pic-spin calc(2.4s * var(--lp-speed)) linear infinite;
  }

  .lazy-pic-loader--orbit::after {
    inset: 0;
    margin: auto;
    width: 26px;
    height: 26px;
    opacity: .5;
    border-style: dashed;
    animation: lazy-pic-spin calc(1.6s * var(--lp-speed)) linear infinite reverse;
  }

  .lazy-pic-loader--orbit i {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--lp-color);
  }

  @keyframes lazy-pic-sheen {
    0% { transform: translateX(-100%); }
    60%, 100% { transform: translateX(100%); }
  }

  @keyframes lazy-pic-spin {
    to { transform: rotate(360deg); }
  }

  @keyframes lazy-pic-bounce {
    0%, 100% { opacity: .35; transform: translateY(0) scale(.85); }
    50% { opacity: 1; transform: translateY(-5px) scale(1); }
  }

  @keyframes lazy-pic-pulse {
    0% { opacity: .8; transform: scale(.4); }
    80%, 100% { opacity: 0; transform: scale(1.3); }
  }

  @keyframes lazy-pic-wave {
    0%, 100% { opacity: .45; transform: scaleY(.4); }
    50% { opacity: 1; transform: scaleY(1); }
  }

  @keyframes lazy-pic-progress {
    0% { transform: translateX(-120%); }
    100% { transform: translateX(320%); }
  }

  @keyframes lazy-pic-grid {
    0%, 100% { opacity: .2; transform: scale(.8); }
    50% { opacity: 1; transform: scale(1); }
  }

  @keyframes lazy-pic-scan {
    0% { transform: translateY(-100%); }
    100% { transform: translateY(100%); }
  }

  @media (prefers-reduced-motion: reduce) {
    .lazy-pic-loader,
    .lazy-pic-loader::before,
    .lazy-pic-loader::after,
    .lazy-pic-loader i {
      animation: none !important;
    }

    .lazy-pic-loader--skeleton { background: #f1f3f5; }
    .lazy-pic-loader--pulse i { opacity: .5; transform: scale(.9); }
  }
`;
