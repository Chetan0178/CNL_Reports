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
  public errorMessage: string | null = null;
  public getJsonValue: any;
  private chartInstances: { [key: string]: Chart | null } = {}; // Track chart instances

  // Initialize with bar chart selected by default
  charts = [
    {  title: 'Bar Chart', id: 'barchart', selected: true },
    {  title: 'Pie Chart', id: 'piechart', selected: false },
    {  title: 'Doughnut Chart', id: 'dochart', selected: false },
    {  title: 'Line Chart', id: 'line', selected: false }
  ];
  allChartsSelected = false; // To control the "Select All" button

  // Mapping of chart titles to Font Awesome icon classes
  iconMap: { [key: string]: string } = {
    'Bar Chart': 'fa-solid fa-chart-bar',
    'Line Chart': 'fas fa-chart-line',
    'Pie Chart': 'fas fa-chart-pie',
    'Doughnut Chart' : '',
    
    // Add more mappings as needed
  };

  getIconClass(title: string): string {
    return this.iconMap[title] || '';
  }
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // Initially, fetch data for the bar chart
    this.fetchData();
  }

  // Fetch data from the backend API
  public fetchData() {
    this.http.get('http://127.0.0.1:8000/api/report/monthly-sales/').subscribe(
      (resp: any) => {
        this.getJsonValue = resp;
        const labels = resp.month;
        const data = resp.sales_count;

        // Render only the selected charts
        this.charts.forEach((chart) => {
          if (chart.selected) {
            this.renderOrUpdateChart(chart.id, this.getChartType(chart.id), labels, data);
          } else {
            this.destroyChart(chart.id); // Destroy the chart if it's deselected
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
      case 'barchart':
        return 'bar';
      case 'piechart':
        return 'pie';
      case 'dochart':
        return 'doughnut';
      case 'pochart':
        return 'polarArea';
      case 'rochart':
        return 'radar';
      case 'line':
        return 'line';
      default:
        return 'bar';
    }
  }

  // Render or update the chart
  renderOrUpdateChart(id: string, typename: any, labels: string[], data: number[]) {
    // Check if a chart already exists, if so, destroy it first
    if (this.chartInstances[id]) {
      this.chartInstances[id]?.destroy();
    }    
    // Create a new chart and store its instance
    this.chartInstances[id] = new Chart(id, {
      type: typename,
      data: {
        labels: labels,
        datasets: [
          {
            label: '# of Sales',
            data: data,
            fill : true,
            borderWidth: 1,
            barThickness: 30,
            maxBarThickness: 50,
            hoverBackgroundColor: "rgba(255,99,132,0.4)",
            hoverBorderColor: "rgba(255,99,132,1)",
            backgroundColor: "rgba(255,99,132,0.2)",
            borderColor: "rgba(255,99,132,1)",
            pointBorderWidth : 5,
          }
        ]
      },
      options: {
        animations: {
          tension: {
            duration: 2000,
            easing: 'linear',
            from: 1,
            to: 0,
            loop: false
          }
        },
        indexAxis: typename === 'bar' ? 'x' : undefined, // Only for bar charts
        scales: {
          y: { beginAtZero: true }
        },
      }      
    });
  }

  // Destroy the chart if it exists
  destroyChart(id: string) {
    if (this.chartInstances[id]) {
      this.chartInstances[id]?.destroy();
      this.chartInstances[id] = null;
    }
  }

  // Handle chart selection and re-fetch data when the selection changes
  onChartSelection() {
    this.fetchData(); // Re-fetch data and re-render selected charts
    this.updateSelectAllState(); // Update the "Select All" button state
  }

  // Select or deselect all charts
  toggleSelectAll() {
    this.allChartsSelected = !this.allChartsSelected; // Toggle the value
    this.charts.forEach((chart) => {
      chart.selected = this.allChartsSelected; // Set all charts to selected/deselected
    });
    this.fetchData(); // Re-fetch data and re-render charts based on the selection
  }

  // New method to update the state of the "Select All" button
  private updateSelectAllState() {
    this.allChartsSelected = this.charts.every(chart => chart.selected);
  }

  // New method to toggle individual chart selection
  toggleChartSelection(chart: any) {
    chart.selected = !chart.selected; // Toggle the selected state
    this.onChartSelection(); // Call the existing method to re-fetch and render charts
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
