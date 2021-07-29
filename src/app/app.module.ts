import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {IngameComponent} from './pages/ingame/ingame.component';
import {LoggerModule, NgxLoggerLevel} from "ngx-logger";
import {HttpClientModule} from '@angular/common/http';
import {FontAwesomeModule} from "@fortawesome/angular-fontawesome";
import {CookieModule} from "ngx-cookie";

@NgModule({
  declarations: [
    AppComponent,
    IngameComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LoggerModule.forRoot({serverLoggingUrl: '/api/logs', level: NgxLoggerLevel.DEBUG, serverLogLevel: NgxLoggerLevel.ERROR}),
    HttpClientModule,
    FontAwesomeModule,
    CookieModule.forRoot()
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
