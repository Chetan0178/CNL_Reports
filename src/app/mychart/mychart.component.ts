import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-mychart',
  templateUrl: './mychart.component.html',
  styleUrls: ['./mychart.component.css']
})
export class MychartComponent implements OnInit {
  public showError: boolean = false; 
  public errorMessage: string | null = null;
  options: string[] = ['Today', 'yesterday', 'Last 3 Months Revenue'];
  selectedOption: string = 'Today'; 
  message: string = '';
  order_count: any;
  invoices: any;
  dates: any;
  public getJsonValue: any;
  private chartInstances: { [key: string]: Chart | null } = {};

  charts = [
    // { title: 'Line Chart',  id: 'line',  selected: true }, // Set default selection
    // { title: 'Area Chart',  id: 'area',  selected: false },
    // { title: 'Spine Chart', id: 'spine', selected: false },
    { title: 'Bar Chart',   id: 'bar',   selected: false }
  ];
  allChartsSelected = false;

  iconMap: { [key: string]: string } = {
    // 'Line Chart':  'fas fa-chart-line',
    // 'Area Chart':  'fas fa-chart-area',
    // 'Spine Chart': 'fas fa-chart-line',
    'Bar Chart':   'fa-solid fa-chart-column',
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.onOptionChange(); // Fetch initial data
  }

  onOptionChange() {
    switch (this.selectedOption) {
      case 'Today':
        this.fetchData('todays_revenue');  
        break;
      case 'yesterday':
        this.fetchData('yesterday_revenue');
        break;
      case 'Last 3 Months Revenue':
        this.fetchData('last_3_months_revenue'); // Update for Monthly fetch
        break;
      default:
        this.message = '';
    }
  }

  public fetchData(endpoint: string) {
    const apiUrl = `http://127.0.0.1:8000/api/report/${endpoint}`;

    this.http.get(apiUrl).subscribe(
      (resp: any) => {
        this.errorMessage = null; 
        const labels = [resp.label]; // Changed to create an array of labels <<<<<========
        const data = [resp.revenue]; // Changed to create an array of data <<<<<========
        console.log("=====>>>>>>>>", labels, data);
        
        // Render only the selected charts
        this.charts.forEach((chart) => {
          if (chart.selected) {
            this.createChart(chart.id, this.getChartType(chart.id), labels, data);
          } else {
            this.destroyChart(chart.id);
          }
        });
      },
      (error) => {
        this.errorMessage = 'Failed to load data';
        this.showErrorLabel();
      }
    );
}

   // This method gets the chart type based on the chart ID
   getChartType(id: string) {
    switch (id) {
      // case 'area':
      //   return 'line';
      // case 'line':
      //   return 'line';
      // case 'spine':
      //   return 'line';
      case 'bar':
        return 'bar';
      default:
        return 'bar';
    }
  }

  // Ensure that the canvas element with the correct ID exists in your HTML
createChart(chartId: string, typename: any, labels: string[], data: number[]) { // Ensure types for clarity <<<<<========
    this.destroyChart(chartId); // Destroy existing chart instance if any
  
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d'); // Use optional chaining
    if (ctx) { // Check if ctx is not null
      this.chartInstances[chartId] = new Chart(ctx, {
        type: typename,
        data:  {
          labels: labels,
          datasets: [
            {
              label: '# of Sales',
              data: data,
              fill: true,
              borderWidth: 1,
              barThickness: 30,
              maxBarThickness: 50,
              hoverBackgroundColor: "rgba(255,99,132,0.4)",
              hoverBorderColor: "rgba(255,99,132,1)",
              backgroundColor: "rgba(255,99,132,0.2)",
              borderColor: "rgba(255,99,132,1)",
              pointBorderWidth: 5,
            }
          ]
        },
        options: {
          animations: (chartId === 'area' || chartId === 'line') ? {
            tension: {
              duration: 2000,
              easing: 'linear',
              from: 1,
              to: 0,
              loop: false
            }
          } : false,
          borderWidth: 1,
          borderColor: "rgba(255,99,132,1)",
          barThickness: 20,
          maxBarThickness: 20,
          indexAxis: 'x',
          responsive: true,
          fill: chartId === 'area',
          tension: (chartId === 'area' || chartId === 'spine') ? 0.4 : 0,
          scales: {
            x: {
              stacked: true,
              ticks: {
                autoSkip: true,
                maxTicksLimit: 24,
              }
            },
            y: {
              stacked: true,
            },
          },
          plugins: {
            title: {
              display: true,
              text: '',
            },
            legend: {
              position: 'top',
            },
          },
        },
      });
    } else {
      console.error(`Failed to get context for chart with id: ${chartId}`);
    }
}

  

  destroyChart(id: string) {
    if (this.chartInstances[id]) {
      this.chartInstances[id]?.destroy();
      this.chartInstances[id] = null;
    }
  }

  toggleSelectAll() {
    this.allChartsSelected = !this.allChartsSelected;
    this.charts.forEach((chart) => {
      chart.selected = this.allChartsSelected;
    });
    this.onOptionChange(); // Re-fetch data based on selection
  }

  toggleChartSelection(chart: any) {
    chart.selected = !chart.selected;
    this.onOptionChange(); // Re-fetch data and re-render selected charts
  }

  getIconClass(title: string): string {
    return this.iconMap[title] || '';
  }

  private showErrorLabel() {
    const errorLabel = document.querySelector('.error-label');
    if (errorLabel) {
        errorLabel.classList.add('show');
        setTimeout(() => {
            errorLabel.classList.remove('show');
        }, 3000); // Display for 3 seconds
    }
}
}
