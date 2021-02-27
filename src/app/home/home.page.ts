import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, IonContent, Platform } from '@ionic/angular';
import { Observable } from 'rxjs';
import { Storage } from '@ionic/storage';


@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  @ViewChild(IonContent, { static: false }) content: IonContent;
  constructor(
    public httpClient: HttpClient,
    public plt: Platform,
    public alertController: AlertController,
    private storage: Storage
  ) { }

  type: string = 'default';
  public items = [];

  imgURL: string;

  title: string;
  message: string;
  bigIcon: string;
  // = "https://1.bp.blogspot.com/-O70DkJuZd5Y/XwR-u0YQByI/AAAAAAAAElk/XLYBs4hgUJgcAH7KXhHOCVpp21x2fq3_gCK4BGAsYHg/s320/logo.jpg";
  bigPic: string;
  extra: string;

  spin: boolean;
  err: string;
  status: string;

  appId: string;
  authKey: string;
  customSegment: string;

  name_input: string;
  code_input: string;

  ngOnInit() {
    this.getAll();
  }

  newNotif(seg: string, heading: string, msg: string, bigIcon: string = "", bigPic: string = "", data = {}) {
    this.spin = true;
    this.status = "";
    if (data != {})
      data = {
        extra: this.extra
      };
    const post_data = {
      "app_id": this.appId.trim(),
      "included_segments": [seg],
      "headings": { "en": heading },
      "contents": { "en": msg },
      "large_icon": bigIcon,
      "big_picture": bigPic,
      "data": data
    }
    const httpOptions2 = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic ' + this.authKey
      })
    };
    this.httpClient.post('https://onesignal.com/api/v1/notifications', post_data, httpOptions2)
      .subscribe((new_data: any) => {
        console.log(new_data);
        this.spin = false;
        this.status = `Sent successfully!\nDelivered to: ${new_data.recipients.toString()}`;
      }, error => {
        console.log(error);
        this.status = "Error: " + error;
      });
  }

  segmentChanged(ev: any) {
    console.log('Segment changed');
  }

  async presentAlertConfirm(seg) {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: `Do you really want to send this to <strong>${seg}</strong>?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: (blah) => {
            console.log('Cancelled');
          }
        }, {
          text: 'Yes, Confirm',
          handler: () => {
            this.newNotif(seg, this.title, this.message, this.bigIcon, this.bigPic, this.extra)
          }
        }
      ]
    });

    await alert.present();
  }

  setAll(val) {
    return this.storage.set('entries', val);
  }
  getAll() {
    this.storage.get('entries').then((entries) => {
      if (entries) {
        this.items = entries;
      }
    });
  }
  saveItem(index?) {
    console.log(index + "<= index value in save Fn")
    let item = {
      name: this.name_input,
      code: this.code_input
    };
    if (index != undefined) {
      this.items[index] = item;
      console.log("Updated.")
    }
    else this.items.push(item);
    this.setAll(this.items).then(_ => this.getAll());
  }
  //Delete and update
  update(name, code) {
    this.name_input = name;
    this.code_input = code;
    this.ScrollToTop();
  }
  delete(index: number) {
    this.items.splice(index, 1);
    this.setAll(this.items).then(_ => this.getAll());
  }
  ScrollToTop() {
    this.content.scrollToTop(1000);
  }
  filterList(evt) {
    let temp = this.items;
    const searchTerm = evt.srcElement.value;
    this.items = this.items.filter(val => {
      if (val.name && searchTerm) {
        if (val.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1) {
          return true;
        }
      }
    });
  }

}
