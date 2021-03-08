import { Component, OnInit } from '@angular/core';
import { AlertController, Platform, ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-notepad',
  templateUrl: './notepad.page.html',
  styleUrls: ['./notepad.page.scss'],
})
export class NotepadPage implements OnInit {
  textvalue: string = "";
  timestamp: string;
  constructor(private storage: Storage, public alertController: AlertController, public toastController: ToastController, private platform: Platform) { }

  ngOnInit() {
    this.platform.ready().then(() => {
      this.getAll();
    });
  }

  getAll() {
    this.storage.get('notepad').then((data) => {
      if (data) {
        this.textvalue = data.text;
        this.timestamp = data.time;
      }
    },
      error => console.error(error));
  }

  save() {
    var date = new Date();
    var options = { weekday: 'short', year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit' };
    this.timestamp = date.toLocaleString("en-US", options);
    let val = { time: this.timestamp, text: this.textvalue };
    this.storage.set('notepad', val)
      .then(
        () => console.log('Stored item!'),
        error => console.error('Error storing item', error)
      );
  }

  restore() {
    this.getAll();
    this.presentToast('The last saved text has been restored.');
  }
  async presentConfirm() {
    const alert = this.alertController.create({
      header: 'Confirm',
      message: 'Replace the old text with the new one?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        },
        {
          text: 'Yes, Save',
          handler: () => {
            console.log('Ok clicked');
            this.save();
            this.presentToast('Saved successfully!');
          }
        }
      ]
    });
    (await alert).present();
  }

  async confirmClear() {
    const alert = this.alertController.create({
      header: 'Confirm',
      message: 'Clear all the text?',
      buttons: [
        {
          text: 'No',
          role: 'cancel',
          handler: () => {
          }
        },
        {
          text: 'Yes',
          handler: () => {
            this.textvalue = "";
          }
        }
      ]
    });
    (await alert).present();
  }
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000,
      keyboardClose: true
    });
    toast.present();
  }

}