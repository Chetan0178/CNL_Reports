import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { getHoverColor } from 'chart.js/helpers';
Chart.register(...registerables);

@Component({
  selector: 'app-sales-order-trend',
  templateUrl: './sales-order-trend.component.html',
  styleUrls: ['./sales-order-trend.component.css'] // Corrected from styleUrl to styleUrls
})
export class SalesOrderTrendComponent implements OnInit {
  public showError: boolean = false; 
  public errorMessage: string | null = null;
  options: string[] = ['Daily', 'Weekly', 'Monthly'];
  selectedOption: string = 'Daily'; 
  message: string = '';
  order_count: any;
  invoices: any;
  dates: any;
  public getJsonValue: any;
  private chartInstances: { [key: string]: Chart | null } = {};

  charts = [
    { title: 'Line Chart',  id: 'line',  selected: true }, // Set default selection
    { title: 'Area Chart',  id: 'area',  selected: false },
    { title: 'Spine Chart', id: 'spine', selected: false },
    { title: 'Bar Chart',   id: 'bar',   selected: false }
  ];
  allChartsSelected = false;

  iconMap: { [key: string]: string } = {
    'Line Chart':  'fas fa-chart-line',
    'Area Chart':  'fas fa-chart-area',
    'Spine Chart': 'fas fa-chart-line',
    'Bar Chart':   'fa-solid fa-chart-column',
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.onOptionChange(); // Fetch initial data
  }

  onOptionChange() {
    switch (this.selectedOption) {
      case 'Daily':
        this.fetchData('sales-order-trend-daily');
        break;
      case 'Weekly':
        this.message = 'Weekly chart';
        break;
      case 'Monthly':
        this.fetchData('sales-order-trend-monthly'); // Update for Monthly fetch
        break;
      default:
        this.message = '';
    }
  }

  public fetchData(endpoint: string) {
    const apiUrl = `http://127.0.0.1:8000/api/report/${endpoint}`;

    this.http.get(apiUrl).subscribe(
      (resp: any) => {
        this.dates = resp.dates;
        this.errorMessage = null; 
        const labels = resp.month;

        const c_data = {
          labels: resp.dates, // Make sure you have correct labels
          datasets: [
            {
              label: 'Sold Items',
              data: resp.order_count,
              backgroundColor: 'rgba(66, 122, 212, 0.9)',
              hoverBackgroundColor: "rgba(5, 94, 239, 0.9)",
            },
            {
              label: 'Invoices',
              data: resp.invoices,
              backgroundColor: 'rgba(54, 162, 235, 0.6)',
              hoverBackgroundColor: "rgba(0, 153, 255, 0.9)",
            },
            {
              label: 'Returns',
              data: resp.returns,
              backgroundColor: 'rgba(255, 206, 86, 0.6)',
              hoverBackgroundColor: "rgba(255, 183, 0, 1.0)",
            },
          ]
        };
      //   const c_data = {
      //     labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      //     datasets: [
            
      //         {
      //             week: 'Week 1',
      //             data: [8, 24, 0, 2, 6, 8, 3, 9, 6, 2, 6, 5],
      //             backgroundColor: 'rgba(255, 99, 132, 0.6)',
      //         },
      //         {
      //             label: 'Week 2',
      //             data: [5, 20, 0, 0, 2, 0, 2, 9, 6, 4, 7, 5],
      //             backgroundColor: 'rgba(54, 162, 235, 0.6)',
      //         },
      //         {
      //             label: 'Week 3',
      //             data: [2, 16, 14, 0, 3, 2, 8, 5, 8, 6, 9, 10],
      //             backgroundColor: 'rgba(255, 206, 86, 0.6)',
      //         },
      //         {
      //             label: 'Week 4',
      //             data: [9, 12, 7, 2, 2, 1, 4, 2, 4, 7, 5, 3],
      //             backgroundColor: 'rgba(75, 192, 192, 0.6)',
      //         },
      //         // Add more weeks as needed
      //     ]
      // };
        // Render only the selected charts
        this.charts.forEach((chart) => {
          if (chart.selected) {
            this.createChart(chart.id, this.getChartType(chart.id), c_data);
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
      case 'area':
        return 'line';
      case 'line':
        return 'line';
      case 'spine':
        return 'line';
      case 'bar':
        return 'bar';
      default:
        return 'line';
    }
  }

  createChart(chartId: string,typename: any, data: any) {
    this.destroyChart(chartId); // Destroy existing chart instance if any
  
    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d'); // Use optional chaining
   console.log("===>,", chartId)
    if (ctx) { // Check if ctx is not null
      this.chartInstances[chartId] = new Chart(ctx, {
        type: typename,
        data: data,
          options: {
          borderWidth: 1,
          borderColor : "rgba(255,99,132,1)",
          barThickness: 30,
          maxBarThickness: 50,
          indexAxis: 'x',
          responsive: true,
          fill: chartId === 'area' ? true : false,
          tension:(chartId === 'area' || chartId === 'spine') ? 0.4 : 0,
          scales: {
            x: {
              stacked: true,
            },
            y: {
              stacked: true,
            },
          },
          plugins: {
            title: {
              display: true,
              text: 'Total Sold Items Per Month by Week',
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
