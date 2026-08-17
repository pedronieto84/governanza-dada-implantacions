import { Component, computed } from '@angular/core';

import { PieChart } from '../../../shared/pie-chart/pie-chart';
import { COMPLETION_KEYS, Inventari3bData, InventariRow } from '../inventari-3b.model';
import { Inventari3bService } from '../inventari-3b.service';

export interface InventariQualityMetrics {
  systems: number;
  systemsCompletion: number;
  systemsRelated: number;
  systemsWithout: number;
  domains: number;
  domainsCompletion: number;
  domainsRelated: number;
  domainsWithout: number;
  datasets: number;
  datasetsCompletion: number;
  datasetsRelationRate: number;
  validRelations: number;
  relationErrors: number;
}

export function calculateInventariQuality(data: Inventari3bData): InventariQualityMetrics {
  const systemNames = new Set(data.sistemes.map((row) => row['nom']).filter(Boolean));
  const domainNames = new Set(data.dominis.map((row) => row['nom']).filter(Boolean));
  const datasetNames = new Set(data.conjunts.map((row) => row['nom']).filter(Boolean));
  const validRelations = data.relacions.filter(
    (row) => systemNames.has(row['sistema']) && datasetNames.has(row['conjunt']),
  );
  const systemsRelated = new Set(validRelations.map((row) => row['sistema'])).size;
  const domainsRelated = new Set(
    data.conjunts.map((row) => row['domini']).filter((name) => domainNames.has(name)),
  ).size;
  const systems = data.sistemes.filter((row) => row['nom']);
  const domains = data.dominis.filter((row) => row['nom']);
  const datasets = data.conjunts.filter((row) => row['nom']);
  const relationErrors = data.relacions.filter(
    (row) =>
      (row['sistema'] || row['conjunt']) &&
      (!systemNames.has(row['sistema']) || !datasetNames.has(row['conjunt'])),
  ).length;

  return {
    systems: systems.length,
    systemsCompletion: completion(systems, COMPLETION_KEYS.sistemes),
    systemsRelated,
    systemsWithout: Math.max(0, systems.length - systemsRelated),
    domains: domains.length,
    domainsCompletion: completion(domains, COMPLETION_KEYS.dominis),
    domainsRelated,
    domainsWithout: Math.max(0, domains.length - domainsRelated),
    datasets: datasets.length,
    datasetsCompletion: completion(datasets, COMPLETION_KEYS.conjunts),
    datasetsRelationRate: datasets.length ? validRelations.length / datasets.length : 0,
    validRelations: validRelations.length,
    relationErrors,
  };
}

function completion(rows: InventariRow[], keys: readonly string[]): number {
  if (!rows.length || !keys.length) return 0;
  const completed = rows.reduce(
    (total, row) => total + keys.filter((key) => !!row[key]).length,
    0,
  );
  return completed / (rows.length * keys.length);
}

@Component({
  selector: 'app-qualitat-inventari',
  imports: [PieChart],
  templateUrl: './qualitat.html',
  styleUrl: './qualitat.css',
})
export class QualitatInventari {
  readonly systemLabels = ['Amb Conjunts de dades', 'Sense Conjunts de dades'];
  readonly domainLabels = ['Amb Conjunts de dades', 'Sense Conjunts de dades'];

  readonly metrics = computed(() => calculateInventariQuality(this.inventari.data()));

  readonly systemChartData = computed(() => [
    this.metrics().systemsRelated,
    this.metrics().systemsWithout,
  ]);
  readonly domainChartData = computed(() => [
    this.metrics().domainsRelated,
    this.metrics().domainsWithout,
  ]);

  constructor(readonly inventari: Inventari3bService) {}

  percent(value: number): string {
    return `${(value * 100).toFixed(1).replace('.', ',')}%`;
  }

}