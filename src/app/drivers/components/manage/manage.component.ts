import { Component, OnInit } from '@angular/core';
import { ActivatedRouteSnapshot, ActivatedRoute, Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import * as moment from "moment";
import { TendooService } from '@cloud-breeze/services';
import { Form, Field } from '@cloud-breeze/core';
import { ValidationGenerator } from '@cloud-breeze/utilities';
import { DriversService } from '../../../services/drivers.service';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  mode  = 'create';
  id    = '';
  form: Form;
  constructor(
    private routeSnapshot: ActivatedRoute,
    private tendoo: TendooService,
    private client: HttpClient,
    private driversService: DriversService,
    private snackbar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.routeSnapshot.paramMap.subscribe( param => {
      if ( param.get( 'id' ) ) {
        this.mode   = 'edit';
        this.id     = param.get( 'id' );
      }
      this.generateForm();
    });
  }

  generateForm() {
    this.tendoo.forms.getPublicForm( 'brookr.drivers', +this.id > 0 ? +this.id : undefined ).subscribe( (form:Form) => {
      this.form   = form;
    });
  }

  selectThis( section ) { 
    this.form.sections.forEach( s => s[ 'active' ] = false );
    section.active  = true;
  }

  handleFieldChange( field: Field ) {
    if ( field.type === 'file-upload' && field.data && typeof field.data[ 'upload' ] !== 'undefined' ) {
      const formData    =   new FormData;
      
      formData.append( 
        field.data[ 'upload' ].name || 'file',
        field.control.value
      );

      formData.append( 'field', field.data[ 'upload' ].name || 'file' );

      field.data[ 'upload' ].isUploading  = true;

      this.tendoo.post( `${this.tendoo.baseUrl}brookr/medias/upload`, formData ).subscribe( ( result: Field ) => {
        console.log( result );
        field.control.setValue( result.value );
        field.data[ 'upload' ].isUploading  = false;
      }, ( result: HttpErrorResponse ) => {
        field.data[ 'upload' ].isUploading  = false;
        this.snackbar.open( result[ 'error' ].message || result.message, 'OK', { duration: 3000 });
      });
    }
  }

  handleSubmit( form: Form ) {
    this.form.sections.forEach( s => ValidationGenerator.touchAllFields( s.formGroup ) );

    if ( this.form.formGroup.invalid ) {
      return this.snackbar.open( 'Unable to proceed, the form is invalid', 'OK', { duration: 3000 });
    }

    this.form.sections.forEach( section => {
      section.fields.forEach( field => {
        if ( field.type === 'ng-datetime' ) {
          const formControl  = section.formGroup.get( field.name );
          if ( formControl.value ) {
            formControl.setValue( moment( formControl.value ).format( 'YYYY-MM-DD HH:mm' ) );
          }
        }
      })
    })

    this.setFieldsState( 'disable' );
    this.driversService.setDriver( this.form.formGroup.value, +this.id > 0 ? +this.id : null ).subscribe( result => {
      this.setFieldsState( 'enable' );
      this.snackbar.open( result[ 'message' ], 'OK', { duration : 3000 });

      if ( ! this.id ) {
        this.router.navigateByUrl( '/dashboard/drivers' );
      }
    }, ( result ) => {
      this.snackbar.open( result[ 'error' ].message || result[ 'message' ] || 'An unexpected error has occured', 'OK', { duration : 3000 });
      this.setFieldsState( 'enable' );
    })
  }

  setFieldsState( state ) {
    this.form.sections.forEach( s => ValidationGenerator[ state === 'disabled' ? 'deactivateFields' : 'enableFields' ]( s.fields ) );
  }
}
