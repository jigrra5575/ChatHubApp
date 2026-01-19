import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { Login } from './login/login';
import { Chat } from './chat/chat';
import { LoginAuthentication } from './Services/login-authentication';

const routes: Routes = [
  
  { path: '', redirectTo: 'login', pathMatch: "full" },
  { 
    path: 'login',
    component: Login
  },
  {
    path: 'chat', 
    component: Chat,
    canActivate: [LoginAuthentication]
  },

  { path: '**', redirectTo: 'login'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
