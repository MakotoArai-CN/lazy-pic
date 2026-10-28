import { afterEach, describe, expect, it, vi } from 'vitest';
import { TwoImageStrategy } from './TwoImageStrategy';
import type { LazyPicConfig } from '../types';

const config: LazyPicConfig = {
  selector: '.main',
  strategy: 'dual-image'
};

function makeMarkup(): { wrapper: HTMLElement; thumbnail: HTMLImageElement; main: HTMLImageElement } {
  const wrapper = document.createElement('div');
  const thumbnail = document.createElement('img');
  thumbnail.className = 'thumbnail';
  thumbnail.src = 'thumb.jpg';
  const main = document.createElement('img');
  main.className = 'main';
  main.src = 'full.jpg';
  wrapper.append(thumbnail, main);
  document.body.appendChild(wrapper);
  return { wrapper, thumbnail, main };
}

describe('TwoImageStrategy', () => {
  afterEach(() => {
    document.body.innerHTML = '';
    vi.restoreAllMocks();
  });

  it('marks an unloaded image as pending but keeps the thumbnail visible', () => {
    const { thumbnail, main } = makeMarkup();
    const strategy = new TwoImageStrategy(config);

    strategy.prepare?.(main, config);

    expect(main.classList.contains('lazy-pic-pending')).toBe(true);
    expect(thumbnail.style.display).toBe('');
    expect(thumbnail.style.visibility).toBe('');
  });

  it('hides the thumbnail in place instead of collapsing layout', async () => {
    const { wrapper, thumbnail, main } = makeMarkup();
    Object.defineProperty(main, 'complete', { configurable: true, value: true });
    Object.defineProperty(main, 'naturalWidth', { configurable: true, value: 800 });

    const onLoad = vi.fn();
    const strategy = new TwoImageStrategy({ ...config, onLoad });
    strategy.prepare?.(main, config);

    await strategy.execute(main, { ...config, onLoad });

    expect(onLoad).toHaveBeenCalledWith(main);
    expect(main.classList.contains('lazy-pic-loaded')).toBe(true);
    expect(thumbnail.style.display).not.toBe('none');
    expect(thumbnail.style.visibility).toBe('hidden');
    expect(thumbnail.style.opacity).toBe('0');

    strategy.cleanup(main);
    expect(wrapper.querySelector('img')?.style.visibility).toBe('');
    expect(thumbnail.style.opacity).toBe('');
  });
});
