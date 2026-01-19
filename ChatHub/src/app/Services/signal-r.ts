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

    await this.hub.start().catch(err => console.error(err));;
    console.log('SignalR Connected');
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

  onGroupMessage(callback: (user: string, msg: string, img: string) => void) {
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
}
