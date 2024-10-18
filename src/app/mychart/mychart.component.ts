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
  options: string[] = [
    'Today',
    'yesterday',
    'Last 7 Days Revenue',
    'Current Month Revenue',
    'Last Month Revenue',
    'Last 3 Months Revenue',
    'Last 6 Months Revenue',
    'Current Quarter Revenue',
    'Year to Current Date Revenue',
    'Last 12 Months Revenue'
  ];
  selectedOption: string = 'Today'; 
  message: string = 'Chart analysis';
  private chartInstances: { [key: string]: Chart | null } = {};

  charts = [
    { title: 'Bar Chart', id: 'bar', selected: false },
    { title: 'Horizontal Bar Chart', id: 'Horizontal Bar', selected: false },
    { title: 'Pie Chart', id: 'pie', selected: false },
    { title: 'Line Chart', id: 'line', selected: false },     // Added Line chart
    { title: 'Area Chart', id: 'area', selected: false },     // Added Area chart
    { title: 'Spine Chart', id: 'spine', selected: false },   // Added Spine chart
  ];
  allChartsSelected = false;

  iconMap: { [key: string]: string } = {
    'Bar Chart': 'fa-solid fa-chart-column',
    'Horizontal Bar Chart': 'fa-regular fa-chart-bar',
    'Pie Chart': 'fa-solid fa-pie-chart',
    'Line Chart': 'fa-solid fa-chart-line',       // Added icons for new charts
    'Area Chart': 'fa-solid fa-chart-area',
    'Spine Chart': 'fa-solid fa-wave-square'
  };

 // New list for multiple element time frame (for Pie, Line, Area, and Spine)
  mul_element_time_frame: string[] = [
    'Last 3 Months Revenue',
    'Last 6 Months Revenue',
    'Year to Current Date Revenue',
    'Current Quarter Revenue'
  ];

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.onOptionChange(); // Fetch initial data
  }

  getChartType(id: string) {
    switch (id) {
      case 'bar':
        return 'bar';
      case 'pie':
        return 'pie';
      case 'line':
        return 'line';   // Return 'line' for Line Chart
      case 'area':
        return 'line';   // Area chart is drawn as a line chart with a fill option
      case 'spine':
        return 'line';   // Spine chart can also be a line chart with a different style
      default:
        return 'bar';
    }
  }

  onOptionChange() {
    // Reset Pie and other charts if not in the valid timeframe
    if (!this.mul_element_time_frame.includes(this.selectedOption)) {
      this.charts.forEach(chart => {
        if (['pie', 'line', 'area', 'spine'].includes(chart.id)) {
          chart.selected = false;
        }
      });
    }
    this.fetchData(this.selectedOption.replace(/ /g, '_').toLowerCase());
    this.updateChartSelections();
  }

  updateChartSelections() {
    // Ensure Pie and other multiple-element charts are only available for valid time frames
    this.charts.forEach(chart => {
      if (['pie', 'line', 'area', 'spine'].includes(chart.id) && !this.mul_element_time_frame.includes(this.selectedOption)) {
        chart.selected = false;
      }
    });
  }

  toggleChartSelection(chart: any) {
    if (chart.id !== 'pie' && chart.id !== 'line' && chart.id !== 'area' && chart.id !== 'spine') {
      chart.selected = !chart.selected;
    } else if (this.mul_element_time_frame.includes(this.selectedOption)) {
      chart.selected = !chart.selected;
    }
    this.onOptionChange();  // Update data and charts based on selection
  }

  public fetchData(endpoint: string) {
    const apiUrl = `http://127.0.0.1:8000/api/report/${endpoint}`;

    this.http.get(apiUrl).subscribe(
      (resp: any) => {
        this.errorMessage = null;

        let labels: string[] = Array.isArray(resp.label) ? resp.label : [resp.label];
        let data: number[] = Array.isArray(resp.revenue) ? resp.revenue : [resp.revenue];

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

  createChart(chartId: string, typename: any, labels: string[], data: number[]) {
    this.destroyChart(chartId);

    const canvas = document.getElementById(chartId) as HTMLCanvasElement;
    const ctx = canvas?.getContext('2d');
    if (ctx) {
      this.chartInstances[chartId] = new Chart(ctx, {
        type: typename,
        data: {
          labels: labels,    
          datasets: [{
            label: '# of Sales',
            data: data,
            fill:  (chartId === 'line' || chartId === 'pie' || chartId === 'spine') ? false : true,
            borderWidth: 1,
            barThickness: chartId === 'Horizontal Bar' ? 2 : 30,
            maxBarThickness: 50,
            hoverBackgroundColor: "rgba(255,99,132,0.4)",
            hoverBorderColor: "rgba(255,99,132,1)",
            backgroundColor: chartId === 'pie' ? ['rgba(255,99,132,0.2)', 'rgba(54,162,235,0.2)', 'rgba(255,206,86,0.2)'] : "rgba(255,99,132,0.2)",
            borderColor: chartId === 'pie' ? 'transparent' : "rgba(255,99,132,1)",
            pointBorderWidth: 5,
          }]
        },
        options: {
          animations: chartId === 'area' || chartId === 'line' ? {
            tension: {
              duration: 2000,
              easing: 'linear',
              from: 1,
              to: 0,
              loop: false
            }
          } : false,
          tension:(chartId === 'spine') ? 0.5 : 0,
          indexAxis: (chartId === 'Horizontal Bar') ? 'y' : 'x',
          responsive: true,
          scales: chartId === 'Horizontal Bar' ? {
            x: { stacked: true, ticks: { autoSkip: true, maxTicksLimit: 24 } },
            y: { stacked: true }
          } : {},
          plugins: {
            title: { display: true, text: '' },
            legend: { position: 'top' }
          },
        },
      });
    }
  }

  destroyChart(chartId: string) {
    const chart = this.chartInstances[chartId];
    if (chart) {
      chart.destroy();
      this.chartInstances[chartId] = null;
    }
  }

  getIconClass(title: string): string {
    return this.iconMap[title] || 'fa-chart-bar';
  }

  toggleSelectAll() {
    this.allChartsSelected = !this.allChartsSelected;
    this.charts.forEach((chart) => {
      if (this.mul_element_time_frame.includes(this.selectedOption) || !['pie', 'line', 'area', 'spine'].includes(chart.id)) {
        chart.selected = this.allChartsSelected;
      }
    });
    this.onOptionChange();
  }

  showErrorLabel() {
    this.showError = true;
    setTimeout(() => {
      this.showError = false;
    }, 5000); // Show error for 5 seconds
  }
}
