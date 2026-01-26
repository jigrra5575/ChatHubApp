import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import * as signalR from '@microsoft/signalr';
@Injectable({
  providedIn: 'root',
})
export class SignalR {
  private hub!: signalR.HubConnection;

  readmsg = new BehaviorSubject<string>('');
  readmsg$ = this.readmsg.asObservable();

  async startConnection() {
    if (this.hub) return;

    this.hub = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7249/chathub'
        , {
          accessTokenFactory: () => {
            return localStorage.getItem('token') || '';
          }
        }
      ).withAutomaticReconnect().build();
    console.log('SignalR Connected -jigar');

    await this.hub.start().catch(err => console.error(err));;
  }

  joinGroup(group: string, user: any) {
    this.hub.invoke('JoinGroup', group, user);
  }

  leaveGroup(group: string, user: any) {
    this.hub.invoke('LeaveGroup', group, user);
  }


  sendGroupMessage(group: string, user: any, message: string) {
    this.hub.invoke('SendGroupMessage', group, user, message);
  }

  onGroupMessage(callback: (user: string, msg: string) => void) {
    this.hub.on('ReceiveGroupMessage', callback);
  }

  onUserJoined(callback: (user: string, group: string) => void) {
    this.hub.on('UserJoined', callback);
  }

  onUserLeft(callback: (user: string, group: string) => void) {
    this.hub.on('UserLeft', callback);
  }

  onGroupMembers(callback: (members: string[]) => void) {
    this.hub.on('GroupMembers', callback);
  }

  sendTyping(group: string, user: any) {
    this.hub.invoke('Typing', group, user);
  }

  onUserTyping(callback: (user: string) => void) {
    this.hub.on('UserTyping', (user) => {
      callback(user);
    });
  }

  sendFileMessage(group: string, user: string, fileName: string, fileUrl: any, filesize: string) {
    this.hub.invoke('SendFileMessage', group, user, fileName, fileUrl, filesize);
  }

  onFileReceived(cb: (user: string, fileName: string, fileUrl: string, filesize: string) => void) {
    this.hub.on('ReceiveFile', cb);
  }

  sendPDFfile(group: string, user: string, fileName: string, fileUrl: any, filesize: string) {
    this.hub.invoke('SendPDFFile', group, user, fileName, fileUrl, filesize);
  }

  onPDFRecieve(callback: (group: string, user: string, fileName: string, fileUrl: string, filesize: string) => void) {
    this.hub.on('ReceivePDF', callback);
  }

  sendAudioFIle(group: string, user: string, fileName: string, fileUrl: string, filesize: string) {
    this.hub.invoke('SendAudioFile', group, user, fileName, fileUrl, filesize);
  }

  onRecieveAudio(callback: (user: string, filename: string, fileurl: string, filesize: string) => void) {
    this.hub.on('RecieveAudio', callback);
  }

  sendAudioMessage(group: string, user: string, fileName: string, RecordingUrl: string, filesize: string, duration: number) {
    this.hub.invoke('SendRecordingMessage', group, user, fileName, RecordingUrl, filesize, duration)
  }

  onRecieveRecording(callback: (user: string, fileName: string, RecordingUrl: string, filesize: string, duration: number) => void) {
    this.hub.on('RecieveRecording', callback);
  }
}
