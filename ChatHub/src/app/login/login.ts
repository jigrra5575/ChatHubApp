import { Component, ChangeDetectorRef, AfterViewInit, viewChild, ViewChild, ElementRef } from '@angular/core';
import { NavigationCancel, NavigationEnd, NavigationError, NavigationStart, Router } from '@angular/router';
import { Service } from '../Services/service';
import { AuthenticationService } from '../Services/authentication-service';

@Component({
  selector: 'app-login',
  standalone: false,
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements AfterViewInit {

  constructor(
    private service: Service,
    private authentication: AuthenticationService,
    private route: Router,
    private cdr: ChangeDetectorRef
  ) { }

  @ViewChild('groupname') groupname!: ElementRef;

  message = null;
  err: string[] = [];
  groupfildvalue: boolean = false;
  GroupTitle: string = "";

  JoinGroup() {
    this.groupfildvalue = true;
    this.GroupTitle = "Existed Group Name:"
  }
  CreateGroup() {
    this.groupfildvalue = true;
    this.GroupTitle = "New Group :"
  }

  onsubmit(email: any, password: any) {
    localStorage.setItem('password', password);
    localStorage.setItem('groupname', this.groupname.nativeElement.value);
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
              this.err.push('Not Found 404');
              setTimeout(() => {
                this.err = [];
              }, 1000);
              this.cdr.detectChanges();
            }
          });
        } else {
          this.err.push('Unvalid Token');
          setTimeout(() => {
            this.err = [];
          }, 1000);
          this.cdr.detectChanges();
        }
      },
      error: () => {
        this.err.push('Unauthorized access 401');
        setTimeout(() => {
          this.err = [];
        }, 1000);
        this.cdr.detectChanges();
      }
    });
  }

  ngAfterViewInit() {
    this.cdr.detectChanges();
  }

  register() {
    setTimeout(() => {
      this.route.navigate(['/register']);
    }, 1000);
  }
}
