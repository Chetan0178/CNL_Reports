import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { MychartComponent } from './mychart/mychart.component';
import { SalesOrderTrendComponent } from './sales-order-trend/sales-order-trend.component';
import { SalesPerformanceByCustomerComponent } from './sales-performance-by-customer/sales-performance-by-customer.component';
import { HighSellingProductsComponent } from './high-selling-products/high-selling-products.component';
import { QueryRunnerComponent } from './query-runner/query-runner.component';
import { QueryBuilderComponent } from './query-builder/query-builder.component';


const routes: Routes = [
  { path: 'chart', component: MychartComponent },
  { path: 'sale_order_trend', component:SalesOrderTrendComponent},
  { path : 'sales_performance' , component:SalesPerformanceByCustomerComponent},
  { path : 'high_salling_product', component:HighSellingProductsComponent},
  { path : 'query_runner', component:QueryRunnerComponent },
  { path : 'query_builder', component:QueryBuilderComponent },

];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
  
})
export class AppRoutingModule { }
