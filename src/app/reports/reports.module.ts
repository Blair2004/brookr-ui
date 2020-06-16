import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ReportsRoutingModule } from './reports-routing.module';
import { DriversReportComponent } from './components/drivers-report/drivers-report.component';
import { LoadsReportComponent } from './components/loads-report/loads-report.component';
import { DeclarationsModule } from '../declarations/declarations.module';
import { CompaniesReportComponent } from './components/companies-report/companies-report.component';


@NgModule({
  declarations: [ DriversReportComponent, LoadsReportComponent, CompaniesReportComponent],
  imports: [
    CommonModule,
    ReportsRoutingModule,
    DeclarationsModule
  ]
})
export class ReportsModule { }
