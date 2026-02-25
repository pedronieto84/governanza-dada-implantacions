import { Component } from '@angular/core';

@Component({
  selector: 'app-glossari-corporatiu',
  templateUrl: './glossari-corporatiu.html',
  styleUrl: './glossari-corporatiu.css',
  standalone: true
})
export class GlossariCorporatiu {
  termes = [
    { 
      terme: 'Interessat', 
      tipus: '', 
      descFormat: '', 
      formula: '', 
      comentaris: '', 
      alies: 'ciutadà, habitant, tercer, obligat', 
      refGovern: '', 
      emailRefGov: '', 
      unitatRefGov: '', 
      respFuncional: '', 
      emailRespFunc: '', 
      unitatRespFunc: '' 
    },
    { terme: 'b', tipus: '', descFormat: '', formula: '', comentaris: '', alies: '', refGovern: '', emailRefGov: '', unitatRefGov: '', respFuncional: '', emailRespFunc: '', unitatRespFunc: '' },
    { terme: 'c', tipus: '', descFormat: '', formula: '', comentaris: '', alies: '', refGovern: '', emailRefGov: '', unitatRefGov: '', respFuncional: '', emailRespFunc: '', unitatRespFunc: '' },
    { terme: 'd', tipus: '', descFormat: '', formula: '', comentaris: '', alies: '', refGovern: '', emailRefGov: '', unitatRefGov: '', respFuncional: '', emailRespFunc: '', unitatRespFunc: '' }
  ];
}
