import { Directive, ElementRef, Input, AfterViewInit, OnDestroy } from '@angular/core';

/**
 * Makes the host element stick to the top of the page while scrolling, stacking
 * below any other `stickyStack` elements that come before it in the DOM.
 * Slot 0 sticks at the very top; slot N sticks right below the combined
 * (dynamically measured) height of slots 0..N-1, so nav bars/table headers
 * "stack" on top of each other instead of overlapping.
 */
@Directive({
  selector: '[stickyStack]',
  standalone: true,
})
export class StickyStackDirective implements AfterViewInit, OnDestroy {
  @Input({ required: true }) stickyStack!: number;

  private resizeObserver?: ResizeObserver;

  constructor(private elementRef: ElementRef<HTMLElement>) {}

  ngAfterViewInit(): void {
    const host = this.elementRef.nativeElement;
    const slot = this.stickyStack;
    const offset = Array.from({ length: slot }, (_, i) => `var(--sticky-h-${i}, 0px)`).join(' + ') || '0px';

    host.style.position = 'sticky';
    host.style.top = slot === 0 ? '0px' : `calc(${offset})`;
    host.style.zIndex = `${30 - slot}`;

    const updateHeight = () => {
      document.documentElement.style.setProperty(`--sticky-h-${slot}`, `${host.getBoundingClientRect().height}px`);
    };
    updateHeight();
    this.resizeObserver = new ResizeObserver(updateHeight);
    this.resizeObserver.observe(host);
  }

  ngOnDestroy(): void {
    this.resizeObserver?.disconnect();
    document.documentElement.style.setProperty(`--sticky-h-${this.stickyStack}`, '0px');
  }
}
