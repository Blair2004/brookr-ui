import { Component, OnInit } from '@angular/core';
import { Field } from '@cloud-breeze/core';
import { FormGroup } from "@angular/forms";
import { ValidationGenerator } from '@cloud-breeze/utilities';
import { CompanyService } from "../../../services/company.service";
import * as moment from 'moment';
import { MatSnackBar } from "@angular/material/snack-bar";

interface Section {
  title: string;
  identifier: string;
  description?: string;
  active: boolean;
}

@Component({
  selector: 'app-companies-report',
  templateUrl: './companies-report.component.html',
  styleUrls: ['./companies-report.component.scss']
})
export class CompaniesReportComponent implements OnInit {
  sections: Section[]   = [
    {
      title: 'Summary',
      identifier: 'summary',
      active: true
    }, {
      title: 'Fuel Management',
      identifier: 'fuel-management',
      active: false
    }
  ];

  fuelFields: Field[]   = [
    {
      type: 'text',
      label: 'Cost',
      description: 'Add a new fuel expense to the current load',
      validation: 'required',
      appearance: 'outline',
      name: 'fuel'
    }
  ];

  fuelForm: FormGroup;

  companyFields: Field[]   = [
    {
      type: 'select',
      name: 'company_id',
      label: 'Select Company',
      description: 'For which company the report should be generated.'
    }, {
      type: 'ng-datetime',
      name: 'range_start',
      label: 'Range Start',
      description: 'Select the range start. Time starts at 00:00am'
    }, {
      type: 'ng-datetime',
      name: 'range_end',
      label: 'Range End',
      description: 'Select the range ends. Time ends at 11:59pm'
    }, 
  ];

  companyFormGroup: FormGroup;

  constructor(
    private companiesService: CompanyService,
    private snackbar: MatSnackBar,
  ) { }

  ngOnInit(): void {
    this.fuelForm           =   ValidationGenerator.buildFormGroup( this.fuelFields ).formGroup;
    this.companiesService.getCompanies().subscribe( ( companies: any[] ) => {
      const keyValueOptions   = [];

      companies.forEach( company => {
        keyValueOptions.push({
          label: company.name,
          value: company.id
        })
      });

      this.companyFields[0].options   = keyValueOptions;
      this.companyFormGroup           =   ValidationGenerator.buildFormGroup( this.companyFields ).formGroup;
    })
  }

  setSectionActive( section: Section ) {
    this.sections.forEach( s => s.active = false );
    section.active  = true;

    if ( section.identifier === 'fuel-management' ) {
      this.loadHistory();
    }
  }

  loadHistory() {
    if ( this.companyFormGroup.get( 'company_id' ).value === undefined || this.companyFormGroup.get( 'company_id' ).value.length === 0 ) {
      return this.snackbar.open( 'Consider selecting the company, the start and ending date used as the period during which the fuel record are attached.', 'RETRY', { duration : 20000 })
        .afterDismissed()
        .subscribe( action => {
          if ( action.dismissedByAction ) {
            this.loadHistory();
          }
        })
    }

    this.companiesService.getCompaniesFuels( this.companyFormGroup.value ).subscribe( ( fuels ) => {
      
    })
  }

  get activeSection() {
    return this.sections.filter( s => s.active )[0];
  }

  loadReport() {
    const form      = this.companyFormGroup.value ;
    
    form.range_start  = moment( form.range_start ).format( 'YYYY-MM-DDTHH:mm:ss' );
    form.range_end    = moment( form.range_end ).format( 'YYYY-MM-DDTHH:mm:ss' );

    this.companiesService.loadReport( form ).subscribe( )
  }
}
