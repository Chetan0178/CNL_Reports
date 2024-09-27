import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesOrderTrendComponent } from './sales-order-trend.component';

describe('SalesOrderTrendComponent', () => {
  let component: SalesOrderTrendComponent;
  let fixture: ComponentFixture<SalesOrderTrendComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [SalesOrderTrendComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SalesOrderTrendComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
