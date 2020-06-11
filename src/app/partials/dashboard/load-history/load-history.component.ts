import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog } from "@angular/material/dialog";
import { MatSnackBar } from '@angular/material/snack-bar';
import { TendooService } from '@cloud-breeze/services';
import { AppState } from '../../../store/state';
import { Store } from '@ngrx/store';
import { AppActions } from '../../../store/action';

@Component({
  selector: 'app-load-history',
  templateUrl: './load-history.component.html',
  styleUrls: ['./load-history.component.scss']
})
export class LoadHistoryComponent implements OnInit {

  constructor(
    private tendoo: TendooService,
    private store: Store<AppState>,
    private snackbar: MatSnackBar,
    @Inject( MAT_DIALOG_DATA ) public data: any,
    private dialog: MatDialog,
  ) { }

  ngOnInit(): void {
    console.log( this.data );
  }

  closePopup() {
    this.dialog.getDialogById( 'load-history' ).close();
  }

  getActionType( type ) {
    switch( type ) {
      case 'brookr.shipper_arrival_time' : return 'Shipper Arrival'; break;
      case 'brookr.depart_time' : return 'Depart Time'; break;
      case 'brookr.receiver_arrival_time' : return 'Receive Arrival'; break;
      case 'brookr.awaiting-load' : return 'Awaiting Load'; break;
      case 'brookr.start-delivery' : return 'Start Delivery'; break;
    }
  }

  getActionDescription( description, value ) {
    switch( description ) {
      case 'brookr.awaiting-load': return 'This usually implies the drivers has arrived at the delivery location and is awaiting for load'; break;
      case 'brookr.start-delivery': return 'This mark the time the driver has started the load delivery.'; break;
      case 'brookr.receiver_arrival_time': return `This describe the moment the received has arrived at the delivery location. Time indicated : ${value}`; break;
      case 'brookr.depart_time': return `This describe when the driver left the delivery location. Time indicated : ${value}`; break;
      case 'brookr.shipper_arrival_time': return `This is a reference for the moment the Shipper has arrivated the delivery location : ${value}`; break;
    }
  }
}
