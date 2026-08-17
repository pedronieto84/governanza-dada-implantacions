import { Component } from '@angular/core';
import {
  ALT_VALOR, AMBITS, ANALISI_RISCOS, ARQUITECTURA_CLOUD, CADENCIA, CRITICITAT,
  DADES_OBERTES, ESTAT_SISTEMES, ORIGENS, PERSISTENCIA, RETENCIO, REUTILITZACIO,
  SI_NO, TIPUS_CONJUNT, TIPUS_SERVEI,
} from '../inventari-3b.model';

@Component({
  selector: 'app-llistes',
  imports: [],
  templateUrl: './llistes.html',
  styleUrl: './llistes.css',
})
export class Llistes {
  readonly lists = [
    ['Tipus de servei', TIPUS_SERVEI], ['Arquitectura cloud', ARQUITECTURA_CLOUD],
    ['Estat Sistemes', ESTAT_SISTEMES], ['Criticitat', CRITICITAT], ['Àmbit', AMBITS],
    ['Tipus Conjunt', TIPUS_CONJUNT], ['Sí / No', SI_NO], ["Dades d'alt valor", ALT_VALOR],
    ['Cadència', CADENCIA], ['Origen', ORIGENS], ['Persistència', PERSISTENCIA],
    ['Retenció', RETENCIO], ['Dades obertes', DADES_OBERTES], ['Reutilització', REUTILITZACIO],
    ['Anàlisi de riscos', ANALISI_RISCOS],
  ] as const;
}
