import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { HttpErrorResponse } from '@angular/common/http';
import { Form } from '@cloud-breeze/core';
import { TendooService } from '@cloud-breeze/services';
import { ValidationGenerator } from '@cloud-breeze/utilities';
import { LoadsService } from '../../../services/loads.service';
import * as moment from 'moment';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-manage',
  templateUrl: './manage.component.html',
  styleUrls: ['./manage.component.scss']
})
export class ManageComponent implements OnInit {
  form: Form;
  @Output( 'changed' ) changed          = new EventEmitter<any>();
  @Input( 'id' ) id : number;
  @Input( 'layout' ) layout: boolean    = true;
  mode  = 'create';

  constructor(
    private activeSnapShot: ActivatedRoute,
    private tendoo: TendooService,
    private snackbar: MatSnackBar,
    private router: Router,
    private loadsService: LoadsService,
  ) { }

  ngOnInit(): void {
    this.activeSnapShot.paramMap.subscribe( param => {
      if ( param.get( 'id' ) && this.id === undefined ) {
        this.mode   = 'edit';
        this.id   = +param.get( 'id' );
      }
    });

    if ( this.id !== undefined ) {
      this.mode   = 'edit';
    }
    
    this.tendoo.forms.getPublicForm( 'brookr.loads', this.id || undefined ).subscribe( ( form: Form ) => {
      form.sections.forEach( s => {
        s.fields.forEach( field => {
          if ( field.type === 'ng-datetime' ) {
            field[ 'value' ]   = <any>(new Date( <string>field.value ));
          }
        });
      });

      this.form     = ValidationGenerator.buildForm( form );
      this.form.sections.forEach( section => {
        if ( section.namespace  === 'main' ) {
          section[ 'render' ]   = false;
        }
      })
      this.form   = form;
    })
  }

  clearCustomer() {
    this.form.sections[1].formGroup.controls[ 'brooker_id' ].setValue( '' );
  }
  clearDriver() {
    this.form.sections[2].formGroup.controls[ 'driver_id' ].setValue( '' );
  }

  handleSubmit( form: Form ) {
    this.form.sections.forEach( s => ValidationGenerator.touchAllFields( s.formGroup ) );

    if ( this.form.formGroup.invalid ) {
      return this.snackbar.open( 'Unable to proceed the form is not valid.', 'OK', { duration : 3000 });
    }

    this.form.sections.forEach( s => ValidationGenerator.deactivateFields( s.fields ) );

    const formData    =  new FormData;

    this.form.sections.forEach( s => {
      s.fields.forEach( field => {
        if ( [ 'ng-datetime' ].includes( field.type ) ) {
          formData.append( 
            s.namespace + '--' + field.name, 
            moment( field.control.value ).format( 'YYYY-MM-DD HH:mm' ) 
          );
        } else {
          formData.append( 
            s.namespace + '--' + field.name, 
            field.control.value
          );
        }
      })
    });

    this.loadsService.registerLoads( formData, this.id ).subscribe( result => {
      this.snackbar.open( result[ 'message' ], 'OK', { duration: 3000 });
      if ( this.layout ) {
        this.router.navigateByUrl( '/dashboard/loads' );
      } else {
        this.changed.emit( result );
      }
    }, ( result: HttpErrorResponse ) => {
      this.snackbar.open( result[ 'error' ].message || result.message || 'An unexpected error has occured.', 'OK', { duration: 6000 });
      this.form.sections.forEach( s => ValidationGenerator.enableFields( s.fields ) );
    });
  }
}
