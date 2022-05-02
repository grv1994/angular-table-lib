import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { AgTableModule } from 'projects/ag-table/src/public-api';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

@NgModule({
  declarations: [
    AppComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    AgTableModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
