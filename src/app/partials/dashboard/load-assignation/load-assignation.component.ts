import { Component, OnInit, Inject } from '@angular/core';
import { TendooService } from '@cloud-breeze/services';
import { MAT_DIALOG_DATA, MatDialog } from '@angular/material/dialog';
import { Form, Dialog, DialogComponent } from '@cloud-breeze/core';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialogRef } from "@angular/material/dialog";
import { ValidationGenerator } from '@cloud-breeze/utilities';
import { AppState } from '../../../store/state';
import { Store } from '@ngrx/store';
import { AppActions } from '../../../store/action';

@Component({
  selector: 'app-load-assignation',
  templateUrl: './load-assignation.component.html',
  styleUrls: ['./load-assignation.component.scss']
})
export class LoadAssignationComponent implements OnInit {
  form: Form;
  orderId: any;
  constructor(
    private tendoo: TendooService,
    private store: Store<AppState>,
    private snackbar: MatSnackBar,
    private dialogRef: MatDialogRef<LoadAssignationComponent>,
    @Inject( MAT_DIALOG_DATA ) private data: any,
    private dialog: MatDialog,
  ) { 
    this.orderId  = data.id;
  }

  ngOnInit(): void {
    /**
     * this to as a workaround
     * for the ExpressionChanged... issue
     */
    setTimeout( () => {
      this.tendoo.forms.getPublicForm( 'broork.loads-drivers', this.orderId ).subscribe( ( form: Form ) => {
        this.form   = ValidationGenerator.buildForm( form );
      }, ( response: HttpErrorResponse ) => {
        this.snackbar.open( response.error[ 'message' ] || response.message, 'OK', { duration: 3000 });
      });
    }, 0 );
  }

  closeDialog() {
    this.dialog.getDialogById( 'assign-load' ).close();
  }

  saveDriverDetails() {
    this.form.sections.forEach( s => ValidationGenerator.touchAllFields( s.formGroup ) );
    
    if ( this.form.formGroup.invalid ) {
      return this.snackbar.open( 'Unable to proceed the form is not valid.', 'OK', { duration: 3000 });
    }
    
    this.form.sections.forEach( s => ValidationGenerator.deactivateFields( s.fields ) );
    
    this.tendoo.put( `${this.tendoo.baseUrl}brookr/loads/update-driver/${this.orderId}`, this.form.formGroup.value ).subscribe( result => {
      this.snackbar.open( result[ 'message' ], 'OK', { duration: 3000 });
      this.dialog.getDialogById( 'assign-load' ).close();
    }, ( result: HttpErrorResponse ) => {
      this.form.sections.forEach( s => ValidationGenerator.enableFields( s.fields ) );
      this.snackbar.open( result[ 'error' ].message || result.message, 'OK', { duration: 5000 });
    });
  }

  removeDriver() {
    this.dialog.open( DialogComponent, {
      id: 'confirm-remove-driver',
      data: <Dialog> {
        title: 'Unassigning The Driver',
        message: 'Would you like to confirm the removal of the driver ?',
        buttons: [
          {
            label: 'Yes',
            onClick: () => {
              this.tendoo.get( `${this.tendoo.baseUrl}brookr/loads/unassign/${this.orderId}` ).subscribe( result => {
                this.snackbar.open( result[ 'message' ], 'OK', { duration: 3000 });
                this.dialog.getDialogById( 'confirm-remove-driver' ).close();
                this.dialogRef.close();
              }, ( result: HttpErrorResponse ) => {
                this.snackbar.open( result[ 'error' ].message || result.message, 'OK', { duration: 6000 });
              })
            }
          }, {
            label: 'No',
            onClick: () => {
              this.dialog.getDialogById( 'confirm-remove-driver' ).close();
            }
          }
        ]
      }
    })
  }
}
