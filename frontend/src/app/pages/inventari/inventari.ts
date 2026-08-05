import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { StickyStackDirective } from '../../shared/sticky-stack.directive';

@Component({
  selector: 'app-inventari',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, StickyStackDirective],
  templateUrl: './inventari.html',
  styleUrl: './inventari.css'
})
export class Inventari {}
