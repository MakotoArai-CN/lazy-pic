/**
 * DOM 操作工具函数
 */

export function createElement(tag: string, attributes: Record<string, string> = {}): HTMLElement {
  const element = document.createElement(tag);
  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });
  return element;
}

export function setStyles(element: HTMLElement, styles: Record<string, string>): void {
  Object.entries(styles).forEach(([property, value]) => {
    element.style.setProperty(property, value);
  });
}

export function addClass(element: Element, className: string): void {
  if (!element.classList.contains(className)) {
    element.classList.add(className);
  }
}

export function removeClass(element: Element, className: string): void {
  element.classList.remove(className);
}

export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}

export function getComputedStyleValue(element: Element, property: string): string {
  return getComputedStyle(element).getPropertyValue(property);
}

export function isElementInViewport(element: Element, rootMargin = '0px'): boolean {
  const rect = element.getBoundingClientRect();
  const margin = parseFloat(rootMargin);
  
  return (
    rect.top >= -margin &&
    rect.left >= -margin &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + margin &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth) + margin
  );
}