import { describe, expect, it } from 'vitest';

import { emptyInventari3b, riskGrade } from '../inventari-3b.model';
import { calculateInventariQuality } from './qualitat';

describe('Inventari 3B formulas', () => {
  it('maps the Excel risk selections to their numeric grade', () => {
    expect(riskGrade('Probabilitat: Mitja\nImpacte: Moderat (3)')).toBe(3);
    expect(riskGrade('')).toBe(0);
  });

  it('calculates completion and valid relationships from the four inventories', () => {
    const data = emptyInventari3b();
    data.sistemes = [
      { nom: 'Sistema A', descripcio: 'Descripció' },
      { nom: 'Sistema B' },
    ];
    data.dominis = [{ nom: 'Domini A', descripcio: 'Descripció' }];
    data.conjunts = [
      { nom: 'Conjunt A', domini: 'Domini A', descripcio: 'Descripció' },
      { nom: 'Conjunt B' },
    ];
    data.relacions = [
      { sistema: 'Sistema A', conjunt: 'Conjunt A' },
      { sistema: 'Sistema inexistent', conjunt: 'Conjunt B' },
    ];

    const result = calculateInventariQuality(data);

    expect(result.systems).toBe(2);
    expect(result.systemsRelated).toBe(1);
    expect(result.systemsWithout).toBe(1);
    expect(result.domainsRelated).toBe(1);
    expect(result.datasets).toBe(2);
    expect(result.datasetsRelationRate).toBe(0.5);
    expect(result.validRelations).toBe(1);
    expect(result.relationErrors).toBe(1);
    expect(result.systemsCompletion).toBeGreaterThan(0);
    expect(result.systemsCompletion).toBeLessThan(1);
  });
});