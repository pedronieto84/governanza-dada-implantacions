import { Component } from '@angular/core';

@Component({
  selector: 'app-resultados',
  templateUrl: './resultados.html',
  styleUrl: './resultados.css',
  standalone: true
})
export class Resultados {
  // Mock data for results layout based on the image provided
  resumen = [
    { name: 'Govern', scores: [
        { label: 'Establiment d\'estàndards, polítiques...', value: 2 },
        { label: 'Establiment d\'estratègies de dades', value: 4 },
        { label: 'Establiment d\'estructures organitzacionals', value: 3 },
        { label: 'Gestió de recursos humans', value: 3.7 }
      ], avg: 3.2 
    },
    { name: 'Gestió de dades', scores: [
        { label: 'Gestió de seguretat de dades', value: 2 },
        { label: 'Gestió de dades històriques', value: 1 },
        { label: 'Gestió de fonts i destinacions de dades', value: 1.5 },
        { label: 'Gestió de la integració de les dades', value: 1 },
        { label: 'Gestió de Dades Mestre i Dades de Referència', value: 2 }
      ], avg: 1.5
    },
    { name: 'Qualitat de la dada', scores: [
        { label: 'Establiment d\'estàndards, polítiques...', value: 2 },
        { label: 'Control i monitorització de la qualitat...', value: 1 },
        { label: 'Planificació de la qualitat de les dades', value: 1 }
      ], avg: 1.3
    }
  ];
}
