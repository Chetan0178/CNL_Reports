import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
import { getHoverColor } from 'chart.js/helpers';
import { API_HOST } from '../../assets/api.config';
Chart.register(...registerables);

@Component({
  selector: 'app-sales-order-trend',
  templateUrl: './sales-order-trend.component.html',
  styleUrls: ['./sales-order-trend.component.css'] // Corrected from styleUrl to styleUrls
})
export class SalesOrderTrendComponent implements OnInit {
  public showError: boolean = false; 
  public errorMessage: string | null = null;
  options: string[] = ['Weekly', 'Monthly'];
  selectedOption: string = 'Monthly'; 
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
      // case 'Daily':
      //   this.fetchData('sales-order-trend-daily');  
      //   break;
      case 'Weekly':
        this.fetchData('sales-order-trend-weekly');
        break;
      case 'Monthly':
        this.fetchData('sales-order-trend-monthly'); // Update for Monthly fetch
        break;
      default:
        this.message = '';
    }
  }

  public fetchData(endpoint: string) {
    const apiUrl = `${API_HOST}/api/report/${endpoint}`;

    this.http.get(apiUrl).subscribe(
      (resp: any) => {
        this.dates = resp.dates;
        this.errorMessage = null; 
        const labels = resp.month;

        const chart_data = {
          labels: resp.dates, // Make sure you have correct labels
          datasets: [
            {
              label: 'Sales Order',
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
      //   const chart_data = {
      //     labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      //     datasets: [
      //       {
      //           "week": "Week 1",
      //           "data": [3, 15, 7, 8, 6, 2, 4, 1, 9, 0, 5, 12],
      //           "backgroundColor": "rgba(255, 99, 132, 0.6)"
      //       },
      //       {
      //           "label": "Week 2",
      //           "data": [1, 10, 14, 5, 0, 8, 9, 3, 6, 12, 7, 4],
      //           "backgroundColor": "rgba(54, 162, 235, 0.6)"
      //       },
      //       {
      //           "label": "Week 3",
      //           "data": [2, 13, 11, 9, 5, 6, 7, 8, 10, 1, 4, 3],
      //           "backgroundColor": "rgba(255, 206, 86, 0.6)"
      //       },
      //       {
      //           "label": "Week 4",
      //           "data": [8, 2, 6, 0, 4, 3, 5, 12, 11, 7, 14, 0],
      //           "backgroundColor": "rgba(75, 192, 192, 0.6)"
      //       },
      //       {
      //           "week": "Week 5",
      //           "data": [12, 8, 5, 22, 3, 19, 10, 15, 27, 0, 4, 11],
      //           "backgroundColor": "rgba(255, 99, 132, 0.6)"
      //       },
      //       {
      //           "label": "Week 6",
      //           "data": [4, 18, 7, 30, 14, 2, 5, 9, 18, 6, 20, 25],
      //           "backgroundColor": "rgba(54, 162, 235, 0.6)"
      //       },
      //       {
      //           "label": "Week 7",
      //           "data": [10, 12, 20, 2, 5, 7, 6, 11, 19, 3, 15, 9],
      //           "backgroundColor": "rgba(255, 206, 86, 0.6)"
      //       },
      //       {
      //           "label": "Week 8",
      //           "data": [22, 11, 5, 3, 2, 4, 15, 6, 27, 19, 14, 8],
      //           "backgroundColor": "rgba(75, 192, 192, 0.6)"
      //       }
      //   ]
      // };
        // Render only the selected charts
        this.charts.forEach((chart) => {
          if (chart.selected) {
            this.createChart(chart.id, this.getChartType(chart.id), chart_data);
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
          borderColor : "rgba(255,99,132,1)",
          barThickness: 20,
          maxBarThickness: 20,
          indexAxis: 'x',
          responsive: true,
          fill: chartId === 'area' ? true : false,
          tension:(chartId === 'area' || chartId === 'spine') ? 0.4 : 0,
          scales: {
            x: {
              stacked: true,
              // If you want to control the ticks spacing, you can adjust this
              ticks: {
                autoSkip: true, // Allow automatic skipping of labels
                maxTicksLimit: 24, // Limit the maximum number of ticks displayed
                    // You can use the following if you want to control intervals:
                    // stepSize: 1, // Set the interval between ticks (only works for numerical labels)

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
