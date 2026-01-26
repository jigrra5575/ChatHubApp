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

  registeruser(data: FormData) {
    return this.http.post('https://localhost:7154/CREATE-USERS', data);
  }

  uploadfile(data: FormData) {
    return this.http.post('https://localhost:7249/uploadfile', data)
  }

  uploadPDF(data: FormData) {
    return this.http.post('https://localhost:7249/UploadPDF', data);
  }

  uploadAudio(data: FormData) {
    return this.http.post('https://localhost:7249/UploadAudio', data);
  }

  uploadRecording(data: FormData) {
    return this.http.post('https://localhost:7249/UploadRcordingFile', data);
  }
}
