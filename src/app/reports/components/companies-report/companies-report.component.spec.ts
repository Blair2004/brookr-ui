import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CompaniesReportComponent } from './companies-report.component';

describe('CompaniesReportComponent', () => {
  let component: CompaniesReportComponent;
  let fixture: ComponentFixture<CompaniesReportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CompaniesReportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CompaniesReportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
