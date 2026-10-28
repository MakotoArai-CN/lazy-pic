/**
 * Motion primitives built on the Web Animations API.
 *
 * The previous implementation drove every property through requestAnimationFrame
 * and rewrote `style.transform` on every frame. That costs a layout/style
 * recalculation per property per frame and is the main source of jank on
 * image-heavy pages. WAAPI hands the animation to the compositor and lets the
 * browser batch style updates automatically.
 */

export interface PlayOptions {
  duration?: number;
  easing?: string;
  delay?: number;
  /** Commit the final keyframe to inline styles before cancelling. Defaults to true. */
  commit?: boolean;
}

const CSS_EASINGS: Record<string, string> = {
  linear: 'linear',
  ease: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  'ease-in': 'cubic-bezier(0.42, 0, 1, 1)',
  'ease-out': 'cubic-bezier(0.22, 1, 0.36, 1)',
  'ease-in-out': 'cubic-bezier(0.65, 0, 0.35, 1)',
  bounce: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  elastic: 'cubic-bezier(0.16, 1, 0.3, 1)'
};

const runningAnimations = new WeakMap<Element, Set<Animation>>();
let reducedMotion: boolean | undefined;

/** Maps a public easing name to a compositor-friendly CSS timing function. */
export function easingToCss(easing = 'ease-out'): string {
  return CSS_EASINGS[easing] || CSS_EASINGS['ease-out'];
}

/** Keeps user-provided durations in a range that still feels responsive. */
export function transitionDuration(value?: number): number {
  if (!value || !Number.isFinite(value)) {
    return 600;
  }
  return Math.min(Math.max(value, 120), 2000);
}

/** True when the user asked the OS to reduce motion. */
export function prefersReducedMotion(): boolean {
  if (reducedMotion === undefined) {
    reducedMotion =
      typeof window !== 'undefined' &&
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }
  return reducedMotion;
}

/** Cancels animations started by LazyPic on an element. */
export function cancelAnimations(element: Element): void {
  const animations = runningAnimations.get(element);
  if (!animations) {
    return;
  }

  animations.forEach(animation => {
    try {
      animation.cancel();
    } catch {
      // The animation may already have finished.
    }
  });
  animations.clear();
  runningAnimations.delete(element);
}

/**
 * Plays a finite keyframe animation. Resolves with `true` when the animation
 * ran, or `false` when it was skipped (reduced motion, unsupported browser or
 * zero duration) so callers can apply the final state themselves.
 */
export function play(
  element: Element,
  keyframes: Keyframe[],
  options: PlayOptions = {}
): Promise<boolean> {
  const duration = options.duration ?? 600;

  if (duration <= 0 || prefersReducedMotion() || typeof element.animate !== 'function') {
    return Promise.resolve(false);
  }

  let animation: Animation;
  try {
    animation = element.animate(keyframes, {
      duration,
      easing: easingToCss(options.easing),
      delay: options.delay ?? 0,
      fill: 'both'
    });
  } catch {
    return Promise.resolve(false);
  }

  let animations = runningAnimations.get(element);
  if (!animations) {
    animations = new Set();
    runningAnimations.set(element, animations);
  }
  animations.add(animation);

  return animation.finished
    .then(() => {
      animations!.delete(animation);
      if (options.commit !== false && typeof animation.commitStyles === 'function') {
        try {
          animation.commitStyles();
        } catch {
          // Elements can become disconnected mid-animation.
        }
      }
      animation.cancel();
      return true;
    })
    .catch(() => {
      animations!.delete(animation);
      try {
        animation.cancel();
      } catch {
        // Already cancelled.
      }
      return false;
    });
}

/** Decodes an image off the main thread before it is revealed. */
export async function decodeImage(image: HTMLImageElement): Promise<void> {
  if (typeof image.decode !== 'function') {
    return;
  }

  await new Promise<void>(resolve => {
    let settled = false;
    const finish = () => {
      if (settled) {
        return;
      }
      settled = true;
      window.clearTimeout(timeout);
      resolve();
    };
    const timeout = window.setTimeout(finish, 3000);

    image.decode().then(finish, finish);
  });
}

/**
 * Optional post-load flourish. These animations start and end at the element's
 * natural state, so they never leave inline styles behind.
 */
export function createCompletionEffect(
  element: HTMLElement,
  type: 'pulse' | 'glow' | 'bounce' | 'flash' | 'ripple' | 'sparkle' | 'rainbow',
  options: { duration: number; intensity: number; color?: string }
): Promise<void> {
  const duration = Math.min(Math.max(options.duration || 500, 160), 2000);
  const intensity = Math.max(options.intensity || 1, 0);
  const color = options.color || '#4CAF50';
  const base = { duration, commit: false };

  switch (type) {
    case 'pulse':
      return runIdentity(element, [
        { transform: 'scale(1)' },
        { transform: `scale(${1 + intensity * 0.035})`, offset: 0.5 },
        { transform: 'scale(1)' }
      ], base);
    case 'bounce':
      return runIdentity(element, [
        { transform: 'translate3d(0, 0, 0)' },
        { transform: `translate3d(0, ${-6 * intensity}px, 0)`, offset: 0.45 },
        { transform: 'translate3d(0, 0, 0)' }
      ], { ...base, easing: 'bounce' });
    case 'flash':
      return runIdentity(element, [
        { filter: 'brightness(1)' },
        { filter: `brightness(${1 + 0.18 * intensity})`, offset: 0.3 },
        { filter: 'brightness(1)' }
      ], base);
    case 'rainbow':
      return runIdentity(element, [
        { filter: 'hue-rotate(0deg) saturate(1)' },
        { filter: `hue-rotate(90deg) saturate(${1 + intensity * 0.4})`, offset: 0.5 },
        { filter: 'hue-rotate(0deg) saturate(1)' }
      ], base);
    case 'ripple':
    case 'sparkle':
      return runIdentity(element, [
        { boxShadow: '0 0 0 0 transparent' },
        { boxShadow: `0 0 ${18 * intensity}px ${color}`, offset: 0.35 },
        { boxShadow: '0 0 0 0 transparent' }
      ], base);
    case 'glow':
    default:
      return runIdentity(element, [
        { boxShadow: '0 0 0 0 transparent' },
        { boxShadow: `0 0 ${24 * intensity}px ${color}`, offset: 0.4 },
        { boxShadow: '0 0 0 0 transparent' }
      ], base);
  }
}

function runIdentity(
  element: HTMLElement,
  keyframes: Keyframe[],
  options: PlayOptions
): Promise<void> {
  return play(element, keyframes, options).then(() => undefined);
}
