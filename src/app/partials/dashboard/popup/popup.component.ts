import { Component, OnInit, Inject } from '@angular/core';
import { FormGroup } from "@angular/forms";
import { MAT_DIALOG_DATA, MatDialogRef } from "@angular/material/dialog";
import { Popup } from "./../../../interfaces/Popup";
import { TendooService } from '@cloud-breeze/services';
import { Form } from '@cloud-breeze/core';
import { ValidationGenerator } from '@cloud-breeze/utilities';

@Component({
  selector: 'app-popup',
  templateUrl: './popup.component.html',
  styleUrls: ['./popup.component.scss']
})
export class PopupComponent implements OnInit {
  form: Form;
  constructor(
    @Inject(MAT_DIALOG_DATA) public popup: Popup,
    public dialogRef: MatDialogRef<PopupComponent>,
    public tendoo: TendooService
  ) { }

  ngOnInit(): void {
    this.tendoo.forms.getPublicForm( this.popup.formNamespace ).subscribe( ( form: Form ) => {
      this.form   = ValidationGenerator.buildForm( form );
    })
  }
}
