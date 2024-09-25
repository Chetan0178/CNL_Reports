import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-mychart',
  templateUrl: './mychart.component.html',
  styleUrls: ['./mychart.component.css']
})
export class MychartComponent implements OnInit {
  @ViewChild('chartCanvas', { static: true }) chartCanvas!: ElementRef<HTMLCanvasElement>; // Get the canvas reference
  private chartInstance: Chart | null = null;

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.fetchData(); // Fetch the data when the component initializes
  }

  // Fetch data from the API
  public fetchData() {
    this.http.get('http://127.0.0.1:8000/api/report/monthly-sales/').subscribe(
      (resp: any) => {
        const labels = resp.month;
        const data = resp.sales_count;
        const visualization_type = resp.visualization_type;
        

        // Render or update the chart based on visualization_type
        this.renderOrUpdateChart(visualization_type, labels, data);
      },
      (error) => {
        console.error('Error fetching data', error);
      }
    );
  }

  // Render or update the chart without using an id
  renderOrUpdateChart(typename: any, labels: string[], data: number[]) {
    // Destroy the existing chart if it exists
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    // Create the chart using the ViewChild reference to the canvas element
    const ctx = this.chartCanvas.nativeElement.getContext('2d');
    
    if (ctx) {
      this.chartInstance = new Chart(ctx, {
        type: typename,
        data: {
          labels: labels,
          datasets: [
            {
              label: '# of Sales',
              data: data,
              borderWidth: 1,
              hoverBackgroundColor: 'skyblue',
              backgroundColor: ['grey'],
              borderColor: ['rgba(255, 99, 71, 1)']
            }
          ]
        },
        options: {
          indexAxis: typename === 'bar' ? 'y' : undefined, // For horizontal bar charts
          scales: typename === 'bar' ? { y: { beginAtZero: true } } : undefined, // Scales only for bar charts
          plugins: {
            title: {
              display: true,
              text: 'Monthly Sales Chart',
              color: 'rgba(255, 99, 132, 1)', // Change to your desired color
              font: {
                size: 20, // Adjust font size if needed
                weight: 'bold', // Make the title bold
                family: 'Helvetica, Arial, sans-serif', // Change font family if needed
              },
              align: 'start', // Options: 'start', 'center', 'end'
            }
          }
        }
      });
    }
  }
}
