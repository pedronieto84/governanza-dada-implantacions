import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { StickyStackDirective } from '../../shared/sticky-stack.directive';

@Component({
  selector: 'app-questionari',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, StickyStackDirective],
  templateUrl: './questionari.html',
  styleUrl: './questionari.css'
})
export class Questionari {}
