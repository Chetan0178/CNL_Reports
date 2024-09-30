import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Chart, registerables } from 'chart.js';
Chart.register(...registerables);

@Component({
  selector: 'app-sales-performance-by-customer',
  templateUrl: './sales-performance-by-customer.component.html',
  styleUrls: ['./sales-performance-by-customer.component.css']
})
export class SalesPerformanceByCustomerComponent implements OnInit {
  public showError: boolean = false;
  public errorMessage: string | null = null;
  private chartInstances: { [key: string]: Chart | null } = {};

  // Only Bar Chart and Radar Chart options
  charts = [
    // { title: 'Bar Chart', id: 'bar', selected: true },  // Default selection
    { title: 'Stacked Bar Chart', id: 'stacked-bar', selected: true },  // Default selection
    { title: 'Radar Chart', id: 'radar-type', selected: false },
    { title: 'Bar Chart', id:'hori-bar', selected: false}
  ];

  allChartsSelected = false;  // Property to handle select/deselect all
  currentChartType = 'bar';   // Default to Stacked Bar chart

  iconMap: { [key: string]: string } = {
    'Stacked Bar Chart': 'fa-solid fa-chart-column',
    'Radar Chart': 'fa-solid fa-chart-pie',
    'Bar Chart' : 'fa-solid fa-chart-bar'
  };

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.fetchData();
  }

  public fetchData() {
    const apiUrl = `http://127.0.0.1:8000/api/report/Sales-Performance-by-Customer/`;

    this.http.get(apiUrl).subscribe(
      (resp: any) => {
        const cust_name_list = resp.cust_name_list;
        const prod_category_list = resp.prod_category_list;
        const price_list = resp.price_list;

        const chart_data = {
          labels: cust_name_list,
          datasets: prod_category_list.map((category: string, index: number) => ({
            label: category,
            data: price_list[index],
            backgroundColor: this.getRandomLightColor()
          }))
        };

        // Render only the selected charts
        this.charts.forEach((chart) => {
          if (chart.selected) {
            this.createChart(chart.id, this.getChartType(chart.id), chart_data);
          } else {
            this.destroyChart(chart.id);  // Ensure we destroy any existing chart
          }
        });
      },
      (error) => {
        this.errorMessage = 'Failed to load data';
        this.showErrorLabel();
      }
    );
  }

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

  // Function to toggle between chart selections
  toggleChartSelection(chart: any) {
    chart.selected = !chart.selected;  // Toggle the selection state
    if (chart.selected) {
      this.fetchData();  // Re-fetch data and render the chart when selected
    } else {
      this.destroyChart(chart.id);  // Destroy chart when deselected
    }
  }

  // Function to toggle all charts at once
  toggleSelectAll() {
    this.allChartsSelected = !this.allChartsSelected;  // Toggle select/deselect all
    this.charts.forEach(chart => {
      chart.selected = this.allChartsSelected;
    });
    this.fetchData();  // Re-fetch data for all charts
  }

  // Function to get chart type based on id
  getChartType(id: string) {
    switch (id) {
      case 'radar-type':
        return 'radar';
      case 'stacked-bar':
        return 'bar';
        case 'hori-bar':
          return 'bar';
      default:
        return 'bar';
    }
  }

  // Function to get icon class for a chart title
  getIconClass(title: string): string {
    return this.iconMap[title] || '';
  }

  // Function to create a chart
  createChart(chartId: string, typename: any, data: any) {


    this.destroyChart(chartId);  // Destroy existing chart instance if any

    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    if (!canvas) {
      console.error(`Canvas element not found for chart ID: ${chartId}`);
      return;
    }

    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error(`Failed to get context for chart ID: ${chartId}`);
      return;
    }

    this.chartInstances[chartId] = new Chart(ctx, {
      type: typename,
      data: data,
      options: {
        borderWidth: 1,
        borderColor: "rgba(255,99,132,1)",
        barThickness: (chartId === 'hori-bar') ? 5 : 20,
        maxBarThickness: 20,
        responsive: true,
        indexAxis: (chartId === 'hori-bar') ? 'y' : 'x',
        scales: {
          x: {
            stacked: typename === 'bar',
            ticks: {
              autoSkip: true,
              maxTicksLimit: 24
            }
          },
          y: {
            stacked: typename === 'bar'
          }
        },
        plugins: {
          title: {
            display: true,
            text: `${chartId === 'radar' ? 'Radar' : 'Bar'} Chart - Sales Performance by Customer`
          },
          legend: {
            position: 'top'
          }
        }
      }
    });
  }

  // Function to destroy a chart
  destroyChart(chartId: string) {
    if (this.chartInstances[chartId]) {
      this.chartInstances[chartId]?.destroy();  // Destroy existing chart instance
      this.chartInstances[chartId] = null;  // Clear chart instance reference
    }
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
