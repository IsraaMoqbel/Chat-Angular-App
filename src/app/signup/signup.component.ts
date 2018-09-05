import { Component, OnInit,Input } from '@angular/core';
import { AngularFireAuth } from 'angularfire2/auth';
import { AngularFireDatabase, FirebaseListObservable } from "angularfire2/database-deprecated";
import {AppService} from '../app.service'
import { Router } from '@angular/router';
import { Observable } from 'rxjs/Observable';
import { finalize } from 'rxjs/operators';
import { AngularFireStorage, AngularFireStorageReference, AngularFireUploadTask } from 'angularfire2/storage';
@Component({
  selector: 'app-signup',
  templateUrl: './signup.component.html',
  styleUrls: ['./signup.component.css']
})
export class SignupComponent implements OnInit {
  state: string = '';
  error: any;
  downloadURL: Observable<string>;
  ref: AngularFireStorageReference;
  task: AngularFireUploadTask;
  uploadState: Observable<string>;
  uploadProgress: Observable<number>;
  downloadSrc:string;
  email:string;
  password:string;
  displayName:string;
  constructor(public af: AngularFireAuth, private router: Router,private appService: AppService, private afStorage: AngularFireStorage) {}

  onSubmit(formData) {
    if (formData.valid) {
      console.log(formData.value);
      this.af.auth.createUserWithEmailAndPassword(
        formData.value.email,
        formData.value.password
      )
      .then(
        (success) => {
          console.log('success', success);
          console.log('success', success.user.uid);
            this.appService.addUser({uid:success.user.uid,email:formData.value.email,displayName: formData.value.displayName,username: formData.value.displayName,photoURL: this.downloadSrc || null,date:Date.now()})

          this.router.navigate(['/login'])
        }).catch(
          (err) => {
            console.log(err);
            this.error = err;
          })
    }
    //adding name and photoUrl to firebase
    this.af.auth.onAuthStateChanged(auth => {
      if (auth) {
        auth.updateProfile({
          displayName: formData.value.displayName, // some displayName,
          photoURL: this.downloadSrc// some photo url
        })
      }
    });
  }
  upload(event) {
    const id = Math.random().toString(36).substring(2);
    this.ref = this.afStorage.ref(id);
    this.task = this.ref.put(event.target.files[0]);
    this.uploadProgress = this.task.percentageChanges();

    this.task.snapshotChanges().pipe(
      finalize(() => {
     this.ref.getDownloadURL().subscribe(url => {
       console.log(url); // <-- do what ever you want with the url..
       this.downloadSrc=url;
     });
   })
    )
    .subscribe()
  }


  ngOnInit() {
  }

}
