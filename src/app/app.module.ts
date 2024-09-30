import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MychartComponent } from './mychart/mychart.component';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { SalesOrderTrendComponent } from './sales-order-trend/sales-order-trend.component';
import { SalesPerformanceByCustomerComponent } from './sales-performance-by-customer/sales-performance-by-customer.component';

@NgModule({
  declarations: [
    AppComponent,
    MychartComponent,
    SalesOrderTrendComponent,
    SalesPerformanceByCustomerComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
