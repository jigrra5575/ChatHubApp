import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class Service {
   constructor(
    private http: HttpClient
  ) { }

  generateJwtToken(value: any) {
    return this.http.post('https://localhost:7249/api/Auth/login', value);
  }

  getprotecteddata() {
    return this.http.get('https://localhost:7249/api/Protected/secret', { responseType: 'text' });
  }

}
