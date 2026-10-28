import { describe, expect, it } from 'vitest';
import { easingToCss, transitionDuration } from './animation';

describe('motion primitives', () => {
  it('maps public easing names to CSS timing functions', () => {
    expect(easingToCss('linear')).toBe('linear');
    expect(easingToCss('ease-out')).toContain('cubic-bezier');
    expect(easingToCss('unknown')).toBe(easingToCss('ease-out'));
  });

  it('keeps durations in a responsive range', () => {
    expect(transitionDuration(undefined)).toBe(600);
    expect(transitionDuration(0)).toBe(600);
    expect(transitionDuration(80)).toBe(120);
    expect(transitionDuration(5000)).toBe(2000);
    expect(transitionDuration(500)).toBe(500);
  });
});
