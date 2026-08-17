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
import { ArcElement, Chart, Legend, PieController, Tooltip } from 'chart.js';

Chart.register(PieController, ArcElement, Tooltip, Legend);

@Component({
  selector: 'app-pie-chart',
  template: `<canvas #canvas></canvas>`,
  styles: `
    :host { display: block; width: 100%; max-width: 24rem; margin: 0 auto; }
    canvas { width: 100% !important; }
  `,
})
export class PieChart implements AfterViewInit, OnChanges, OnDestroy {
  @Input() labels: string[] = [];
  @Input() data: number[] = [];
  @Input() colors: string[] = ['#087f5b', '#d9e2df'];

  @ViewChild('canvas') private canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart?: Chart;

  constructor(private readonly zone: NgZone) {}

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      this.chart = new Chart(this.canvasRef.nativeElement, {
        type: 'pie',
        data: this.buildData(),
        options: {
          responsive: true,
          maintainAspectRatio: true,
          animation: { duration: 300 },
          plugins: {
            legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } },
          },
        },
      });
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (!this.chart) return;
    if (changes['labels'] || changes['data'] || changes['colors']) {
      this.zone.runOutsideAngular(() => {
        this.chart!.data = this.buildData();
        this.chart!.update();
      });
    }
  }

  ngOnDestroy(): void {
    this.chart?.destroy();
  }

  private buildData() {
    return {
      labels: this.labels,
      datasets: [{ data: this.data, backgroundColor: this.colors, borderWidth: 0 }],
    };
  }
}