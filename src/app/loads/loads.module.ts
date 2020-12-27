import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { LoadsRoutingModule } from './loads-routing.module';
import { ListComponent } from './components/list/list.component';
import { ManageComponent } from './components/manage/manage.component';
import { DeclarationsModule } from '../declarations/declarations.module';
import { EditComponent } from './components/edit/edit.component';


@NgModule({
  declarations: [ ListComponent, ManageComponent, EditComponent],
  imports: [
    CommonModule,
    LoadsRoutingModule,
    DeclarationsModule
  ]
})
export class LoadsModule { }
