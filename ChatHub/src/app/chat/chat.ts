import { ChangeDetectorRef, Component, ElementRef, HostListener, Sanitizer, ViewChild } from '@angular/core';
import { Router } from '@angular/router';
import { SignalR } from '../Services/signal-r';
import { HttpClient } from '@angular/common/http';
import { Service } from '../Services/service';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-chat',
  standalone: false,
  templateUrl: './chat.html',
  styleUrl: './chat.css',
})
export class Chat {


  constructor(private signalr: SignalR,
    private cdr: ChangeDetectorRef,
    private route: Router,
    private http: HttpClient,
    private service: Service, private sanitizer: DomSanitizer
  ) { }

  //&===========================  LOCAL VARIABLE  ================================

  // messages: {
  //   user: string | null,
  //   text: string,
  //   time: string,
  //   image: string | null
  // }[] = [];

  messages: {
    user: string | null;
    filename: string | null;
    time: string;
    text?: string;
    imageUrl?: string;
    PdfUrl?: SafeResourceUrl | null;
    AudioUrl?: string;
    fileName?: string;
    isPdf?: boolean;
    isAudio?: boolean;
    size?: string;
    duration?: number;
  }[] = [];

  uploadProgress = 0;
  nick: any = null;
  user: any = localStorage.getItem('email');
  group: any = localStorage.getItem('groupname');
  message: string = "";
  notification: string[] = [];
  img: any = null;
  defaultimg = "data:image/png;base64,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"
  pwd: any = null;
  notificationvalue = false;
  membercount: string[] = [];
  ShowOptionvalue: boolean = false;


  @ViewChild('chatBox') chatBox!: ElementRef;
  @ViewChild('msgbox') msgBox!: ElementRef;


  //?===========================  ngOnInit  =================================

  async ngOnInit() {

    this.nick = localStorage.getItem('nick');
    this.img = localStorage.getItem("img");
    this.pwd = localStorage.getItem("password");

    await this.signalr.startConnection();


    //&=================================   IMAGE recieve  ==============================

    this.signalr.onFileReceived((user, fileName, fileUrl, filesize) => {
      const isImage = /\.(png|jpg|jpeg|gif|webp|jfif)$/i.test(fileName);
      if (isImage) {
        this.messages.push({
          user: user,
          text: '',
          filename: isImage ? fileName : 'its not jpg/jpeg image.',
          imageUrl: isImage ? fileUrl : undefined,
          size: filesize,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });
      }
      this.cdr.detectChanges();
    });

    // ^===============================    PDF RECIEVE   ===============================

    this.signalr.onPDFRecieve((user, fileName, fileUrl, filesize) => {
      const isPDF = /\.(pdf)$/i.test(fileName);
      this.messages.push({
        user: user,
        filename: isPDF ? fileName : 'its not jpg/jpeg image.',
        PdfUrl: isPDF ? this.sanitizer.bypassSecurityTrustResourceUrl(fileUrl) : undefined,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isPdf: isPDF,
        size: filesize
      });
      this.cdr.detectChanges();
    });

    //&=================================  AUDIO RECEIVE  ==================================

    this.signalr.onRecieveAudio((user, fileName, fileUrl, filesize) => {
      const isAUDIO = /\.(mp3|wav|ogg|m4a|mp4|webm)$/i.test(fileName);
      debugger
      if (isAUDIO) {
        this.messages.push({
          user: user,
          filename: isAUDIO ? fileName : 'its not jpg/jpeg image.',
          AudioUrl: isAUDIO ? fileUrl : undefined,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAudio: isAUDIO,
          size: filesize
        });
      } else {
        alert('Unsupportable File...');
      }
      this.cdr.detectChanges();
    });

    //&  Recording File Recieve
    this.signalr.onRecieveRecording((user, fileName, fileUrl, filesize, duration) => {
      const isRecord = /\.(webm)$/i.test(fileName);
      debugger
      if (isRecord) {
        this.messages.push({
          user: user,
          filename: fileName,
          AudioUrl: fileUrl,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          isAudio: isRecord,
          size: filesize,
          duration: duration
        });
      } else {
        alert('Unsupportable File...');
      }
      this.cdr.detectChanges();
    });

    //&=============================== join  =====================================

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

    //&===============================  left  =====================================

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


    //&===========================  TYPING LOGIC [ON INIT] =================================

    this.signalr.onUserTyping((user) => {
      if (user !== this.user) {
        this.typingUser = user;
        this.isTyping = true;

        clearTimeout(this.typingTimeout);

        this.typingTimeout = setTimeout(() => {
          this.isTyping = false;
          this.typingUser = null;
          this.cdr.detectChanges();
        }, 1000);
      }
      this.scrollToBottom();
      this.cdr.detectChanges();
    });

    this.signalr.joinGroup(this.group, this.nick);

    this.signalr.onGroupMessage((user, msg) => {
      this.messages.push({
        user: user,
        text: msg,
        filename: msg,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      });
      this.scrollToBottom();
      this.cdr.detectChanges();
    });

    this.signalr.onGroupMembers((members: string[]) => {
      this.membercount = members;
      this.cdr.detectChanges();
    });

  }

  //&===========================  Send button  =================================

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

  //&===========================  Leave button  =================================

  leave() {
    this.signalr.leaveGroup(this.group, this.nick);
    localStorage.clear();
    this.route.navigate(['/login']);
    this.cdr.detectChanges();

  }

  //&===========================  INBOX AUTO REsIZE  =================================

  scrollToBottom() {
    setTimeout(() => {
      if (this.chatBox) {
        this.chatBox.nativeElement.scrollTop = this.chatBox.nativeElement.scrollHeight;
      }
    }, 50);
  }

  //&===========================  TYPING LOGIC  =================================

  isTyping = false;
  typingUser: string | null = null;
  typingTimeout: any;
  typing() {
    this.signalr.sendTyping(this.group, this.nick);
  }

  //&===========================  TEXT BOX [chat input]  ========================

  autoGrow(event: any) {
    const textarea = event.target;
    textarea.style.height = 'auto';          // reset
    textarea.style.height = textarea.scrollHeight + 'px'; // grow
  }

  //&===========================  OPTION BOX  =================================

  @ViewChild('optionBox') optionBox!: ElementRef;

  ShowOptionMenu(event: MouseEvent) {
    event.stopPropagation();
    this.ShowOptionvalue = !this.ShowOptionvalue;
  }

  @HostListener('document:click', ['$event'])
  clickOutside(event: MouseEvent) {
    if (
      this.ShowOptionvalue &&
      this.optionBox &&
      !this.optionBox.nativeElement.contains(event.target)
    ) {
      this.ShowOptionvalue = false;
    }
  }

  //&===============================================    PROFILE MENU-BOX  ============================================================
  HeaderMenuValue = false;

  @ViewChild('ProfileBox') ProfileBox!: ElementRef;

  HeaderMenu(event2: MouseEvent) {
    event2.stopPropagation();
    this.HeaderMenuValue = !this.HeaderMenuValue;
  }
  // @HostListener('document:click', ['$event'])
  clickOutside1(event: MouseEvent) {
    if (
      this.HeaderMenuValue &&
      this.ProfileBox &&
      !this.ProfileBox.nativeElement.contains(event.target)
    ) {
      this.HeaderMenuValue = false;
    }
  }

  //&===========================  IMAGE UPLOAD  =================================

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
        console.log(res)
        this.signalr.sendFileMessage(
          this.group,
          this.nick,
          res.fileName,
          res.fileUrl,
          res.filesize
        );
      },
      error: (err) => {
        console.log('UPLOAD ERROR', err);
      }
    });
    event.target.value = '';
  }

  //&================================================  PDF UPLOAD  =======================================================
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
          res.fileUrl,
          res.filesize
        );
      },
      error: (err) => {
        console.log('UPLOAD ERROR', err);
      }
    });
    event.target.value = '';
  }

  openPdf(url: any) {
    window.open(url, '_blank');
  }

  //&================================================  AUDIO UPLOAD  =======================================================
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

  //~ RECORDING AUDIO MESSAGE
  mediaRecorder!: MediaRecorder;
  audioChunks: Blob[] = [];
  recordStartTime!: number;

  async startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    this.audioChunks = [];

    this.mediaRecorder = new MediaRecorder(stream);
    this.recordStartTime = Date.now();

    this.mediaRecorder.ondataavailable = e => {
      this.audioChunks.push(e.data);
    };

    this.mediaRecorder.onstop = () => {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/webm' });
      const duration = Math.round((Date.now() - this.recordStartTime) / 1000);

      const file = new File([audioBlob], `voice_${Date.now()}.webm`);
      this.uploadAudio(file, duration);
    };

    this.mediaRecorder.start();
  }

  stopRecording() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
  }

  uploadAudio(file: File, duration: number) {
    const data = new FormData();
    data.append('file', file);
    data.append('group', this.group);
    data.append('user', this.nick);
    data.append('duration', duration.toString());

    this.service.uploadRecording(data).subscribe((res: any) => {
      debugger
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


}