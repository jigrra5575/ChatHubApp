import { ChangeDetectorRef, Component, ElementRef, HostListener, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SignalR } from '../Services/signal-r';
import { HttpClient} from '@angular/common/http';
import { Service } from '../Services/service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { HighlightTextPipe } from '../Services/highlight-text-pipe';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.html',
  styleUrl: './chat.css'
})
export class Chat {

  constructor(private signalr: SignalR,
    private cdr: ChangeDetectorRef,
    private route: Router,
    private http: HttpClient,
    private service: Service,
  ) { }

  //~===========================  LOCAL VARIABLE  ================================

  messages: {
    user: string | null;
    filename: string | null;
    time: string;
    text?: string;
    imageUrl?: string;
    PdfUrl?: SafeResourceUrl | null;
    AudioUrl?: string;
    RecordUrl?: string | null;
    fileName?: string;
    isPdf?: boolean;
    isAudio?: boolean;
    isRecord?: boolean;
    size?: string;
    duration?: number;
    TimeStamp?: any;
    messageid?: any;
    reaction?: any;
    reactby?: any;
  }[] = [];

  oldmessages: {
    reactby?: any;
    user: any;
    text: any;
    image?: any;
    pdf?: any;
    audio?: any;
    time: any;
    isOld: boolean;
    messageid: any;
    reaction?: any;
    filesize?: any;
  }[] = [];

  reactions = [
    { icon: '❤️' },
    { icon: '😂' },
    { icon: '😮' },
    { icon: '🔐' },
    { icon: '🛡️' },
    { icon: '🔥' },
  ];

  isPasswordVisible = false;
  uploadProgress = 0;
  PopUpValue = false;
  nick: any = null;
  user: any = localStorage.getItem('email');
  message: string = "";
  notification: string[] = [];
  img: any = null;
  defaultimg = "data:image/png;base64,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"
  pwd: any = null;
  notificationvalue = false;
  membercount: string[] = [];
  ShowOptionvalue: boolean = false;
  userid: any = null;
  groupid: any = null;
  group: any = localStorage.getItem('groupname');

  @ViewChild('chatBox') chatBox!: ElementRef;
  @ViewChild('msgbox') msgBox!: ElementRef;

  //?===========================  ngOnInit  =====================================================

  async ngOnInit() {
    // this.PopUpValue = true;

    if (localStorage.getItem('groupname') == null || undefined) {
      this.group = localStorage.getItem('newgroupname');
    }

    this.nick = localStorage.getItem('nick');
    this.img = localStorage.getItem("img");
    this.pwd = localStorage.getItem("password");
    this.userid = localStorage.getItem("userid");
    this.groupid = localStorage.getItem("groupid");

    //~============== FIRST NEED THIS FOR ALL signal-r and invoke JoinGroup [ON INIT] ============

    await this.signalr.startConnection().then(() => {
      //* on join user sending data to signal-r and invoke JoinGroup function
      if (this.groupid != null) {
        this.signalr.joinGroup(this.group, this.nick, this.groupid);
      } else {
        this.signalr.joinGroup(this.group, this.nick, "0");
      }
    });

    //~=============================== join  =====================================================

    this.signalr.onUserJoined((user, group) => {
      this.notification.push(`${user} Is Joined ${group} Group.`);

      this.cdr.detectChanges();
      setTimeout(() => {
        this.notification.pop();
      }, 5000);

      if (this.notification != null) {
        this.notificationvalue = true;
        setTimeout(() => {
          this.notificationvalue = false;
          this.cdr.detectChanges();
        }, 3500);
      }
      this.cdr.detectChanges();
    });

    this.signalr.onChatHistory((history) => {

      this.oldmessages = history.map(h => ({
        user: h.user,
        text: h.message,
        image: h.image,
        pdf: h.pdf,
        audio: h.audio,
        time: h.timestamp,
        isOld: h.isOld, // આનાથી તમે જૂના મેસેજને અલગ સ્ટાઇલ આપી શકો
        messageid: h.messageid,
        reaction: h.reaction,
        filesize: h.FileSize
      }));
      this.scrollToBottom();
      this.cdr.detectChanges();
    });

    //~=================================   IMAGE recieve  ========================================

    this.signalr.onFileReceived((user, fileName, fileUrl, filesize) => {
      const isImage = /\.(png|jpg|jpeg|gif|webp|jfif)$/i.test(fileName);
      if (isImage) {
        this.messages.push({
          user: user,
          text: '',
          filename: fileName,
          imageUrl: fileUrl,
          size: filesize,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          TimeStamp: new Date()
        });
      }
      this.cdr.detectChanges();
    });

    //~===============================    PDF RECIEVE   ===========================================

    this.signalr.onPDFRecieve((user, fileName, fileUrl, filesize) => {
      const isPDF = /\.(pdf)$/i.test(fileName);
      this.messages.push({
        user: user,
        filename: fileName,
        PdfUrl: fileUrl,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isPdf: isPDF,
        size: filesize,
        TimeStamp: new Date()
      });
      this.cdr.detectChanges();
    });

    //~=================================  AUDIO RECEIVE  ==========================================

    this.signalr.onRecieveAudio((user, fileName, fileUrl, filesize) => {
      const isAUDIO = /\.(mp3|wav|ogg|m4a|mp4|webm)$/i.test(fileName);
      if (isAUDIO) {
        this.messages.push({
          user: user,
          filename: isAUDIO ? fileName : 'its not jpg/jpeg image.',
          AudioUrl: isAUDIO ? fileUrl : undefined,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAudio: isAUDIO,
          size: filesize,
          TimeStamp: new Date()
        });
      } else {
        alert('Unsupportable File...');
      }
      this.cdr.detectChanges();
    });

    //*  Recording File Recieve
    this.signalr.onRecieveRecording((user, fileName, fileUrl, filesize, duration) => {
      const isRecord = /\.(webm)$/i.test(fileName);
      if (isRecord) {
        this.messages.push({
          user: user,
          filename: fileName,
          RecordUrl: fileUrl,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isRecord: isRecord,
          size: filesize,
          duration: duration,
          TimeStamp: new Date()
        });
      } else {
        alert('Unsupportable File...');
      }
      this.cdr.detectChanges();
    });

    //~===============================  left  ======================================================

    this.signalr.onUserLeft((user, group) => {
      this.notification.push(`${user} left ${group}`);
      // this.membercount = this.membercount.filter(item => item !== user);
      this.cdr.detectChanges();
      setTimeout(() => {
        this.notification.pop();
      }, 3000);

      if (this.notification != null) {
        this.notificationvalue = true;
        setTimeout(() => {
          this.notificationvalue = false;
          this.cdr.detectChanges();
        }, 3500);
      }
      this.cdr.detectChanges();


    });

    //~===========================  TYPING LOGIC [ON INIT] =========================================

    this.signalr.onUserTyping((user) => {
      if (user !== this.user) {
        this.typingUser = user;
        this.isTyping = true;
        clearTimeout(this.typingTimeout);

        this.typingTimeout = setTimeout(() => {
          this.isTyping = false;
          this.typingUser = null;
          this.cdr.detectChanges();
        }, 1500);
      }
      this.scrollToBottom();
      this.cdr.detectChanges();
    });

    //~===========================  NORMAL TEXT MESSAGE [ON INIT] ==================================

    this.signalr.onGroupMessage((user, msg, messageid) => {
      this.messages.push({
        user: user,
        text: msg,
        filename: msg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        TimeStamp: new Date(),
        messageid: messageid
      });
      this.scrollToBottom();
      this.cdr.detectChanges();
    });

    //~===========================  GROUP MEMBER UPDATE [ JOIN / LEFT] ==============================

    this.signalr.onGroupMembers((members: string[]) => {
      this.membercount = members;
      this.cdr.detectChanges();
    });

    //~===========================  on reaction recieve callback function  ==========================

    this.signalr.recieveReaction((msgId, emoji, reactuser) => {
      debugger
      const msgIndex = this.oldmessages.findIndex(m => m.messageid === msgId);
      if (msgIndex !== -1) {
        this.oldmessages[msgIndex].reaction = emoji;
        this.oldmessages[msgIndex].reactby = reactuser;
        this.cdr.detectChanges();
      }
      const newMsgIndex = this.messages.findIndex(nm => nm.messageid === msgId);
      if (newMsgIndex !== -1) {
        this.messages[newMsgIndex].reaction = emoji;
        this.messages[newMsgIndex].reactby = reactuser;
        this.cdr.detectChanges();
      }
    });


    //!   ngOnInit katam-----
  }

  //~===========================  Send button  ============================================

  send() {
    this.message = this.message.trim();
    if (this.message != null && this.message !== "") {
      this.signalr.sendGroupMessage(this.group, this.nick, this.message);
      this.cdr.detectChanges();
      this.scrollToBottom();

      // 🔥 textarea reset
      setTimeout(() => {
        const textarea = this.msgBox?.nativeElement;
        if (textarea)
          textarea.style.height = '41px';
        this.message = "";
      });
      this.cdr.detectChanges();
    }
  }

  //~===========================  Leave button  ===========================================

  leave() {
    this.signalr.leaveGroup(this.group, this.nick);
    localStorage.clear();
    this.route.navigate(['/login']);
    this.cdr.detectChanges();
  }

  SignOut() {
    this.signalr.SignOut(this.group, this.nick);
    localStorage.clear();
    this.route.navigate(['/login']);
    this.cdr.detectChanges();
  }

  //~===========================  INBOX AUTO REsIZE  ======================================

  scrollToBottom() {
    setTimeout(() => {
      if (this.chatBox) {
        this.chatBox.nativeElement.scrollTop = this.chatBox.nativeElement.scrollHeight;
      }
    }, 50);
  }

  //~===========================  TYPING LOGIC  ===========================================

  isTyping = false;
  typingUser: string | null = null;
  typingTimeout: any;
  typing() {
    this.signalr.sendTyping(this.group, this.nick);
  }

  //~===========================  TEXT BOX [chat input]  ==================================

  autoGrow(event: any) {
    const textarea = event.target;
    textarea.style.height = 'auto';
    textarea.style.height = textarea.scrollHeight + 'px';
  }

  //~===========================  OPTION BOX  =============================================
  HeaderMenuValue = false;

  @ViewChild('optionBox') optionBox!: ElementRef;
  @ViewChild('ProfileBox') ProfileBox!: ElementRef;

  ShowOptionMenu(event: MouseEvent) {
    event.stopPropagation();
    this.ShowOptionvalue = !this.ShowOptionvalue;
  }

  HeaderMenu() {
    this.HeaderMenuValue = !this.HeaderMenuValue;
    this.isPasswordVisible  =false;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    //~==================================    OPTION MENU-BOX  ===============================
    if (this.ShowOptionvalue && this.optionBox && !this.optionBox.nativeElement.contains(event.target)) {
      this.ShowOptionvalue = false;
    }

    //~==================================    PROFILE MENU-BOX  ===============================
    // if (this.HeaderMenuValue && this.ProfileBox && !this.ProfileBox.nativeElement.contains(event.target)) {
    //   this.HeaderMenuValue = false;
    // }
  }

  //~===========================  IMAGE UPLOAD  ============================================

  @ViewChild('imgfileunput') imgfileunput!: ElementRef;
  openFilePicker() {
    this.imgfileunput.nativeElement.click();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file, file.name);
    data.append('group', this.group);
    data.append('user', this.nick);

    this.service.uploadfile(data).subscribe({
      next: (res: any) => {
        this.signalr.sendFileMessage(this.group, this.nick, res.fileName, res.binaryData, res.filesize);
      },
      error: (err) => {
        console.log('UPLOAD ERROR', err);
      }
    });
    event.target.value = '';
  }

  //~================================================  PDF UPLOAD  =========================
  @ViewChild('pdffileinput') pdf!: ElementRef;

  openPDFPicker() {
    this.pdf.nativeElement.click();
  }

  onPDFSelected(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file, file.name);
    data.append('group', this.group);
    data.append('user', this.nick);

    this.service.uploadPDF(data).subscribe({
      next: (res: any) => {
        this.signalr.sendPDFfile(
          this.group,
          this.nick,
          res.fileName,
          res.fileBytes,
          res.filesize
        );
      },
      error: (err) => {
        console.log('UPLOAD ERROR', err);
      }
    });
    event.target.value = '';
  }

  downloadBinaryPdf(base64String: string, fileName: string) {
    try {
      // ૧. જો સ્ટ્રિંગમાં "data:application/pdf;base64," જેવું હેડર હોય તો તેને કાઢી નાખો
      const pureBase64 = base64String.includes(',')
        ? base64String.split(',')[1]
        : base64String;

      // ૨. Base64 ને ડીકોડ કરો
      const byteCharacters = atob(pureBase64.trim());
      const byteNumbers = new Array(byteCharacters.length);

      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }

      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'application/pdf' });

      // ૩. ડાઉનલોડ પ્રોસેસ
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName || 'document.pdf';
      link.click();

      // ક્લીનઅપ
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Decoding failed:", error);
      alert("ફાઇલ ડીકોડ કરવામાં ભૂલ આવી છે. ડેટા પ્રોપર નથી.");
    }
  }

  openPdf(url: any) {
    window.open(url, '_blank');
  }

  //~================================================  AUDIO UPLOAD  ========================
  @ViewChild('audiofileinput') audiofile!: ElementRef;

  openAudioPicker() {
    this.audiofile.nativeElement.click();
  }

  onAudioSelect(event: any) {
    const file = event.target.files[0];
    if (!file) return;
    const data = new FormData();
    data.append('file', file, file.name);
    data.append('group', this.group);
    data.append('user', this.nick);

    this.service.uploadAudio(data).subscribe({
      next: (res: any) => {
        this.signalr.sendAudioFIle(
          this.group,
          this.nick,
          res.fileName,
          res.audioUrl,
          res.filesize
        );
      },
      error: (err) => {
        console.log('UPLOAD ERROR', err);
      }
    });
    event.target.value = '';
  }

  //~ RECORDING AUDIO MESSAGE     ======================================
  mediaRecorder!: MediaRecorder;
  audioChunks: Blob[] = [];
  recordStartTime!: number;
  recordingvalue = false;

  async startRecording() {
    this.recordingvalue = true;
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioChunks = [];

    this.mediaRecorder = new MediaRecorder(stream);
    this.recordStartTime = Date.now();

    this.mediaRecorder.ondataavailable = e => {
      this.audioChunks.push(e.data);
    };

    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      var duration = Math.round((Date.now() - this.recordStartTime) / 1000);

      const file = new File([audioBlob], `voice_${Date.now()}.webm`);
      this.uploadAudio(file, duration);
    };

    this.mediaRecorder.start();
    this.typing();
  }

  stopRecording() {
    this.recordingvalue = false;
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  uploadAudio(file: File, duration: number) {
    const data = new FormData();
    data.append('file', file, file.name);
    data.append('group', this.group);
    data.append('user', this.nick);
    data.append('duration', duration.toString());

    this.service.uploadRecording(data).subscribe((res: any) => {
      this.signalr.sendAudioMessage(
        this.group,
        this.nick,
        res.fileName,
        res.audioUrl,
        res.fileSize,
        res.duration
      );
    });
  }

  //~==================================  WARNING BOX  ========================

  popup() {
    this.PopUpValue = !this.PopUpValue;
  }

  //~==================================  DATE FUNCTION  [yesterday/Today]   ========================
  formatChatDate(timestamp: any): string {
    if (!timestamp) return '';

    const messageDate = new Date(timestamp);
    const today = new Date();

    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);


    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }


    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }

    const day = messageDate.getDate();
    const month = messageDate.getDate() === 29 && messageDate.getMonth() === 0 ? 1 : messageDate.getMonth() + 1;
    const year = messageDate.getFullYear();

    return `${day}/${month}/${year}`;
  }

  isNewDay(currentMsg: any, previousMsg: any): boolean {
    if (!previousMsg) return true;

    const currentDate = new Date(currentMsg.time).toDateString();
    const previousDate = new Date(previousMsg.time).toDateString();

    return currentDate !== previousDate;
  }

  showScrollDate: boolean = false;
  scrollTimer: any;

  onWindowScroll() {
    this.showScrollDate = true;
    // if (this.scrollTimer) {
    //   clearTimeout(this.scrollTimer);
    // }
    setTimeout(() => {
      this.showScrollDate = false;
      this.cdr.detectChanges();
    }, 5000);
  }
  //~=========================================  REaction   ===================================

  activeMessageId: number | null = null;

  toggleReaction(msgId: number) {
    if (this.activeMessageId === msgId) {
      this.activeMessageId = null;
    } else {
      this.activeMessageId = msgId;
    }
  }

  //~====================================   DELETE MESSAGE  ====================================

  DeleteMessage(msgId: number, index: number, listType: string) {
    debugger
    if (confirm("If You Want To Delete Message For All ?")) {
      this.http.delete(`https://localhost:7249/api/Chat/MessageDelete?id=${msgId}`).subscribe(() => {
        if (listType === 'old') {
          this.oldmessages.splice(index, 1);
        } else {
          this.messages.splice(index, 1);
        }

        alert("Message Deleted...");
        this.activeMessageId = null;
        this.cdr.detectChanges();
      });
    }
  }

  //~====================================   USERNAME SET [ YOU / Another]  ====================================
  username?: string;
  checkusername(displayuser: string) {
    if (displayuser == this.nick) {
      this.username = "You";
    }
    else {
      this.username = displayuser;
    }
    this.cdr.detectChanges();
  }

  //~====================================   SET REACTION ON MEssage  ====================================

  sendReaction(msgId: number, emoji: any, text: any) {
    this.signalr.sendReaction(msgId, emoji, this.group, this.nick);
    this.activeMessageId = null;
    this.notificationvalue = true;
    this.notification.push(`${this.nick} React ${emoji} On '${text}'.`);
    setTimeout(() => {
      this.notification = [];
      this.notificationvalue = false;
    }, 3000);
    this.cdr.detectChanges();
  }

  removeReaction(msgId: number) {
    this.signalr.deleteReaction(msgId, '', this.group, '');
    this.cdr.detectChanges();
  }

  //~====================================   MessageInfo POPUP  ====================================

  chatinfovalue = false;
  messageInfoArray: {
    user: any;
    text?: any;
    image?: any;
    pdf?: any;
    audio?: any;
    time: any;
    messageid: any;
    reaction?: any;
    reactby?: any;
  }[] = [];

  MessageInfo(user: any, text: string, time: string, audio: any, image: any, pdf: any, reaction: any, reactby: string, messageid: string) {
    debugger
    this.messageInfoArray.push({
      user: user,
      text: text,
      time: time,
      audio: audio,
      image: image,
      pdf: pdf,
      messageid: messageid,
      reactby: reactby,
      reaction: reaction
    })
    this.chatinfovalue = !this.chatinfovalue;
  }

  closeMessageInfo() {
    this.chatinfovalue = !this.chatinfovalue;
    this.messageInfoArray = [];
  }



  searchText: string = '';
  isSearchOpen: boolean = false;
  originalOldMessages: any[] = []; // આમાં તમારા બધા જૂના મેસેજ સ્ટોર કરો

  toggleSearch() {
    this.isSearchOpen = !this.isSearchOpen;
    if (!this.isSearchOpen) {
      this.searchText = '';
    }
  }

  temparray = this.oldmessages;;
  searchMessages() {
    debugger
    if (!this.searchText) {
      this.oldmessages = this.temparray;
    } else {
      this.originalOldMessages = this.oldmessages;
      this.oldmessages = this.originalOldMessages.filter(m =>
        m.text?.toLowerCase().includes(this.searchText.toLowerCase())
      );
    }
  }
}