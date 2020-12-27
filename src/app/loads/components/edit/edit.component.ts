import { Component, Inject, Input, OnInit } from '@angular/core';
import { MatDialog, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-edit',
  templateUrl: './edit.component.html',
  styleUrls: ['./edit.component.scss']
})
export class EditComponent implements OnInit {
  constructor(
    @Inject(MAT_DIALOG_DATA) public data,
    private dialog: MatDialog
  ) { 
    console.log( this.data );
  }

  ngOnInit(): void {
  }

  closePopup() {
    this.dialog.getDialogById( 'edit-load' ).close();
    console.log( 'should have closed' );
  }

  submitForm() {

  }
}
