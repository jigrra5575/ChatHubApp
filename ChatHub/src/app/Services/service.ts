import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

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

  getAllGroups() {
    return this.http.get('https://localhost:7249/api/Chat/GetAllGroup');
  }

  registeruser(data: FormData) {
    return this.http.post('https://localhost:7249/api/Chat/ChatCreateUser', data);
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
    return this.http.post('https://localhost:7249/UploadRecordingFile', data);
  }

  DeleteMessageDBMS(id: number) {
    return this.http.delete(`https://localhost:7249/api/Chat/MessageDelete/id=${id}`);
  }

//!=========================  LOADING SCreeen  ================================

  public isLoading = new BehaviorSubject<boolean>(false);

  show() { this.isLoading.next(true); }
  hide() { this.isLoading.next(false); }
}
