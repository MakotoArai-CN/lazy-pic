import { describe, expect, it } from 'vitest';
import { animationStyles, createLoader } from './index';

describe('placeholder loaders', () => {
  it('maps legacy animation names onto the compact loader set', () => {
    const loader = createLoader('radar', '#123456', 2);

    expect(loader.className).toContain('lazy-pic-loader--orbit');
    expect(loader.style.getPropertyValue('--lp-color')).toBe('#123456');
    expect(loader.style.getPropertyValue('--lp-speed')).toBe('0.5');
    expect(loader.querySelectorAll('i')).toHaveLength(1);
  });

  it('falls back to the skeleton loader for unknown values', () => {
    const loader = createLoader('does-not-exist');

    expect(loader.className).toContain('lazy-pic-loader--skeleton');
    expect(loader.querySelectorAll('i')).toHaveLength(3);
  });

  it('injects one shared stylesheet instead of per-loader inline CSS', () => {
    expect(animationStyles).toContain('@keyframes lazy-pic-sheen');
    expect(animationStyles).toContain('prefers-reduced-motion');
    expect(animationStyles).not.toContain('lazy-pic-full-skeleton');
  });
});
