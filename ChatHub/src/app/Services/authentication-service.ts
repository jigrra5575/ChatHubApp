import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  private email: string = "";
  private password: string = "";

  constructor(private http: HttpClient) { }

  login(email: string, password: string) {
    this.email = email;
    this.password = password;

    localStorage.setItem('email', email);
    localStorage.setItem('password', password);
    const value = {
      userName: email,
      password: password
    };
    return this.http.post('https://localhost:7249/api/Auth/login', value);
  }

  isAuthenticated(): boolean {
    //* login vakhte check thase true or false entered data
    return localStorage.getItem('logged') === 'true';
  }

  logout() {
    localStorage.removeItem('logged');
    localStorage.removeItem('email');
    localStorage.removeItem('password');
    localStorage.removeItem('img');
    localStorage.removeItem('token');
  }
}
