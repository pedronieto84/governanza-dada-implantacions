import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { StickyStackDirective } from '../../shared/sticky-stack.directive';

@Component({
  selector: 'app-glossari',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, StickyStackDirective],
  templateUrl: './glossari.html',
  styleUrl: './glossari.css'
})
export class Glossari {}
