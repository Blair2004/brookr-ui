import { Injectable } from '@angular/core';
import { TendooService } from '@cloud-breeze/services';

@Injectable({
  providedIn: 'root'
})
export class LoadsService {
  baseUrl: string;
  constructor(
    private tendoo: TendooService
  ) { 
    this.baseUrl  = this.tendoo.baseUrl;
  }

  registerLoads( fields, index = undefined ) {
    return this.tendoo[ index === undefined ? 'post' : 'post' ]( `${this.baseUrl}brookr/loads${index !== undefined ? '/edit/' + index : ''}`, fields );
  }

  getUnassignedLoads() {
    return this.tendoo.get( `${this.baseUrl}brookr/loads/unassigned` );
  }
}
