import { Component } from '@angular/core';

@Component({
  selector: 'app-relacio-inventaris',
  templateUrl: './relacio-inventaris.html',
  styleUrl: './relacio-inventaris.css',
})
export class RelacioInventaris {
  readonly references = [
    { inventari: 'Sistemes', referencia: 'Tarragona', detall: "El sistema d'informació apareix de manera recurrent com a font dels conjunts de dades. S'hi incorpora descripció, informació tècnica, proveïdor, administrador i rol." },
    { inventari: 'Domini de dades', referencia: 'Tarragona', detall: "Agrupa conjunts segons àmbits funcionals. S'hi traslladen el domini, la descripció, l'àmbit i l'àrea propietària." },
    { inventari: 'Conjunt de dades', referencia: 'Tarragona + Mataró', detall: "El conjunt de dades és l'eix de l'inventari, amb atributs de governança, sensibilitat, responsabilitats, cicle de vida i riscos." },
    { inventari: 'Entitats', referencia: 'Sant Cugat', detall: "Referent per al nivell d'unitat informativa en versions prèvies de la plantilla." },
    { inventari: 'Rel. Conjunts-Entitats', referencia: 'Elaboració pròpia', detall: 'Taula concebuda per garantir la traçabilitat entre conjunts de dades i entitats en versions prèvies.' },
    { inventari: 'Atributs', referencia: 'Sant Cugat', detall: 'Referent per descriure tipus, obligatorietat, qualitat, dades personals, anonimització i reutilització a nivell de camp.' },
  ];
}