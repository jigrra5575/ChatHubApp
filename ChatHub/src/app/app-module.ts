import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Chat } from './chat/chat';
import { Login } from './login/login';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtTokenInterceptor } from './Services/jwt-token-interceptor';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Register } from './register/register';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [
    App,
    Chat,
    Login,
    Register
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
    provideHttpClient(withInterceptors([jwtTokenInterceptor]))
  ],
  bootstrap: [App]
})
export class AppModule { }
