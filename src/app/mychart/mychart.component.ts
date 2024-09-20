import { Component, OnInit } from '@angular/core';
import { Chart, registerables } from 'chart.js' 
// import { MasterService } from '../service/master.service';
Chart.register(...registerables);

@Component({
  selector: 'app-mychart',
  standalone: true,
  imports: [],
  templateUrl: './mychart.component.html',
  styleUrl: './mychart.component.css'
})
export class MychartComponent implements OnInit {

  constructor() {}
  ngOnInit(): void {
    const labels = ['Electronics', 'Clothing', 'Groceries', 'Books', 'Toys', 'Furniture', 'Shoes', 'Bags', 'Jewelry', 'Stationery'];
    const data = [55, 78, 65, 45, 35, 85, 60, 75, 50, 90];

    // const id = 'barchart'
    // const type = 'bar'
    this.RenderChart('barchart', 'bar', labels, data);  
    this.RenderChart('piechart', 'pie', labels, data); 
    this.RenderChart('dochart', 'doughnut', labels, data); 
    this.RenderChart('pochart', 'polarArea', labels, data); 
    this.RenderChart('rochart', 'radar', labels, data); 
  }

  RenderChart(id: any,  typename: any, labels: string[], data: number[]){
    new Chart(id, {
      type: typename,
      
      data: {
        labels: labels,
        datasets: [{
          label: '# of Votes',
          data:data,
          borderWidth: 2,
          hoverBackgroundColor : 'skyblue',
          backgroundColor : [
            'Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange','black'
          ],
          borderColor:[
            'rgba(255, 99, 71, 1)'
          ] }],       
      },
      
      options: {
        indexAxis: 'x',
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });

    

  }

}
