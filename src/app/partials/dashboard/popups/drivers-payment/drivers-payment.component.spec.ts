import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DriversPaymentComponent } from './drivers-payment.component';

describe('DriversPaymentComponent', () => {
  let component: DriversPaymentComponent;
  let fixture: ComponentFixture<DriversPaymentComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DriversPaymentComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DriversPaymentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
