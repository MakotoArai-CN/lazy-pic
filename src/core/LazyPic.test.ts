import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LazyPic } from './LazyPic';
import { TwoImageStrategy } from '../strategies/TwoImageStrategy';

class FakeIntersectionObserver {
  static instances: FakeIntersectionObserver[] = [];

  callback: (entries: Array<{ target: Element; isIntersecting: boolean }>) => void;
  options: IntersectionObserverInit | undefined;
  observed = new Set<Element>();

  constructor(
    callback: (entries: Array<{ target: Element; isIntersecting: boolean }>) => void,
    options?: IntersectionObserverInit
  ) {
    this.callback = callback;
    this.options = options;
    FakeIntersectionObserver.instances.push(this);
  }

  observe(element: Element): void {
    this.observed.add(element);
  }

  unobserve(element: Element): void {
    this.observed.delete(element);
  }

  disconnect(): void {
    this.observed.clear();
  }

  emit(elements: Element[]): void {
    this.callback(elements.map(target => ({ target, isIntersecting: true })));
  }
}

describe('LazyPic orchestration', () => {
  beforeEach(() => {
    document.body.innerHTML = '<img class="item" alt=""><img class="item" alt="">';
    FakeIntersectionObserver.instances = [];
    vi.stubGlobal('IntersectionObserver', FakeIntersectionObserver);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    document.body.innerHTML = '';
  });

  it('dispatches every intersecting element concurrently', async () => {
    const resolvers: Array<() => void> = [];
    const execute = vi
      .spyOn(TwoImageStrategy.prototype, 'execute')
      .mockImplementation(() => new Promise<void>(resolve => resolvers.push(resolve)));

    const instance = new LazyPic({ selector: '.item' });
    instance.init();

    const observer = FakeIntersectionObserver.instances[0];
    const elements = Array.from(document.querySelectorAll('.item'));
    expect(observer.options).toMatchObject({ rootMargin: '200px', threshold: 0.01 });

    observer.emit(elements);
    await Promise.resolve();

    expect(execute).toHaveBeenCalledTimes(2);
    expect(observer.observed.size).toBe(0);

    resolvers.forEach(resolve => resolve());
    await Promise.resolve();

    instance.destroy();
    execute.mockRestore();
  });

  it('does not run strategy cleanup when an element is simply unobserved', async () => {
    const cleanup = vi.spyOn(TwoImageStrategy.prototype, 'cleanup');
    vi.spyOn(TwoImageStrategy.prototype, 'execute').mockResolvedValue(undefined);

    const instance = new LazyPic({ selector: '.item' });
    instance.init();

    const observer = FakeIntersectionObserver.instances[0];
    const elements = Array.from(document.querySelectorAll('.item'));
    observer.emit(elements);
    await Promise.resolve();

    expect(cleanup).not.toHaveBeenCalled();

    instance.destroy();
    expect(cleanup).toHaveBeenCalledTimes(2);
  });

  it('falls back to loading everything when IntersectionObserver is unavailable', async () => {
    vi.stubGlobal('IntersectionObserver', undefined);
    const execute = vi.spyOn(TwoImageStrategy.prototype, 'execute').mockResolvedValue(undefined);

    const instance = new LazyPic({ selector: '.item' });
    instance.init();

    expect(execute).toHaveBeenCalledTimes(2);
    instance.destroy();
  });
});
