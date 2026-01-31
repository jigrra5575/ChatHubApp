import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Service } from '../Services/service';

@Component({
  selector: 'app-register',
  standalone: false,
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register {
  /**
   *
   */
  constructor(
    private route: Router,
    private service: Service
  ) { }

  signupform = new FormGroup({
    Username: new FormControl(''),
    email: new FormControl(''),
    password: new FormControl(''),
    image: new FormControl(''),
    groupid : new FormControl('')
  });

  get form() {
    return this.signupform.controls;
  }

  selectedFile!: File;

  onFileChange(event: any) {
    this.selectedFile = event.target.files[0];
  }
  register() {
    // var image64 = this.form.image.value;

    const newuser = new FormData();

    newuser.append('UserName', this.form.Username.value!);
    newuser.append('UserEmail', this.form.email.value!);
    newuser.append('UserPassword', this.form.password.value!);
    // newuser.append('GroupId', this.form.groupid.value!);

    if (this.selectedFile) {
      newuser.append('UserImage', this.selectedFile);
    }

    this.service.registeruser(newuser).subscribe({
      next: (res: any) => {
        alert(res.message);
        this.route.navigate(['/login']);
      },
      error: err => {
        if (err.status === 409) {
          alert('User already exists');
        }
      }
    });

  }

}
