import { NgModule, provideBrowserGlobalErrorListeners } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing-module';
import { App } from './app';
import { Chat } from './chat/chat';
import { Login } from './login/login';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { jwtTokenInterceptor } from './Services/jwt-token-interceptor';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    App,
    Chat,
    Login
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    FormsModule
  ],
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideHttpClient(withInterceptors([jwtTokenInterceptor]))
  ],
  bootstrap: [App]
})
export class AppModule { }
