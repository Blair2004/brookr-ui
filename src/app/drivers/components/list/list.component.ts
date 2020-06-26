import { Component, OnInit } from '@angular/core';
import { TableConfig } from '@cloud-breeze/core';
import { HttpErrorResponse } from "@angular/common/http";
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { TendooService } from '@cloud-breeze/services';
import { DriversPaymentComponent } from '../../../partials/dashboard/popups/drivers-payment/drivers-payment.component';

@Component({
  selector: 'app-list',
  templateUrl: './list.component.html',
  styleUrls: ['./list.component.scss']
})
export class ListComponent implements OnInit {
  config: TableConfig;
  isLoading   = false;
  sort        = {
    direction: 'desc',
    active: 'created_at'
  };
  search = {};
  page = {};
  perPage = {
    per_page : 20
  }

  constructor(
    private tendoo: TendooService,
    private snackbar: MatSnackBar,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.tendoo.crud.getConfig( 'brookr.drivers', { ...this.page, ...this.search, ...this.sort, ...this.perPage }).subscribe( ( result: TableConfig ) => {
      this.config   = result;
    })
  }

  handleAction( event ) {
    if ( event.menu.type === 'DELETE' ) {
      this.tendoo.crud.delete( event.menu.url.replace( '{id}', event.row.id ) ).subscribe( result => {
        this.snackbar.open( result[ 'message' ], 'OK', { duration: 3000 });
        this.ngOnInit();
        this.dialog.getDialogById( event.menu.namespace ).close();
      }, ( result ) => {
        this.snackbar.open( result[ 'error' ].message || 'An unexpected error occured', 'OK', { duration: 5000 });
        this.dialog.getDialogById( event.menu.namespace ).close();
      });
    } else if ( event.menu.type === 'GOTO' ) {
      this.router.navigateByUrl( event.menu.url.replace( '{id}', event.row.id ) );
    } else if ( event.menu.namespace === 'open.payment' ) {
      this.dialog.open( DriversPaymentComponent, {
        id: 'driver-payment-popup',
        data: {
          resource: event.row,
          formNamespace: 'brookr.advance-payment.drivers',
          postNamespace: 'brookr/drivers/payments/'
        },
        width: [
          this.tendoo.responsive.isLG(),
          this.tendoo.responsive.isXL(),
        ].includes( true ) ? '600px' : '80%',
        height: [
          this.tendoo.responsive.isLG(),
          this.tendoo.responsive.isXL(),
        ].includes( true ) ? '600px' : '80%',
      })
    } else if ( [ 'personal_card_url', 'medical_card_url' ].includes( event.menu.namespace ) ) {
      this.tendoo.get( `${this.tendoo.baseUrl}brookr/drivers/${event.row.id}/assets/${event.menu.namespace}` ).subscribe( result => {
        window.open( result[ 'data' ].url );
      }, ( result: HttpErrorResponse ) => {
        this.snackbar.open( result[ 'error' ].message || result.message, 'OK', { duration: 3000 });
      })
    }
  }

  handleSort( event ) {
    this.sort   = event;
    this.ngOnInit();
  }

  handleSearch( event ) {
    this.search   = {
      search : event
    }
    this.ngOnInit();
  }

  handleRefresh( event ) {
    this.ngOnInit();
  }

  handlePagineNavigation( event ) {
    this.perPage  = { per_page : event.pageSize };
    this.page     = { page : event.pageIndex + 1};
    this.ngOnInit();
  }
}
