import { Component, OnInit, OnChanges, } from '@angular/core';
import { Field, DialogComponent, Dialog } from '@cloud-breeze/core';
import { FormGroup } from "@angular/forms";
import { ValidationGenerator } from '@cloud-breeze/utilities';
import { CompanyService } from "../../../services/company.service";
import * as moment from 'moment';
import { MatSnackBar } from "@angular/material/snack-bar";
import { HttpErrorResponse } from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { TendooService } from '@cloud-breeze/services';

interface Section {
  title: string;
  identifier: string;
  description?: string;
  active: boolean;
}

interface ReportResponse {
  loads: any[];
  company: any;
  report: any;
  drivers: any[],
  payments:any[],
  fuels: any[]
}

@Component({
  selector: 'app-companies-report',
  templateUrl: './companies-report.component.html',
  styleUrls: ['./companies-report.component.scss']
})
export class CompaniesReportComponent implements OnInit, OnChanges {
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

  fullReport: ReportResponse    = {
    loads: [],
    company : {},
    report : {},
    drivers : [],
    payments : [],
    fuels: [],
  };

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
      description: 'For which company the report should be generated.',
      validation: 'required'
    }, {
      type: 'ng-datetime',
      name: 'range_start',
      label: 'Range Start',
      description: 'Select the range start. Time starts at 00:00am',
      validation: 'required'
    }, {
      type: 'ng-datetime',
      name: 'range_end',
      label: 'Range End',
      description: 'Select the range ends. Time ends at 11:59pm',
      validation: 'required'
    }, {
      type: 'select',
      options: [],
      name: 'driver_id',
      label: 'Driver',
      description: 'Select the driver from the company from which you would like to generate the report.',
      validation: 'required'
    }, 
  ];

  companyFormGroup: FormGroup;
  reportLoaded: boolean   = false;
  fuelRecords: any[];

  constructor(
    private companiesService: CompanyService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private tendoo: TendooService
  ) { }

  ngOnChanges() {
  }

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

      this.companyFormGroup.valueChanges.subscribe( form => {
        console.log( form );
        if ( form.company_id !== null && form.driver_id === null ) {
          this.companiesService.getCompanyDrivers( form.company_id ).subscribe( company => {
            this.companyFields[3].options   = company[ 'drivers' ].map( driver => {
              return {
                label: driver.details.first_name + ' ' + driver.details.last_name,
                value: driver.id
              }
            })
          })
        }
      })
    });
  }

  saveFuelExpense() {
    this.companiesService.saveFuelExpense( this.companyFormGroup.value, this.fuelFields[0].control.value, this.fullReport.report.id ).subscribe( result => {
      this.snackbar.open( result[ 'message' ], 'OK', { duration: 3000 });
      this.loadHistory();
      this.fuelForm.reset();
    })
  }

  setSectionActive( section: Section ) {
    if ( ! this.reportLoaded ) {
      return this.snackbar.open( 'Please specificy the time range and the company for which you would like to manage the report', 'OK', { duration: 6000 });
    }

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

    this.companiesService.getCompaniesFuels({ ...this.companyFormGroup.value, report_id : this.fullReport.report.id }).subscribe( ( fuels: any[] ) => {
      this.fuelRecords   = fuels;
    })
  }

  get activeSection() {
    return this.sections.filter( s => s.active )[0];
  }

  deleteFuel( fuel ) {
    this.dialog.open( DialogComponent, {
      id: 'confirm-fuel-deletion',
      data: <Dialog> {
        title: 'Delete the Fuel Record',
        message: 'The selected fueld record will be deleted.',
        buttons: [
          {
            label: 'Yes',
            onClick: () => {
              this.tendoo.delete( `${this.tendoo.baseUrl}brookr/companies/fuel/${fuel.id}` ).subscribe( result => {
                this.snackbar.open( result[ 'message' ], 'OK', { duration: 3000 });
                this.loadHistory();
                this.dialog.getDialogById( 'confirm-fuel-deletion' ).close();
              })
            }
          }, {
            label: 'No',
            onClick: () => {
              this.dialog.getDialogById( 'confirm-fuel-deletion' ).close();
            }
          }
        ]
      }
    })
  }

  loadReport() {
    if ( this.companyFormGroup.invalid ) {
      return this.snackbar.open( 'Unable to generate a report. Please make sure to select a company and a time range.', 'OK', { duration : 5000 });
    }
    const form      = this.companyFormGroup.value ;
    
    form.range_start  = moment( form.range_start ).format( 'YYYY-MM-DDTHH:mm:ss' );
    form.range_end    = moment( form.range_end ).format( 'YYYY-MM-DDTHH:mm:ss' );

    this.companiesService.loadReport( form ).subscribe( (result: ReportResponse) => {
      this.reportLoaded   = true;
      this.fullReport     = result;
    }, ( result: HttpErrorResponse ) => {
      this.snackbar.open( result[ 'error' ].message || result.message, 'OK', { duration: 10000 });
    });
  }
}
