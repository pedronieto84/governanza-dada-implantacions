import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { StickyStackDirective } from '../../shared/sticky-stack.directive';

@Component({
  selector: 'app-inventari',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, StickyStackDirective],
  templateUrl: './inventari.html',
  styleUrl: './inventari.css'
})
export class Inventari {
  infoTooltipVisible = false;
  infoTooltipLeft = 0;
  infoTooltipTop = 0;

  showInfoTooltip(event: Event): void {
    const target = event.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    const halfTooltipWidth = 88;
    this.infoTooltipLeft = Math.min(
      Math.max(rect.left + rect.width / 2, halfTooltipWidth),
      window.innerWidth - halfTooltipWidth,
    );
    this.infoTooltipTop = rect.bottom + 8;
    this.infoTooltipVisible = true;
  }

  hideInfoTooltip(): void {
    this.infoTooltipVisible = false;
  }
}
