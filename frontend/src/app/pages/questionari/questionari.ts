import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-questionari',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './questionari.html',
  styleUrl: './questionari.css'
})
export class Questionari {}
