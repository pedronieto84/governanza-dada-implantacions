import { Component } from '@angular/core';

@Component({
  selector: 'app-instruccions-inventari',
  templateUrl: './instruccions.html',
  styleUrl: './instruccions.css',
})
export class InstruccionsInventari {
  readonly sheets = [
    ['Sistemes', "Registre i descripció dels sistemes d'informació de l'ens local vinculats a les dades."],
    ['Dominis de dades', 'Recull els dominis de dades habituals. Es poden afegir dominis que no figurin a la proposta inicial.'],
    ['Conjunts de dades', 'Identificació, registre i descripció dels conjunts de dades associats a cada domini.'],
    ['Rel. Conjunts-Sistemes', 'Documentació i validació de les relacions entre conjunts de dades i sistemes.'],
    ['Qualitat', "Avaluació automàtica de la completitud i la coherència de l'inventari."],
    ['Llegenda', 'Instruccions per completar correctament totes les columnes.'],
    ['Relació inventaris', 'Fonts i referents tinguts en compte en el disseny de la plantilla.'],
    ['Llistes', 'Valors de referència vàlids per a les columnes amb valors restringits.'],
  ] as const;
}