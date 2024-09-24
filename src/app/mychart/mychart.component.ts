import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
 import { Chart, registerables } from 'chart.js' 
 Chart.register(...registerables);


@Component({
  selector: 'app-mychart',
  templateUrl: './mychart.component.html',
  styleUrl: './mychart.component.css'
})
export class MychartComponent  implements OnInit{
  public getJsonValue: any;
  public postJsonValue: any;
 
  constructor(private http:HttpClient){}
  ngOnInit(): void {

    this.fetchData() 
   }

   RenderChart(id: any,  typename: any, labels: string[], data: number[])
   {
    new Chart(id, {
      type: typename,
      
      data: {
        labels: labels,
        datasets: [{
          label: '# of Sales',
          data:data,
          borderWidth: 1,
          hoverBackgroundColor : 'skyblue',
          backgroundColor : [
            'grey'
          ],
          borderColor:[
            'rgba(255, 99, 71, 1)'
          ] }],       
      },
      
      options: {
        indexAxis: 'y',
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

charts = [
    { title: 'Bar Chart', id: 'barchart' },
    { title: 'Pie Chart', id: 'piechart' },
    { title: 'Doughnut Chart', id: 'dochart' },
    { title: 'Polar Area Chart', id: 'pochart' },
    { title: 'Radar Chart', id: 'rochart' }
];

  public fetchData(){
    this.http.get('http://127.0.0.1:8000/api/monthly-sales/').subscribe(
      (resp:any) => {
        this.getJsonValue = resp;
        // Assign the month and sales_count data from the response
        const labels = resp.month; // Assign the month list to labels
        const data = resp.sales_count; // Assign the sales_count list to data
        console.log("===>", labels)

        // Render the chart with the fetched data
        this.RenderChart('barchart', 'bar', labels, data);  
        this.RenderChart('piechart','pie', labels, data);
        this.RenderChart('dochart','doughnut', labels, data);
        this.RenderChart('pochart','polarArea', labels, data);
        this.RenderChart('rochart','radar', labels, data);          
      },
      (error) => {
        console.error('Error fetching data', error);
      }
    );
}
}
