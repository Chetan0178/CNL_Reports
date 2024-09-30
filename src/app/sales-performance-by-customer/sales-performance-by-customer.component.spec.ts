import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesPerformanceByCustomerComponent } from './sales-performance-by-customer.component';

describe('SalesPerformanceByCustomerComponent', () => {
  let component: SalesPerformanceByCustomerComponent;
  let fixture: ComponentFixture<SalesPerformanceByCustomerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalesPerformanceByCustomerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesPerformanceByCustomerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
