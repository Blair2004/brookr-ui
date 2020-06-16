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
}
