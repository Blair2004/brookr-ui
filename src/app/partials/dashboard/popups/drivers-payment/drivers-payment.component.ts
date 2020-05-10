import { Component, OnInit, Inject } from '@angular/core';
import { TendooService } from '@cloud-breeze/services';
import { MatSnackBar } from "@angular/material/snack-bar";
import { Form } from '@cloud-breeze/core';
import { ValidationGenerator } from '@cloud-breeze/utilities';
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-drivers-payment',
  templateUrl: './drivers-payment.component.html',
  styleUrls: ['./drivers-payment.component.scss']
})
export class DriversPaymentComponent implements OnInit {
  form: Form;
  driver: any;

  constructor(
    private snackbar: MatSnackBar,
    private tendoo: TendooService,
    @Inject( MAT_DIALOG_DATA ) private data: any,
    private dialogRef: MatDialogRef<DriversPaymentComponent>
  ) { }

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

    this.tendoo.post( `${this.tendoo.baseUrl}${this.data.postNamespace}${this.data.resource.id}`, this.form.formGroup.value ).subscribe( result => {
      this.snackbar.open( result[ 'message' ], 'OK', { duration: 3000 });
      this.dialogRef.close();
    }, ( response: HttpErrorResponse ) => {
      this.snackbar.open( response[ 'error' ].message || response[ 'message' ], 'OK', { duration: 6000 });
    })
  }
}
