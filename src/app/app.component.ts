import { Component } from '@angular/core';

import { AlertController, Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';
import { OneSignal } from '@ionic-native/onesignal/ngx';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss']
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private alertCtrl: AlertController,
    private oneSignal: OneSignal
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleLightContent();
      this.splashScreen.hide();
      if (this.platform.is('cordova')) {
        this.setupPush();
      }
    });
  }
  setupPush() {
    console.log("setting up push notifications...");
    this.oneSignal.startInit('14cf2217-497d-44c3-9c48-6713ceef4976', '335452701117');    

    this.oneSignal.inFocusDisplaying(this.oneSignal.OSInFocusDisplayOption.Notification);

    this.oneSignal.handleNotificationReceived().subscribe((data) => {
      // do something when notification is received      
      this.showAlert("A notification received","Check the notification panel to see it.");
      // let extra = data.payload.additionalData.extra;      
    });

    this.oneSignal.handleNotificationOpened().subscribe((data) => {
      // do something when a notification is opened
      // Just a note that the data is a different place here!
    });
    this.oneSignal.endInit();
  }
  async showAlert(title, msg) {
    const alert = await this.alertCtrl.create({
      header: title,
      subHeader: msg,
      buttons: [
        {
          text: `Ok`,
          handler: () => {
            // Refresh component
          }
        }
      ]
    })
    alert.present();
  }

}
