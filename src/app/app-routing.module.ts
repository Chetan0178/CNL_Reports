import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MychartComponent } from './mychart/mychart.component';
import { SalesOrderTrendComponent } from './sales-order-trend/sales-order-trend.component';

const routes: Routes = [
  { path: 'chart', component: MychartComponent },
  { path: 'sale_order_trend', component:SalesOrderTrendComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  
})
export class AppRoutingModule { }
