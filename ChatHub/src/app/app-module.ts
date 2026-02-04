import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Chat } from './chat/chat';
import { Login } from './login/login';
import { HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, withInterceptorsFromDi } from '@angular/common/http';
import {  jwtTokenInterceptor } from './Services/jwt-token-interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Register } from './register/register';
import { CommonModule } from '@angular/common';
import { HighlightTextPipe } from './Services/highlight-text-pipe';

@NgModule({
  declarations: [
    App,
    Chat,
    Login,
    Register,
    HighlightTextPipe
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    ReactiveFormsModule,
    CommonModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(
      withInterceptorsFromDi()
    ),
    {
      provide: HTTP_INTERCEPTORS, useClass: jwtTokenInterceptor, multi: true
    }
  ],
  bootstrap: [App]
})
export class AppModule { }
