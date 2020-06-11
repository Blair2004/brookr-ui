import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule, Inject } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DeclarationsModule } from './declarations/declarations.module';
import { StoreModule } from '@ngrx/store';
import { AppReducer } from './store/state';
import { CommonModule } from '@angular/common';
import { CoreModule } from '@cloud-breeze/core';
import { ServicesModule } from '@cloud-breeze/services';
import { HTTP_INTERCEPTORS } from '@angular/common/http';
import { Interceptor } from './classes/interceptor.class';
import { LoadAssignationComponent } from './partials/dashboard/load-assignation/load-assignation.component';
import { LoadStatusComponent } from './partials/dashboard/load-status/load-status.component';
import { DevComponent } from './dev/components/dev/dev.component';
import { DriverLoadStatus } from './partials/dashboard/driver-load-status/driver-load-status.component';
import { PopupComponent } from './partials/dashboard/popup/popup.component';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { LoadDeliveryComponent } from './partials/dashboard/popups/load-delivery/load-delivery.component';
import { DriversPaymentComponent } from './partials/dashboard/popups/drivers-payment/drivers-payment.component';
import { environment } from '../environments/environment';
import { LoadHistoryComponent } from './partials/dashboard/load-history/load-history.component';

export const serviceCalled   = ServicesModule;

@NgModule({
  declarations: [
    AppComponent,
    LoadAssignationComponent,
    LoadStatusComponent,
    DriverLoadStatus,
    PopupComponent,
    LoadDeliveryComponent,
    DriversPaymentComponent,
    LoadHistoryComponent
  ],
  providers: [
    {
			provide: HTTP_INTERCEPTORS,
			useClass: Interceptor,
			multi: true
		}, 
  ],
  imports: [
    CommonModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    DeclarationsModule,
    CoreModule,
    StoreModule.forRoot({ 
      state : AppReducer
    }, {
      runtimeChecks: {
        strictActionImmutability: false,
        strictStateImmutability: false
      }
    }),
    ServicesModule.forRoot({
      angular: '',
      base: environment.baseUrl
    })
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
