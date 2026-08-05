import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  NgZone,
  OnChanges,
  OnDestroy,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import {
  Chart,
  Filler,
  Legend,
  LineElement,
  PointElement,
  RadarController,
  RadialLinearScale,
  Tooltip,
} from 'chart.js';

Chart.register(RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend);

/** Radar chart reutilitzable (Chart.js) per representar puntuacions d'àmbits/processos. */
@Component({
  selector: 'app-radar-chart',
  template: `<canvas #canvas></canvas>`,
  styles: [
    `
      :host {
        display: block;
        width: 100%;
      }
      canvas {
        width: 100% !important;
      }
    `,
  ],
})
export class RadarChart implements AfterViewInit, OnChanges, OnDestroy {
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() max = 4;
  @Input() color = '#087f5b';

  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  constructor(private zone: NgZone) {}

  ngAfterViewInit(): void {
    // Chart.js registra ResizeObserver/rAF que no han de disparar change detection d'Angular.
    this.zone.runOutsideAngular(() => {
      this.chart = new Chart(this.canvasRef.nativeElement, {
        type: 'radar',
        data: this.buildData(),
        options: this.buildOptions(),
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chart) {
      return;
    }
    this.zone.runOutsideAngular(() => {
      if (changes['labels'] || changes['data'] || changes['color']) {
        this.chart!.data = this.buildData();
      }
      if (changes['max']) {
        this.chart!.options = this.buildOptions();
      }
      this.chart!.update();
    });
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private buildData() {
    return {
      labels: this.labels,
      datasets: [
        {
          data: this.data,
          backgroundColor: this.hexToRgba(this.color, 0.22),
          borderColor: this.color,
          borderWidth: 2,
          pointBackgroundColor: '#fff',
          pointBorderColor: this.color,
          pointBorderWidth: 2,
          pointRadius: 3,
        },
      ],
    };
  }

  private buildOptions() {
    return {
      responsive: true,
      maintainAspectRatio: true,
      animation: { duration: 300 },
      plugins: { legend: { display: false } },
      scales: {
        r: {
          min: 0,
          max: this.max,
          ticks: { stepSize: 1, showLabelBackdrop: false },
          pointLabels: { font: { size: 10, weight: 700 } },
          grid: { color: '#c7d4cf' },
          angleLines: { color: '#c7d4cf' },
        },
      },
    };
  }

  private hexToRgba(hex: string, alpha: number): string {
    const parsed = hex.replace('#', '');
    const bigint = parseInt(parsed, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
