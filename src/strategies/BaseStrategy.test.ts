import { describe, expect, it } from 'vitest';
import { BaseStrategy } from './BaseStrategy';
import type { LazyPicConfig } from '../types';

class TestStrategy extends BaseStrategy {
  async execute(): Promise<void> {
    return Promise.resolve();
  }

  createMask(element: Element, config: LazyPicConfig): HTMLElement | null {
    return this.createMaskElement(element, config);
  }

  appendContent(container: HTMLElement, content?: string | HTMLElement): void {
    this.appendSafeContent(container, content);
  }
}

describe('BaseStrategy helpers', () => {
  const baseConfig: LazyPicConfig = {
    selector: '.lazy-image'
  };

  it('treats custom string content as plain text', () => {
    const strategy = new TestStrategy(baseConfig);
    const host = document.createElement('div');

    strategy.appendContent(host, '<strong>safe</strong>');

    expect(host.textContent).toBe('<strong>safe</strong>');
    expect(host.innerHTML).toBe('&lt;strong&gt;safe&lt;/strong&gt;');
  });

  it('creates a mask and cleans it up', () => {
    const strategy = new TestStrategy({
      ...baseConfig,
      mask: {
        enabled: true,
        type: 'custom',
        customContent: '<script>alert(1)</script>'
      }
    });

    const wrapper = document.createElement('div');
    const img = document.createElement('img');
    wrapper.appendChild(img);
    document.body.appendChild(wrapper);

    const mask = strategy.createMask(img, {
      ...baseConfig,
      mask: {
        enabled: true,
        type: 'custom',
        customContent: '<script>alert(1)</script>'
      }
    });

    expect(mask).not.toBeNull();
    expect(mask?.textContent).toBe('<script>alert(1)</script>');
    expect(mask?.innerHTML).toBe('&lt;script&gt;alert(1)&lt;/script&gt;');

    strategy.cleanup(img);
    expect(wrapper.querySelector('.lazy-pic-mask-overlay')).toBeNull();
  });
});
