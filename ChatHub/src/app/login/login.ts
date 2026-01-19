import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Service } from '../Services/service';
import { AuthenticationService } from '../Services/authentication-service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login {

  constructor(
    private service: Service,
    private authentication: AuthenticationService,
    private route: Router
  ) { }

  message = null;
  err: any;

  onsubmit(email: any, password: any) {

    localStorage.setItem('password', password);

    this.authentication.login(email, password).subscribe({
      next: (res: any) => {
        if (res) {
          localStorage.setItem('logged', 'true');
          localStorage.setItem('token', res.token);
          localStorage.setItem('nick', res.username);
          localStorage.setItem('img', res.img);

          //* protected data get
          this.service.getprotecteddata().subscribe((res: any) => {
            this.message = res;
            if (this.message != null) {
              this.route.navigate(['/chat']);
              setTimeout(() => {
                this.message = null;
              }, 3000);
            } else {
              console.log('Unauthorized access');
            }
          });
        } else {
          this.err.push('Unauthorized access');
        }
      },
      error: () => {
        this.err.push('Unauthorized access');
      }
    });
  }
}
