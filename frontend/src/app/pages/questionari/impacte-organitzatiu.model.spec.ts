import { describe, expect, it } from 'vitest';

import {
  IMPACTE_ACTIONS,
  calculateImpacteResults,
  priorityForImpacteAnswer,
  scoreForImpacteAnswer,
  sumImpacteDificultat,
} from './impacte-organitzatiu.model';

describe('impacte organitzatiu model', () => {
  it('keeps repeated Excel codes as distinct actions', () => {
    const md01Actions = IMPACTE_ACTIONS.filter((action) => action.codi === 'MD01');

    expect(md01Actions).toHaveLength(4);
    expect(new Set(md01Actions.map((action) => action.key)).size).toBe(4);
  });

  it('provides a diagnostic question for every Excel action', () => {
    expect(IMPACTE_ACTIONS).toHaveLength(53);
    expect(IMPACTE_ACTIONS.every((action) => action.pregunta?.endsWith('?'))).toBe(true);
  });

  it('accepts only maturity scores from 1 to 4', () => {
    expect(scoreForImpacteAnswer('1')).toBe(1);
    expect(scoreForImpacteAnswer('4')).toBe(4);
    expect(scoreForImpacteAnswer(undefined)).toBe(0);
    expect(scoreForImpacteAnswer('5')).toBe(0);
  });

  it('reproduces plan priority and impact plus difficulty formulas', () => {
    expect(priorityForImpacteAnswer('1')).toBe(1);
    expect(priorityForImpacteAnswer('4')).toBe('');
    expect(priorityForImpacteAnswer(undefined)).toBe('');
    expect(sumImpacteDificultat('1 - Alt', '3 - Alta')).toBe(4);
    expect(sumImpacteDificultat('', '3 - Alta')).toBe('');
  });

  it('averages answered actions by process and ambit', () => {
    const cultureActions = IMPACTE_ACTIONS.filter(
      (action) => action.proces === 'Cultura i Sensibilització',
    );
    const answers = {
      [cultureActions[0].key]: '2',
      [cultureActions[1].key]: '4',
    };

    const persones = calculateImpacteResults(answers).find(
      (ambit) => ambit.nom === 'Persones',
    );
    const culture = persones?.processos.find(
      (proces) => proces.nom === 'Cultura i Sensibilització',
    );

    expect(culture?.puntuacio).toBe(3);
    expect(persones?.puntuacio).toBe(3);
  });
});
