import { Injectable } from '@angular/core';
import { TendooService } from '@cloud-breeze/services';

@Injectable({
  providedIn: 'root'
})
export class CompanyService {
  loadReport( data ) {
    return this.tendoo.post( `${this.tendoo.baseUrl}brookr/companies/report`, data );
  }

  constructor(
    private tendoo: TendooService
  ) { }

  getCompanies() {
    return this.tendoo.get( `${this.tendoo.baseUrl}brookr/companies` );
  }

  getCompaniesFuels( value ) {
    return this.tendoo.post( `${this.tendoo.baseUrl}brookr/companies/get-fuels`, value );
  }

  getCompanyDrivers( id ) {
    return this.tendoo.get( `${this.tendoo.baseUrl}brookr/companies/${id}/drivers` );
  }

  saveFuelExpense( form, amount, report_id ) {
    return this.tendoo.post( `${this.tendoo.baseUrl}brookr/companies/${form.company_id}/fuel`, { ...form, amount, report_id });
  }
}
