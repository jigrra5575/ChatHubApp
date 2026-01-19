import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from './authentication-service';

@Injectable({
  providedIn: 'root',
})
export class LoginAuthentication {
  
  constructor(
    private authentication: AuthenticationService,
    private route: Router
  ) { }
 
  canActivate(): boolean {
    // if (!this.authentication.isAuthenticated()) {
    //   return true;
    // } else {
    //   this.route.navigate(['/chat']);
    //   return false;
    // }
    if (this.authentication.isAuthenticated()) {
      return true;
    }
    this.route.navigate(['/login']);
    return false;
  }
}
