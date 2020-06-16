import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { DriversReportComponent } from './components/drivers-report/drivers-report.component';
import { LoadsReportComponent } from './components/loads-report/loads-report.component';
import { CompaniesReportComponent } from './components/companies-report/companies-report.component';

const routes: Routes = [
  { path: 'drivers', component: DriversReportComponent },
  { path: 'loads', component: LoadsReportComponent },
  { path: 'companies', component: CompaniesReportComponent },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ReportsRoutingModule { }
