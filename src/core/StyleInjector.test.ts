import { beforeEach, describe, expect, it } from 'vitest';
import { StyleInjector } from './StyleInjector';

describe('StyleInjector', () => {
  beforeEach(() => {
    document.head.innerHTML = '';
    StyleInjector.getInstance().removeStyles();
  });

  it('injects styles only once', () => {
    const injector = StyleInjector.getInstance();

    injector.injectStyles();
    injector.injectStyles();

    expect(document.head.querySelectorAll('#lazy-pic-styles')).toHaveLength(1);
  });

  it('removes injected styles', () => {
    const injector = StyleInjector.getInstance();

    injector.injectStyles();
    injector.removeStyles();

    expect(document.head.querySelector('#lazy-pic-styles')).toBeNull();
  });
});
