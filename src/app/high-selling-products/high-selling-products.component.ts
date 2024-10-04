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

@Component({
  selector: 'app-high-selling-products',
  templateUrl: './high-selling-products.component.html',
  styleUrls: ['./high-selling-products.component.css']
})
export class HighSellingProductsComponent implements OnInit {
  public showError: boolean = false;
  public errorMessage: string | null = null;
  options: string[] = ['Daily', 'Weekly', 'Monthly'];
  selectedOption: string = 'Monthly';
  message: string = '';
  private chartInstances: { [key: string]: Chart | null } = {};
  public chartData: any = {}; // Declare chartData

  charts = [
    { title: 'Line Chart',  id: 'line',  selected: true }, // Default selection
    { title: 'Area Chart',  id: 'area',  selected: false },
    { title: 'Spine Chart', id: 'spine', selected: false },
    { title: 'Bar Chart',   id: 'bar',   selected: false }
  ];
  allChartsSelected = false;

  iconMap: { [key: string]: string } = {
    'Line Chart':  'fas fa-chart-line',
    'Area Chart':  'fas fa-chart-area',
    'Spine Chart': 'fas fa-chart-line',
    'Bar Chart':   'fas fa-solid fa-chart-column',
  };

  // Static data to be used
  private c_data = {
    "months": [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December"
    ],
   "product_names": [
        "Car GPS Navigator",
        "Car Vacuum Cleaner",
        "Dash Cam",
        "Laptop",
        "Microwave Oven",
        "Refrigerator",
        "Smartphone",
        "Washing Machine"
    ],
    "sales": [
        [
            50.0,
            50.0,
            265.0,
            230.0,
            210.0,
            250.0,
            290.0,
            310.0,
            340.0,
            360.0,
            390.0,
            440.0
        ],
        [
            80.0,
            80.0,
            245.0,
            180.0,
            220.0,
            230.0,
            240.0,
            300.0,
            320.0,
            350.0,
            400.0,
            450.0
        ],
        [
            60.0,
            60.0,
            315.0,
            210.0,
            240.0,
            300.0,
            310.0,
            340.0,
            350.0,
            0,
            410.0,
            460.0
        ],
        [
            190.0,
            129.0,
            335.0,
            220.0,
            250.0,
            330.0,
            300.0,
            350.0,
            360.0,
            370.0,
            380.0,
            420.0
        ],
        [
            103.0,
            109.0,
            325.0,
            260.0,
            270.0,
            290.0,
            250.0,
            320.0,
            310.0,
            330.0,
            370.0,
            430.0
        ],
        [
            96.0,
            96.0,
            268.0,
            150.0,
            160.0,
            210.0,
            260.0,
            280.0,
            330.0,
            320.0,
            390.0,
            440.0
        ],
        [
            159.0,
            169.0,
            320.0,
            190.0,
            300.0,
            310.0,
            320.0,
            330.0,
            340.0,
            360.0,
            400.0,
            450.0
        ],
        [
            112.0,
            112.0,
            384.0,
            240.0,
            190.0,
            280.0,
            270.0,
            290.0,
            300.0,
            310.0,
            350.0,
            410.0
        ]
    ]
  };

  constructor() {}

  ngOnInit(): void {
    this.onOptionChange(); // Fetch initial data
  }

  // Handle option change for Daily, Weekly, Monthly data
  onOptionChange() {
    switch (this.selectedOption) {
      case 'Daily':
      case 'Weekly':
      case 'Monthly':
        this.useStaticData(); // Use the static data instead of fetching from an API
        break;
      default:
        this.message = '';
    }

    // Delay the chart rendering to ensure canvas elements are in the DOM
    setTimeout(() => {
      this.renderCharts();  // Create and render charts
    }, 0);
  }

  // Use static data and render charts based on selection
  private useStaticData() {
    const resp = this.c_data; // Use static data directly
    this.errorMessage = null; 

    // Convert the static data to datasets for Chart.
    console.log("  console.log(this.buildDatasets(resp))===>", this.buildDatasets(resp))
    const chart_data = {    
      labels: resp.months,  // X-axis labels (months)
      datasets: this.buildDatasets(resp) // Build datasets dynamically for each product
    };

    // Save the data for rendering after delay
    this.chartData = chart_data; // Now this.chartData is defined
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
  buildDatasets(resp: any): ChartDataset<'line'>[] { // Specify the return type
    const datasets: ChartDataset<'line'>[] = []; // Explicitly define the type

    resp.product_names.forEach((productName: string, index: number) => {
      datasets.push({
        label: productName,  // Use the product name as the label
        data: resp.sales[index],  // Assuming sales data is an array of arrays (one per product)
        backgroundColor: this.getRandomColor(),  // Dynamic color for each product
        borderColor: this.getRandomColor(),
        borderWidth: 1
      });
    });

    return datasets;
  }

  // Generate random colors for each dataset
  getRandomColor() {
    const letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  // Determine the Chart.js type for the given chart
  getChartType(id: string): ChartType {
    switch (id) {
      case 'area':
        return 'line'; // 'Area' is a filled line chart in Chart.js
      case 'line':
        return 'line';
      case 'spine':
        return 'line'; // 'Spine' is also a line chart
      case 'bar':
        return 'bar';
      default:
        return 'line'; // Fallback to line
    }
  }

  // Create the chart instance dynamically
  createChart(chartId: string, chartType: ChartType, data: any) {
    this.destroyChart(chartId); // Destroy any existing chart with this ID

    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      this.chartInstances[chartId] = new Chart(ctx, {
        type: chartType,  // Dynamic chart type
        data: data,
        options: {
          responsive: true,
          scales: {
            x: {
              stacked: false,
              ticks: {
                autoSkip: true,  // Automatically skip labels if too many
                maxTicksLimit: 12, // Limit the number of labels
              }
            },
            y: {
              stacked: false, // Can adjust based on use case
            },
          },
          plugins: {
            title: {
              display: true,
              text: chartId.replace(/-/, ' ') + ' - Sales Data',  // Dynamic title
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
    this.onOptionChange(); // Re-fetch data based on selection
  }

  // Toggle selection for individual charts
  toggleChartSelection(chart: any) {
    chart.selected = !chart.selected;
    this.onOptionChange(); // Re-fetch data and re-render selected charts
  }

  // Get the icon class for the charts
  getIconClass(title: string): string {
    return this.iconMap[title] || '';
  }
}
