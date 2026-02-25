import { Component } from '@angular/core';

@Component({
  selector: 'app-catalogacion',
  templateUrl: './catalogacion.html',
  styleUrl: './catalogacion.css',
  standalone: true
})
export class Catalogacion {
  dades = [
    { id: 1, nom: 'Habitants', desc: '', sistema: 'Padró', terme: '', tipus: 'Dada mestre', infoGeo: 'NO', infoCiu: 'SÍ', infoEmp: 'NO', infoGen: 'SÍ', llindar: 'Per sota de 100 registres', esbiaix: 'No presenta esbiaixos', qualitat: '', proteccio: 'Personals', autoOp: '', visibilitat: 'Intern per l\'ens local' },
    { id: 2, nom: 'Interessats', desc: '', sistema: 'Gestor expedients', terme: '', tipus: 'Dada de negoci', infoGeo: '', infoCiu: '', infoEmp: '', infoGen: '', llindar: '', esbiaix: 'En cas d\'estrangers i empreses les dades...', qualitat: '', proteccio: 'Personals', autoOp: '', visibilitat: 'Intern per l\'ens local' },
    { id: 3, nom: 'Obligats', desc: '', sistema: 'Gestió comptable', terme: '', tipus: 'Dada de negoci', infoGeo: '', infoCiu: '', infoEmp: '', infoGen: '', llindar: '', esbiaix: '', qualitat: '', proteccio: 'Personals', autoOp: '', visibilitat: 'Intern per l\'ens local' },
    { id: 4, nom: 'Tercers', desc: '', sistema: 'Padró', terme: '', tipus: '', infoGeo: '', infoCiu: '', infoEmp: '', infoGen: '', llindar: '', esbiaix: '', qualitat: '', proteccio: 'Personals', autoOp: '', visibilitat: 'Intern per l\'ens local' }
  ];
}
