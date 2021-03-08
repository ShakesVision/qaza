import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, IonContent, IonTextarea, Platform } from '@ionic/angular';
import { ToastController } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { AdMobFree, AdMobFreeBannerConfig, AdMobFreeInterstitialConfig, AdMobFreeRewardVideoConfig } from '@ionic-native/admob-free/ngx';

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
    private admobFree: AdMobFree,
    public alertController: AlertController,
    private storage: Storage,
    public toastController: ToastController
  ) { }

  type: string = 'default';
  public items = [];
  imgURL: string;
  title: string;
  message: string;
  bigIcon: string;
  bigPic: string;
  extra: string;
  spin: boolean;
  err: string;
  status: string;
  appId: string;
  authKey: string;
  customSegment: string;
  name_input: string = "";
  code_input: string = "";
  subscription;

  ngOnInit() {
    this.plt.ready().then(() => {
      this.showBanner();
    });
    this.getAll();
    this.storage.get('authKey').then(res => res ? this.authKey = res : console.log('authKey variable not found in DB.'));
    document.addEventListener(this.admobFree.events.REWARD_VIDEO_REWARD, (result) => {
      this.storage.set('authKey', this.authKey)
    });
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
        this.status = `Error: ${error.message} \nFull Error:\n${JSON.stringify(error)}`;
        this.spin = false;
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
  doRefresh(event) {
    setTimeout(() => {
      this.getAll();
      console.log('Refreshed.');
      event.target.complete();
    }, 1000);
  }
  copy(text) {
    let e = document.createElement("textarea");
    e.value = text;
    document.body.appendChild(e);
    e.select();
    document.execCommand("Copy");
    document.body.removeChild(e);
    this.presentToast('Copied!');
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
  showBanner() {
    //ca-app-pub-9293070686220717~7208724260
    //b: ca-app-pub-9293070686220717/8661406735
    //i: ca-app-pub-9293070686220717/3192709203
    //ri: ca-app-pub-9293070686220717/5432442811
    //rv: ca-app-pub-9293070686220717/1451433882    
    const bannerConfig: AdMobFreeBannerConfig = {
      id: "ca-app-pub-9293070686220717/8661406735",
      autoShow: true
    };
    this.admobFree.banner.config(bannerConfig);

    this.admobFree.banner.prepare()
      .then(() => {
        //if autoShow is false, call admobfree.banner.show() here
      })
      .catch(e => console.log(e));
  }
  ionViewDidEnter() {
    this.subscription = this.plt.backButton.subscribe(() => { navigator['app'].exitApp(); });
  }
  ionViewWillLeave() {
    this.showInterstitial();
    this.subscription.unsubscribe();
  }
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      color: 'success',
      duration: 2000,
      keyboardClose: true
    });
    toast.present();
  }
  async deleteConfirm(i, name) {
    const alert = await this.alertController.create({
      header: 'Confirm!',
      message: `Do you really want to delete the entry #${i + 1} i.e. <strong>${name}</strong>?`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel',
          handler: (blah) => {
            console.log('Deletion cancelled');
          }
        }, {
          text: 'Yes, Delete',
          cssClass: 'deleteConfirmBtn',
          handler: () => {
            this.delete(i);
          }
        }
      ]
    });

    await alert.present();
  }
  onAuthFocus(ev) {
    console.log('focused.', ev);
  }
  async showRewardAlert() {
    const alert = await this.alertController.create({
      message: `Watch a reward ad to save this.`,
      buttons: [
        {
          text: 'Cancel',
          role: 'cancel'
        }, {
          text: 'Watch & Save',
          handler: () => {
            this.showReward();
          }
        }
      ]
    });

    await alert.present();
  }
  showReward() {
    let RewardVideoConfig: AdMobFreeRewardVideoConfig = {
      autoShow: true,
      id: "ca-app-pub-9293070686220717/1451433882"
    };
    this.admobFree.rewardVideo.config(RewardVideoConfig);
    this.admobFree.rewardVideo.prepare().then(() => {
    }).catch(e => alert(e));
  }
  showInterstitial() {
    let InterstitialConfig: AdMobFreeInterstitialConfig = {
      autoShow: true,
      id: "ca-app-pub-9293070686220717/3192709203"
    };
    this.admobFree.rewardVideo.config(InterstitialConfig);
    this.admobFree.rewardVideo.prepare().then(() => {
    }).catch(e => alert(e));
  }

}
