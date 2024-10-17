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
    'Last 12 Months'
  ];
  selectedOption: string = 'Today'; 
  message: string = 'Char analysis';
  private chartInstances: { [key: string]: Chart | null } = {};

  charts = [
    { title: 'Bar Chart', id: 'bar', selected: false },
    { title: 'Horizontal Bar Chart', id: 'Horizontal Bar', selected: false },
    { title: 'Pie Chart', id: 'pie', selected: false },
  ];
  allChartsSelected = false;

  iconMap: { [key: string]: string } = {
    'Bar Chart': 'fa-solid fa-chart-column',
    'Horizontal Bar Chart': 'fa-regular fa-chart-bar',
    'Pie Chart': 'fa-solid fa-pie-chart',
  };

  // List of options to enable the Pie Chart
  pie_chart_time_frame: string[] = [
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
        return 'pie'; // Return 'pie' for Pie Chart
      default:
        return 'bar';
    }
  }

  onOptionChange() {
    // Reset the Pie Chart selection only when the time frame changes to an invalid one
    if (!this.pie_chart_time_frame.includes(this.selectedOption)) {
        this.charts.find(chart => chart.id === 'pie')!.selected = false; 
    }

    switch (this.selectedOption) {
      case 'Today':
        this.fetchData('todays_revenue');  
        break;
      case 'yesterday':
        this.fetchData('yesterday_revenue');   
        break;
      case 'Last 7 Days Revenue':
        this.fetchData('last_7_days_revenue');         
        break;
      case 'Current Month Revenue':
        this.fetchData('current_month_revenue');      
        break;
      case 'Last Month Revenue':
        this.fetchData('last_month_revenue');      
        break;
      case 'Last 3 Months Revenue':
      case 'Last 6 Months Revenue':
      case 'Current Quarter Revenue':
      case 'Year to Current Date Revenue':
        this.fetchData(this.selectedOption.replace(/ /g, '_').toLowerCase()); 
        break;
      case 'Last 12 Months':
        this.fetchData('year_to_last_month');      
        break;
      default:
        this.message = '';
    }
    this.updateChartSelections(); // Update chart selections based on the time frame
}

updateChartSelections() {
    // Ensure Pie Chart is only available for the valid time frames
    this.charts.forEach(chart => {
        if (chart.id === 'pie' && !this.pie_chart_time_frame.includes(this.selectedOption)) {
            chart.selected = false;
        }
    });
}

toggleChartSelection(chart: any) {
    // Only allow Pie Chart to be selected if in a valid time frame
    if (chart.id !== 'pie' || (chart.id === 'pie' && this.pie_chart_time_frame.includes(this.selectedOption))) {
        chart.selected = !chart.selected;
        this.onOptionChange();  // Update data and charts based on selection
    }
}


  public fetchData(endpoint: string) {
    const apiUrl = `http://127.0.0.1:8000/api/report/${endpoint}`;

    this.http.get(apiUrl).subscribe(
      (resp: any) => {
        this.errorMessage = null;

        let labels: string[] = Array.isArray(resp.label) ? resp.label : [resp.label];
        let data: number[] = Array.isArray(resp.revenue) ? resp.revenue : [resp.revenue];

        console.log("=====>>>>>>>>", labels, data);
        
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
    this.destroyChart(chartId); // Destroy existing chart instance if any
  
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
            fill: chartId === 'pie' ? false : true, // Adjust fill for Pie Chart
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
          indexAxis: chartId === 'Horizontal Bar' ? 'y':'x',
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
      if (chart.id !== 'pie' || (chart.id === 'pie' && this.pie_chart_time_frame.includes(this.selectedOption))) {
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
