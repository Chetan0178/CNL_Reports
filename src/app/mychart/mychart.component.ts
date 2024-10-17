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
  options: string[] = ['Today', 'yesterday', 'Last 7 Days Revenue','Current Month Revenue','Last Month Revenue', 'Last 3 Months Revenue', 'Last 6 Months Revenue','Current Quarter Revenue', 'Year to Current Date Revenue','Last 12 Months' ];
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
    { title: 'Bar Chart',   id: 'bar',   selected: false },
    { title: 'Horizontal Bar Chart', id: 'Horizontal Bar', selected: false },
  ];
  allChartsSelected = false;

  iconMap: { [key: string]: string } = {
    // 'Line Chart':  'fas fa-chart-line',
    // 'Area Chart':  'fas fa-chart-area',
    'Bar Chart':   'fa-solid fa-chart-column',
    'Horizontal Bar Chart': 'fa-regular fa-chart-bar',   
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
        this.fetchData('last_3_months_revenue');     
        break;
      case 'Last 6 Months Revenue':
        this.fetchData('last_6_month_revenue');           
        break;
      case 'Current Quarter Revenue':
        this.fetchData('current_quarter_revenue');      
        break;
      case 'Year to Current Date Revenue':
        this.fetchData('year_to_date');      
        break;
      case 'Last 12 Months':
        this.fetchData('year_to_last_month');      
        break;
      default:
        this.message = '';
    }
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
  public fetchData(endpoint: string) {
    const apiUrl = `http://127.0.0.1:8000/api/report/${endpoint}`;

    this.http.get(apiUrl).subscribe(
      (resp: any) => {
        this.errorMessage = null;

        let labels: string[];
        let data: number[];

        if (Array.isArray(resp.label) && Array.isArray(resp.revenue)) {
            labels = resp.label;
            data = resp.revenue;
        } else {
            labels = [resp.label];
            data = [resp.revenue];
        }

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
            fill: true,
            borderWidth: 1,
            barThickness: chartId == 'Horizontal Bar' ? 2 : 30,
            maxBarThickness: 50,
            hoverBackgroundColor: "rgba(255,99,132,0.4)",
            hoverBorderColor: "rgba(255,99,132,1)",
            backgroundColor: "rgba(255,99,132,0.2)",
            borderColor: "rgba(255,99,132,1)",
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
          indexAxis: chartId == 'Horizontal Bar' ? 'y':'x',
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
