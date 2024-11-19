import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AngMatComponent } from './ang-mat.component';

describe('AngMatComponent', () => {
  let component: AngMatComponent;
  let fixture: ComponentFixture<AngMatComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AngMatComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AngMatComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
