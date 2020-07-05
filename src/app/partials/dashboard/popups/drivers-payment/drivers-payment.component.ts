import { Component, OnInit, Inject } from '@angular/core';
import { TendooService } from '@cloud-breeze/services';
import { MatSnackBar } from "@angular/material/snack-bar";
import { Form, DialogComponent, Dialog } from '@cloud-breeze/core';
import { ValidationGenerator } from '@cloud-breeze/utilities';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialog } from "@angular/material/dialog";
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-drivers-payment',
  templateUrl: './drivers-payment.component.html',
  styleUrls: ['./drivers-payment.component.scss']
})
export class DriversPaymentComponent implements OnInit {
  form: Form;
  driver: any;
  tabs  = [];
  title: string = '';
  history   = [];

  constructor(
    private snackbar: MatSnackBar,
    private tendoo: TendooService,
    @Inject( MAT_DIALOG_DATA ) private data: any,
    private dialogRef: MatDialogRef<DriversPaymentComponent>,
    private dialog: MatDialog,
  ) { 
    this.tabs   = this.data.tabs;
    this.title  = this.data.title;
  }

  setActive( tab ) {
    this.tabs.forEach( _t => _t.active = false ); 
    tab.active = true;
    this.detectLoaded();
  }

  get selectedTab() {
    return this.tabs.filter( _t => _t.active )[0];
  }

  detectLoaded() {
    if ( this.selectedTab.identifier === 'history' ) {
      this.tendoo.get( `${this.tendoo.baseUrl}brookr/drivers/payments/${this.data.resource.id}` )
        .subscribe( (result: any[]) => {
          console.log( result );
          this.history  = result[ 'payments' ];
        })
    }
  }

  deletePayment( payment ) {
    this.dialog.open( DialogComponent, {
      id: 'confirm-delete-payment',
      data: <Dialog>{
        buttons: [
          {
            namespace: 'yes',
            label: 'Yes',
            onClick: () => {
              this.tendoo.delete( `${this.tendoo.baseUrl}brookr/drivers/payments/${payment.id}` )
                .subscribe( result => {
                  this.snackbar.open( result[ 'message' ], 'OK', { duration: 4000 });
                  this.dialog.getDialogById( 'confirm-delete-payment' ).close();
                  this.detectLoaded();
                }, ( result: HttpErrorResponse ) => {
                  this.snackbar.open( result[ 'error' ].message || result.message, 'GOT IT' );
                })
            }
          }, {
            label: 'No', 
            namespace: 'no',
            onClick: () => {
              this.dialog.getDialogById( 'confirm-delete-payment' ).close();
            }
          }
        ],
        message: 'Would you like to deleted this record ? Cannot be restored.',
        title: 'Please Confirm Your Action'
      },
      width: [
        this.tendoo.responsive.isLG(),
        this.tendoo.responsive.isXL(),
      ].includes( true ) ? '400px' : '80%',
      height: [
        this.tendoo.responsive.isLG(),
        this.tendoo.responsive.isXL(),
      ].includes( true ) ? '200px' : '40%',
    })
  }

  ngOnInit(): void {
    setTimeout( () => {
      this.tendoo.forms.getPublicForm( this.data.formNamespace ).subscribe( ( form: Form ) => {
        this.form   = ValidationGenerator.buildForm( form );
      })
    }, 0 )
  }

  closePopup() {
    this.dialogRef.close();
  }

  savePayment() {
    this.form.sections.forEach( s => ValidationGenerator.touchAllFields( s.formGroup ) );

    if ( this.form.formGroup.invalid ) {
      return this.snackbar.open( 'Unable to proceed the form is not valid', 'OK', { duration: 3000 });
    }

    this.tendoo[ this.data.mode === 'edit' ? 'put' : 'post' ]( `${this.tendoo.baseUrl}${this.data.postNamespace}${this.data.mode === 'edit' ? '' : this.data.resource.id}`, this.form.formGroup.value ).subscribe( result => {
      this.snackbar.open( result[ 'message' ], 'OK', { duration: 3000 });
      this.dialogRef.close();
    }, ( response: HttpErrorResponse ) => {
      this.snackbar.open( response[ 'error' ].message || response[ 'message' ], 'OK', { duration: 6000 });
    })
  }

  openPaymentPopup( payment ) {
    this.dialog.open( DriversPaymentComponent, {
      id: 'edit-payment-popup',
      data: {
        resource: payment,
        mode: 'edit',
        formNamespace: `brookr.advance-payment.drivers/${payment.id}`,
        postNamespace: `brookr/drivers/payments/${payment.id}`,
        tabs: [
          {
            label: 'Edit Payment',
            identifier: 'new',
            active: true
          }, 
        ],
        title: 'Edit Payment'
      },
      width: [
        this.tendoo.responsive.isLG(),
        this.tendoo.responsive.isXL(),
      ].includes( true ) ? '600px' : '80%',
      height: [
        this.tendoo.responsive.isLG(),
        this.tendoo.responsive.isXL(),
      ].includes( true ) ? '600px' : '80%',
    }).afterClosed() 
      .subscribe( _ => {
        this.detectLoaded();
      })
  }
}
