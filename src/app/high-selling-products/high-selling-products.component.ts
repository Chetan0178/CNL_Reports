// import { HttpClient } from '@angular/common/http';
// import { Component, OnInit } from '@angular/core';
// import { Chart, ChartType } from 'chart.js';


// @Component({
//   selector: 'app-high-selling-products',
//   templateUrl: './high-selling-products.component.html',
//   styleUrls: ['./high-selling-products.component.css'] // Fixed the typo from 'styleUrl' to 'styleUrls'
// })
// export class HighSellingProductsComponent implements OnInit {

//   public showError: boolean = false;
//   public errorMessage: string | null = null;
//   options: string[] = ['Daily', 'Weekly', 'Monthly'];
//   selectedOption: string = 'Monthly';
//   message: string = '';
//   order_count: any;
//   invoices: any;
//   dates: any;
//   public getJsonValue: any;
//   private chartInstances: { [key: string]: Chart | null } = {};

//   charts = [
//     { title: 'Line Chart',  id: 'line',  selected: true }, // Set default selection
//     { title: 'Area Chart',  id: 'area',  selected: false },
//     { title: 'Spine Chart', id: 'spine', selected: false },
//     { title: 'Bar Chart',   id: 'bar',   selected: false }
//   ];
//   allChartsSelected = false;

//   iconMap: { [key: string]: string } = {
//     'Line Chart':  'fas fa-chart-line',
//     'Area Chart':  'fas fa-chart-area',
//     'Spine Chart': 'fas fa-chart-line',
//     'Bar Chart':   'fa-solid fa-chart-column',
//   };

//   constructor(private http: HttpClient) {}


//   ngOnInit(): void {
//     this.onOptionChange(); // Fetch initial data
//   }

//     // Handle option change for Daily, Weekly, Monthly data
//     onOptionChange() {
//       switch (this.selectedOption) {
//         case 'Daily':
//           this.fetchData('sales-order-trend-daily');
//           break;
//         case 'Weekly':
//           this.fetchData('sales-order-trend-weekly');
//           break;
//         case 'Monthly':
//           this.fetchData('top-1-high-selling-Products-monthly');
//           break;
//         default:
//           this.message = '';
//       }
//     }

//     // Fetch data based on selected option
//     public fetchData(endpoint: string) {
//       const apiUrl = `http://127.0.0.1:8000/api/report/${endpoint}`;
  
//       this.http.get(apiUrl).subscribe(
//         (resp: any) => {
//           console.log(resp)
//           const labels = resp.product_names;
//           const data = resp.sales;
//           console.log("under API:" , data)
//           this.errorMessage = null; 
  
//           // Render only the selected charts
//           this.charts.forEach((chart) => {
//             if (chart.selected) {
//               this.createChart(chart.id, this.getChartType(chart.id), labels, data);
//             } else {
//               this.destroyChart(chart.id);
//             }
//           });
//         },
//         (error) => {
//           this.errorMessage = 'Failed to load data';
//           this.showErrorLabel();
//       }
//       );
//     }


//     createChart(chartId: string,typename: any, labels: string[], data: number[]) {
//       this.destroyChart(chartId); // Destroy existing chart instance if any
//       console.log("typename===", typename)
//       const canvas = document.getElementById(chartId) as HTMLCanvasElement;
//       const ctx = canvas?.getContext('2d'); // Use optional chaining
//       if (ctx) { // Check if ctx is not null
//         this.chartInstances[chartId] = new Chart(ctx, {
//           type: typename,
//           data: {
//             labels: labels,
//             datasets: [
//               {
//                 label: '# of Sales',
//                 data: data,
//                 fill : chartId === 'area' ? true : false,
//                 borderWidth: 1,
//                 barThickness: 30,
//                 maxBarThickness: 50,
//                 hoverBackgroundColor: "rgba(255,99,132,0.4)",
//                 hoverBorderColor: "rgba(255,99,132,1)",
//                 backgroundColor: "rgba(255,99,132,0.2)",
//                 borderColor: "rgba(255,99,132,1)",
//                 pointBorderWidth : 5,
//               },
//             ]
//           },
//           options: {
//             animations: {
//               tension: chartId === 'spine' ? {
//                 duration: 2000,
//                 easing: 'linear',
//                 from: 1,
//                 to: 0,
//                 loop: false
//               } : false
//             },
//             indexAxis: typename === 'bar' ? 'x' : undefined, // Only for bar charts
//             scales: {
//               y: { beginAtZero: true }
//             },
//           } 
//         });
//       } else {
//         console.error(`Failed to get context for chart with id: ${chartId}`);
//       }
//     }

//        // This method gets the chart type based on the chart ID
//    getChartType(id: string) {
//     switch (id) {
//       case 'area':
//         return 'line';
//       case 'line':
//         return 'line';
//       case 'spine':
//         return 'line';
//       case 'bar':
//         return 'bar';
//       default:
//         return 'line';
//     }
//   }


//     destroyChart(id: string) {
//       if (this.chartInstances[id]) {
//         this.chartInstances[id]?.destroy();
//         this.chartInstances[id] = null;
//       }
//     }

//     toggleSelectAll() {
//       this.allChartsSelected = !this.allChartsSelected;
//       this.charts.forEach((chart) => {
//         chart.selected = this.allChartsSelected;
//       });
//       this.onOptionChange(); // Re-fetch data based on selection
//     }
  
//     toggleChartSelection(chart: any) {
//       chart.selected = !chart.selected;
//       this.onOptionChange(); // Re-fetch data and re-render selected charts
//     }
  
//     getIconClass(title: string): string {
//       return this.iconMap[title] || '';
//     }
  
//     private showErrorLabel() {
//       const errorLabel = document.querySelector('.error-label');
//       if (errorLabel) {
//           errorLabel.classList.add('show');
//           setTimeout(() => {
//               errorLabel.classList.remove('show');
//           }, 3000); // Display for 3 seconds
//       }
//   }
  
// }

import { Component, OnInit } from '@angular/core';
import { Chart, ChartType, ChartDataset } from 'chart.js';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-high-selling-products',
  templateUrl: './high-selling-products.component.html',
  styleUrls: ['./high-selling-products.component.css']
})
export class HighSellingProductsComponent implements OnInit {
  public showError: boolean = false;
  public errorMessage: string | null = null;
  options: string[] = [ 'Yearly', 'Monthly', 'Weekly'];
  selectedOption: string = 'Monthly';
  message: string = '';
  private chartInstances: { [key: string]: Chart | null } = {};
  public chartData: any = {};

  charts = [
    { title: 'Line Chart',  id: 'line',  selected: false },
    { title: 'Bar Chart',   id: 'bar',   selected: false },
    { title: 'Radar Chart',   id: 'radar',   selected: false }
  ];
  allChartsSelected = false;

  iconMap: { [key: string]: string } = {
    'Line Chart':  'fas fa-chart-line',
    'Bar Chart':   'fas fa-solid fa-chart-column',
    'Radar chart' : 'radar'
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.onOptionChange(); // Fetch initial data
  }

  // Handle option change for Daily, Weekly, Monthly data
  onOptionChange() {
    switch (this.selectedOption) {
      case 'Yearly':
        this.fetchData('High-Selling-Products-yearly');
        break;
      case 'Monthly':
        this.fetchData('High-Selling-Products-monthly'); 
        break;
      case 'Weekly':
        this.fetchData('High-Selling-Products-weekly');
        break;
      default:
        this.message = '';
    }
  }

  // Fetch data from the API
  public fetchData(endpoint: string) {
    const apiUrl = `http://127.0.0.1:8000/api/report/${endpoint}`;
    this.http.get(apiUrl).subscribe(
      (API_resp: any) => {
        this.errorMessage = null; 
        this.useStaticData(API_resp); // Pass API data to useStaticData
      },
      (error) => {
        this.errorMessage = 'Error fetching data';
        this.showErrorLabel();
      }
    );
  }

  // Use API data and render charts based on selection
  private useStaticData(API_resp: any) {
    const resp = API_resp; // Use API response directly
    this.errorMessage = null; 

    const chart_data = {    
      labels: resp.label,  // X-axis labels (months)
      datasets: this.buildDatasets(resp) // Build datasets dynamically for each product
    };

    this.chartData = chart_data;
    setTimeout(() => {
      this.renderCharts();  // Create and render charts
    }, 0);
  }

  // Create and render the selected charts
  private renderCharts() {
    this.charts.forEach((chart) => {
      if (chart.selected) {
        this.createChart(chart.id, this.getChartType(chart.id), this.chartData);
      } else {
        this.destroyChart(chart.id);
      }
    });
  }

  // Dynamically build datasets for multiple products
  buildDatasets(resp: any): ChartDataset<'line'>[] {
    const datasets: ChartDataset<'line'>[] = [];

    resp.product_names.forEach((productName: string, index: number) => {
      datasets.push({
        label: productName,
        data: resp.sales_data[index],
        backgroundColor: this.getRandomLightColor(),
        borderColor: this.getRandomLightColor(),
        borderWidth: 1
      });
    });

    return datasets;
  }

  // Generate random colors for each dataset
// Random light color generator for each dataset
getRandomLightColor(): string {
  const r = Math.floor(Math.random() * 128) + 128; // Generate red between 128 and 255
  const g = Math.floor(Math.random() * 128) + 128; // Generate green between 128 and 255
  const b = Math.floor(Math.random() * 128) + 128; // Generate blue between 128 and 255

  return `#${this.componentToHex(r)}${this.componentToHex(g)}${this.componentToHex(b)}`;
}
// Helper function to convert a component to a hex string
private componentToHex(c: number): string {
  const hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex; // Ensure two characters for each component
}

  // Determine the Chart.js type for the given chart
  getChartType(id: string): ChartType {
    switch (id) {
      case 'line':
        return 'line';
      case 'bar':
        return 'bar';
      case 'radar':
          return 'radar';
      default:
        return 'line';
    }
  }

  // Create the chart instance dynamically
  createChart(chartId: string, chartType: ChartType, data: any) {
    this.destroyChart(chartId);

    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      this.chartInstances[chartId] = new Chart(ctx, {
        type: chartType,
        data: data,
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: false,
              ticks: {
                autoSkip: true,
                maxTicksLimit: 12,
              }
            },
            y: {
              stacked: false,
            },
          },
          plugins: {
            title: {
              display: true,
              text: chartId.replace(/-/, ' ') + ' - Sales Data',
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

  // Destroy the chart instance
  destroyChart(id: string) {
    if (this.chartInstances[id]) {
      this.chartInstances[id]?.destroy();
      this.chartInstances[id] = null;
    }
  }

  // Toggle select all charts
  toggleSelectAll() {
    this.allChartsSelected = !this.allChartsSelected;
    this.charts.forEach((chart) => {
      chart.selected = this.allChartsSelected;
    });
    this.onOptionChange(); 
  }

  // Toggle selection for individual charts
  toggleChartSelection(chart: any) {
    chart.selected = !chart.selected;
    this.onOptionChange();
  }

  // Get the icon class for the charts
  getIconClass(title: string): string {
    return this.iconMap[title] || '';
  }

  private showErrorLabel() {
    const errorLabel = document.querySelector('.error-label');
    if (errorLabel) {
      errorLabel.classList.add('show');
      setTimeout(() => {
        errorLabel.classList.remove('show');
      }, 3000);  // Display for 3 seconds
    }
  }
}
