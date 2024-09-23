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

    const labels = ['mech', 'Clothing', 'Groceries', 'Books', 'Toys', 'Furniture', 'Shoes', 'Bags', 'Jewelry', 'Stationery'];
    const data = [55, 78, 65, 45, 35, 85, 60, 75, 50, 90];

    // const id = 'barchart'
    // const type = 'bar'
    this.RenderChart('barchart', 'bar', labels, data);  
   }

   RenderChart(id: any,  typename: any, labels: string[], data: number[])
   {
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

  public fetchData(){
        this.http.get('http://127.0.0.1:8000/api/monthly-sales/').subscribe(
          (resp:any) => {
            this.getJsonValue = resp;
          }
        )
    }
}

// =============

 

// export class MychartComponent implements OnInit {
//   public getJsonValue: any;
//   public postJsonValue: any;

//   constructor(private http: HttpClient){}  

//   ngOnInit(): void {   
    
//     this.fetchData()
//     const labels = ['mech', 'Clothing', 'Groceries', 'Books', 'Toys', 'Furniture', 'Shoes', 'Bags', 'Jewelry', 'Stationery'];
//     const data = [55, 78, 65, 45, 35, 85, 60, 75, 50, 90];

//     // const id = 'barchart'
//     // const type = 'bar'
//     this.RenderChart('barchart', 'bar', labels, data);  
//     // this.RenderChart('piechart', 'pie', labels, data); 
//     // this.RenderChart('dochart', 'doughnut', labels, data); 
//     // this.RenderChart('pochart', 'polarArea', labels, data); 
//     // this.RenderChart('rochart', 'radar', labels, data); 
//   }

//   

//   RenderChart(id: any,  typename: any, labels: string[], data: number[]){
//     new Chart(id, {
//       type: typename,
      
//       data: {
//         labels: labels,
//         datasets: [{
//           label: '# of Votes',
//           data:data,
//           borderWidth: 2,
//           hoverBackgroundColor : 'skyblue',
//           backgroundColor : [
//             'Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange','black'
//           ],
//           borderColor:[
//             'rgba(255, 99, 71, 1)'
//           ] }],       
//       },
      
//       options: {
//         indexAxis: 'x',
//         scales: {
//           y: {
//             beginAtZero: true
//           }
//         }
//       }
//     });

    

//   }

// }

