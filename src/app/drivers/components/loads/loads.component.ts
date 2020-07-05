import { Component, OnInit } from '@angular/core';
import { TendooService } from '@cloud-breeze/services';
import { BrookrTableConfig } from '../../../interfaces/TableConfig';
import { HttpErrorResponse } from '@angular/common/http';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormGroup } from "@angular/forms";
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent, Dialog, Form } from '@cloud-breeze/core';
import { DriverLoadStatus } from '../../../partials/dashboard/driver-load-status/driver-load-status.component';
import { ConfirmDialogObject } from 'projects/cloud-breeze/core/src/lib/interfaces/confirm-dialog';
import { PopupComponent } from '../../../partials/dashboard/popup/popup.component';
import { LoadDeliveryComponent } from '../../../partials/dashboard/popups/load-delivery/load-delivery.component';
import { Popup } from '../../../interfaces/Popup';
import { ValidationGenerator } from '@cloud-breeze/utilities';

@Component({
  selector: 'app-loads',
  templateUrl: './loads.component.html',
  styleUrls: ['./loads.component.scss']
})
export class LoadsComponent implements OnInit {
  config: BrookrTableConfig;

  assignedCrudConfig   =   {
    sort        : {
      direction: 'desc',
      active: 'created_at'
    },
    search      : {},
    page        : {},
    query       : {},
    bulkMenus   : [],
    perPage     : {
      per_page : 30
    }
  }

  unassignedCrudConfig   =   {
    sort        : {
      direction: 'desc',
      active: 'created_at'
    },
    search      : {},
    page        : {},
    query       : {},
    bulkMenus   : [],
    perPage     : {
      per_page : 30
    }
  }

  sections  =   [
    {
      title: 'Assigned Loads',
      namespace: 'assigned.loads',
      description: 'Loads assigned to your account.',
      active: false,
      crud: () => {
        return this.tendoo.crud.getConfig( 'brookr.drivers-loads.assigned', {
          ...this.assignedCrudConfig.page,
          ...this.assignedCrudConfig.perPage,
          ...this.assignedCrudConfig.query,
          ...this.assignedCrudConfig.search,
          ...this.assignedCrudConfig.sort,
        })
      }
    }, {
      title: 'Unassigned Loads',
      namespace: 'unassigned.loads',
      description: 'Pending Loads not assigned to a driver.',
      active: false,
      crud: () => {
        return this.tendoo.crud.getConfig( 'brookr.drivers-loads.unassigned', {
          ...this.unassignedCrudConfig.page,
          ...this.unassignedCrudConfig.perPage,
          ...this.unassignedCrudConfig.query,
          ...this.unassignedCrudConfig.search,
          ...this.unassignedCrudConfig.sort,
        })
      }
    }
  ]

  constructor(
    private tendoo: TendooService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog
  ) { }

  ngOnInit(): void {
    this.setTabActive( this.sections[0] );
  }

  setTabActive( tab ) {
    this.sections.forEach( s => s.active = false );
    tab.active  = true;
    this.loadActiveTabConfiguration();
  }

  loadActiveTabConfiguration() {
    this.active.crud().subscribe( (config: BrookrTableConfig ) => {
      this.config   = config;
    }, ( result: HttpErrorResponse ) => {
      this.config   = undefined;
      this.snackbar.open( result[ 'error' ].message || result.error, 'OK', { duration: 3000 });
    })
  }

  get active() {
    return this.sections.filter( s => s.active )[0];
  }

  handleRefresh() {
    this.setTabActive( this.active );
  }

  handleSort( event ) {
    if ( this.active.namespace === 'assigned.loads' ) {
        this.assignedCrudConfig.sort  = event;
      } else {
        this.unassignedCrudConfig.sort  = event;
      }
      this.loadActiveTabConfiguration();
  }

  handleNavigation( page ) {
    if ( this.active.namespace === 'assigned.loads' ) {
      this.assignedCrudConfig.page  = { page };
    } else {
      this.unassignedCrudConfig.page  = { page };
    }
    this.loadActiveTabConfiguration();
  }

  handleAction( action ) {
    console.log( action );
    if ( action.menu.namespace === 'handle' ) {
      this.tendoo.get( `${this.tendoo.baseUrl}brookr/drivers/is-available` ).subscribe( response => {
        this.dialog.open( DriverLoadStatus, {
          id: 'load-handle',
          data: {
            load: action[ 'row' ]
          },
          width: this.tendoo.responsive.isXL() || this.tendoo.responsive.isLG() || this.tendoo.responsive.isMD() ? '600px' : '80%',
          height: this.tendoo.responsive.isXL() || this.tendoo.responsive.isLG() || this.tendoo.responsive.isMD() ? '400px' : '80%',
        }).afterClosed().subscribe( _ => {
          this.setTabActive( this.active );
        });
      }, ( result: HttpErrorResponse ) => {
        this.snackbar.open( result[ 'error' ].message || result.message, 'OK', { duration: 6000 });
      })
    } else if ( [ 'rate_document_url' ].includes( action.menu.namespace ) ) {
      this.tendoo.get( `${this.tendoo.baseUrl}brookr/loads/${action.row.id}/assets/${action.menu.namespace}` ).subscribe( result => {
        window.open( result[ 'data' ].url );
      }, ( result: HttpErrorResponse ) => {
        this.snackbar.open( result[ 'error' ].message || result.message, 'OK', { duration: 3000 });
      })
    } else if ( action.menu.namespace === 'brookr.start-delivery' ) {
      this.dialog.open( PopupComponent, {
        id: 'start-delivery',
        data: <Popup>{
          title: 'Starting Delivery',
          formNamespace: 'brookr.drivers-delivery-start',
          description: 'Please provide (if possible) the drop and load tailer reference.',
          cancel: () => {
            this.dialog.getDialogById( 'start-delivery' ).close();
          },
          confirm: ( form: Form ) => {
            form.sections.forEach( s => {
              ValidationGenerator.touchAllFields( s.formGroup );
            });

            if ( form.formGroup.invalid ) {
              return this.snackbar.open( 'Unable to proceed the form is not valid.', 'OK', { duration: 3000 });
            }

            this.tendoo.post( `${this.tendoo.baseUrl}brookr/loads/start/${action.row.id}`, form.formGroup.value ).subscribe( result => {
              this.snackbar.open( result[ 'message' ], 'OK', { duration: 3000 });
              this.dialog.getDialogById( 'start-delivery' ).close();
              this.handleRefresh();
            }, ( result: HttpErrorResponse ) => {
              this.snackbar.open( result[ 'error' ].message || result.message, 'OK', { duration: 5000 });
            })
          }
        }
      })
    } else if ( action.menu.namespace === 'brookr.await-load' ) {
      this.dialog.open( DialogComponent, {
        id: 'awaiting-load',
        data: <ConfirmDialogObject>{
          title: 'Awaiting Load',
          message: 'Confirm you\'ve reached the delivery location and you\'re awaiting load ?',
          buttons: [
            {
              namespace: 'yes',
              label: 'Yes',
              onClick: () => {
                this.dialog.getDialogById( 'awaiting-load' ).close();
                this.tendoo.get( `${this.tendoo.baseUrl}brookr/loads/awaiting/{id}`.replace( '{id}', action.row.id) ).subscribe( result => {
                  this.setTabActive( this.active );
                  this.snackbar.open( result[ 'message' ], 'OK', { duration: 3000 });
                })
              }
            }, {
              namespace: 'no',
              label: 'No',
              onClick: () => {
                this.dialog.getDialogById( 'awaiting-load' ).close();
              }
            }
          ]
        }
      })
    } else if ( action.menu.namespace === 'brookr.unassign-load' ) {
      this.dialog.open( DialogComponent, {
        id: 'brookr.unassign-load',
        data: <ConfirmDialogObject>{
          title: 'Unassign Yourself',
          message: 'Would you like to unassign yourself from this delivery ?',
          buttons: [
            {
              namespace: 'yes',
              label: 'Yes',
              onClick: () => {
                this.tendoo.get( `${this.tendoo.baseUrl}brookr/loads/unassign/{id}`.replace( '{id}', action.row.id) ).subscribe( result => {
                  this.setTabActive( this.active );
                  this.snackbar.open( result[ 'message' ], 'OK', { duration: 3000 });
                  this.dialog.getDialogById( 'brookr.unassign-load' ).close();
                })
              }
            }, {
              namespace: 'no',
              label: 'No',
              onClick: () => {
                this.dialog.getDialogById( 'brookr.unassign-load' ).close();
              }
            }
          ]
        }
      })
    } else if ( action.menu.namespace === 'brookr.send-delivery-document' ) {
      this.dialog.open( LoadDeliveryComponent, {
        id: 'brookr.send-delivery-document',
        data: action.row,
        width: [
          this.tendoo.responsive.isLG(),
          this.tendoo.responsive.isMD(),
          this.tendoo.responsive.isXL(),
        ].includes( true ) ? '600px' : '80%',
        height: [
          this.tendoo.responsive.isLG(),
          this.tendoo.responsive.isMD(),
          this.tendoo.responsive.isXL(),
        ].includes( true ) ? '600px' : '80%',
        disableClose: true
      }).afterClosed().subscribe( _ => {
        this.setTabActive( this.active );
      })
    }
  }
}
