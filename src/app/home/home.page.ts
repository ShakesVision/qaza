import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  AlertController,
  IonContent,
  IonTextarea,
  Platform,
} from "@ionic/angular";
import { ToastController } from "@ionic/angular";
import { Storage } from "@ionic/storage";
import {
  AdMobFree,
  AdMobFreeBannerConfig,
  AdMobFreeInterstitialConfig,
  AdMobFreeRewardVideoConfig,
} from "@ionic-native/admob-free/ngx";
import { Master } from "../models/db-model";
import { FormControl, FormGroup } from "@angular/forms";
import { GoogleChartInterface } from "ng2-google-charts";
import { CounterInputComponent } from "../components/counter-input/counter-input.component";

@Component({
  selector: "app-home",
  templateUrl: "home.page.html",
  styleUrls: ["home.page.scss"],
})
export class HomePage implements AfterViewInit {
  @ViewChild(IonContent, { static: false }) content: IonContent;
  @ViewChild("fajr", { static: false }) fajr: CounterInputComponent;
  constructor(
    public httpClient: HttpClient,
    public plt: Platform,
    private admobFree: AdMobFree,
    public alertController: AlertController,
    private storage: Storage,
    public toastController: ToastController
  ) {}

  type: string = "default";
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
  masterData: Master;
  masterDataPresent: boolean;
  qazaForm = new FormGroup({
    date: new FormControl(""),
    salah: new FormControl(""),
    count: new FormControl(""),
  });
  masterForm = new FormGroup({
    fajrTotal: new FormControl(""),
    fajrCompleted: new FormControl(""),
    zuhrTotal: new FormControl(""),
    zuhrCompleted: new FormControl(""),
    asrTotal: new FormControl(""),
    asrCompleted: new FormControl(""),
    maghribTotal: new FormControl(""),
    maghribCompleted: new FormControl(""),
    ishaTotal: new FormControl(""),
    ishaCompleted: new FormControl(""),
  });
  public pieChart: GoogleChartInterface;

  ngOnInit() {
    this.plt.ready().then(() => {
      this.showBanner();
    });
    this.getAll();
    this.getlast10logs();
    document.addEventListener(
      this.admobFree.events.REWARD_VIDEO_REWARD,
      (result) => {
        this.storage.set("authKey", this.authKey);
      }
    );
  }

  populateMasterForm() {
    this.masterForm.controls.fajrTotal.setValue(this.masterData.fajr.total);
    this.masterForm.controls.fajrCompleted.setValue(
      this.masterData.fajr.completed
    );
    this.masterForm.controls.zuhrTotal.setValue(this.masterData.zuhr.total);
    this.masterForm.controls.zuhrCompleted.setValue(
      this.masterData.zuhr.completed
    );
    this.masterForm.controls.asrTotal.setValue(this.masterData.asr.total);
    this.masterForm.controls.asrCompleted.setValue(
      this.masterData.asr.completed
    );
    this.masterForm.controls.maghribTotal.setValue(
      this.masterData.maghrib.total
    );
    this.masterForm.controls.maghribCompleted.setValue(
      this.masterData.maghrib.completed
    );
    this.masterForm.controls.ishaTotal.setValue(this.masterData.isha.total);
    this.masterForm.controls.ishaCompleted.setValue(
      this.masterData.isha.completed
    );
  }

  updateMaster() {
    this.masterData = {
      fajr: {
        total: this.masterForm.controls.fajrTotal.value,
        completed: this.masterForm.controls.fajrCompleted.value,
      },
      zuhr: {
        total: this.masterForm.controls.zuhrTotal.value,
        completed: this.masterForm.controls.zuhrCompleted.value,
      },
      asr: {
        total: this.masterForm.controls.asrTotal.value,
        completed: this.masterForm.controls.asrCompleted.value,
      },
      maghrib: {
        total: this.masterForm.controls.maghribTotal.value,
        completed: this.masterForm.controls.maghribCompleted.value,
      },
      isha: {
        total: this.masterForm.controls.ishaTotal.value,
        completed: this.masterForm.controls.ishaCompleted.value,
      },
    };
    return this.storage.set("master", this.masterData).then((_) => {
      console.log("master set successfully", _);
      alert("Master updated successfully.");
      this.getAll();
    });
  }
  updateLog() {
    const id = "log" + this.getUniqueId(this.qazaForm.controls.date.value);
    let data: any = this.qazaForm.getRawValue();
    data.timestamp = new Date();
    this.storage.get(id).then((old: any) => {
      console.log(old);
      if (old) {
        old.push(data);
        return this.storage.set(id, old).then((_) => {
          console.log("log updated successfully", _);
          this.getlast10logs();
        });
      } else {
        return this.storage.set(id, [data]).then((_) => {
          console.log("log set successfully", _);
          this.getlast10logs();
        });
      }
    });
  }

  newNotif(
    seg: string,
    heading: string,
    msg: string,
    bigIcon: string = "",
    bigPic: string = "",
    data = {}
  ) {
    this.spin = true;
    this.status = "";
    if (data != {})
      data = {
        extra: this.extra,
      };
    const post_data = {
      app_id: this.appId.trim(),
      included_segments: [seg],
      headings: { en: heading },
      contents: { en: msg },
      large_icon: bigIcon,
      big_picture: bigPic,
      data: data,
    };
    const httpOptions2 = {
      headers: new HttpHeaders({
        "Content-Type": "application/json",
        Authorization: "Basic " + this.authKey,
      }),
    };
    this.httpClient
      .post(
        "https://onesignal.com/api/v1/notifications",
        post_data,
        httpOptions2
      )
      .subscribe(
        (new_data: any) => {
          console.log(new_data);
          this.spin = false;
          this.status = `Sent successfully!\nDelivered to: ${new_data.recipients.toString()}`;
        },
        (error) => {
          console.log(error);
          this.status = `Error: ${
            error.message
          } \nFull Error:\n${JSON.stringify(error)}`;
          this.spin = false;
        }
      );
  }

  segmentChanged(ev: any) {
    console.log("Segment changed");
  }

  async presentAlertConfirm(seg) {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: `Do you really want to send this to <strong>${seg}</strong>?`,
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: (blah) => {
            console.log("Cancelled");
          },
        },
        {
          text: "Yes, Confirm",
          handler: () => {
            this.newNotif(
              seg,
              this.title,
              this.message,
              this.bigIcon,
              this.bigPic,
              this.extra
            );
          },
        },
      ],
    });

    await alert.present();
  }

  setAll(val) {
    return this.storage.set("entries", val);
  }
  getAll() {
    this.storage.get("master").then((entries) => {
      console.log(entries);
      if (entries) {
        this.masterDataPresent = true;
        // this.items = entries;
        this.masterData = entries;
        this.populateMasterForm();
        this.loadSimplePieChart();
      } else this.masterDataPresent = false;
    });
  }
  saveItem(index?) {
    console.log(index + "<= index value in save Fn");
    let item = {
      name: this.name_input,
      code: this.code_input,
    };
    if (index != undefined) {
      this.items[index] = item;
      console.log("Updated.");
    } else this.items.push(item);
    this.setAll(this.items).then((_) => this.getAll());
  }
  //Delete and update
  update(name, code) {
    this.name_input = name;
    this.code_input = code;
    this.ScrollToTop();
  }
  delete(index: number) {
    this.items.splice(index, 1);
    this.setAll(this.items).then((_) => this.getAll());
  }
  ScrollToTop() {
    this.content.scrollToTop(1000);
  }
  doRefresh(event) {
    setTimeout(() => {
      this.getAll();
      console.log("Refreshed.");
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
    this.presentToast("Copied!");
  }
  filterList(evt) {
    let temp = this.items;
    const searchTerm = evt.srcElement.value;
    this.items = this.items.filter((val) => {
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
      autoShow: true,
    };
    this.admobFree.banner.config(bannerConfig);

    this.admobFree.banner
      .prepare()
      .then(() => {
        //if autoShow is false, call admobfree.banner.show() here
      })
      .catch((e) => console.log(e));
  }
  ionViewDidEnter() {
    this.loadSimplePieChart();

    this.subscription = this.plt.backButton.subscribe(() => {
      navigator["app"].exitApp();
    });
  }
  ionViewWillLeave() {
    // this.showInterstitial();
    this.subscription.unsubscribe();
  }
  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      color: "success",
      duration: 2000,
      keyboardClose: true,
    });
    toast.present();
  }
  async deleteConfirm(id) {
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: `Do you really want to delete the entry for <strong><em>${id}</em></strong> completely?`,
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          handler: (blah) => {
            console.log("Deletion cancelled");
          },
        },
        {
          text: "Yes, Delete",
          cssClass: "deleteConfirmBtn",
          handler: () => {
            // this.delete(i);
            this.deleteLog(id);
          },
        },
      ],
    });

    await alert.present();
  }
  onAuthFocus(ev) {
    console.log("focused.", ev);
  }
  async showRewardAlert() {
    const alert = await this.alertController.create({
      message: `Watch a reward ad to save this.`,
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
        },
        {
          text: "Watch & Save",
          handler: () => {
            this.showReward();
          },
        },
      ],
    });

    await alert.present();
  }
  showReward() {
    let RewardVideoConfig: AdMobFreeRewardVideoConfig = {
      autoShow: true,
      id: "ca-app-pub-9293070686220717/1451433882",
    };
    this.admobFree.rewardVideo.config(RewardVideoConfig);
    this.admobFree.rewardVideo
      .prepare()
      .then(() => {})
      .catch((e) => alert(e));
  }
  showInterstitial() {
    let InterstitialConfig: AdMobFreeInterstitialConfig = {
      autoShow: true,
      id: "ca-app-pub-9293070686220717/3192709203",
    };
    this.admobFree.rewardVideo.config(InterstitialConfig);
    this.admobFree.rewardVideo
      .prepare()
      .then(() => {})
      .catch((e) => alert(e));
  }
  loadSimplePieChart() {
    this.pieChart = {
      chartType: "ColumnChart",
      dataTable: [
        ["Prayer", "Completed", "Total"],
        ["Fajr", this.masterData.fajr.completed, this.masterData.fajr.total],
        ["Zuhr", this.masterData.zuhr.completed, this.masterData.zuhr.total],
        ["Asr", this.masterData.asr.completed, this.masterData.asr.total],
        [
          "Maghrib",
          this.masterData.maghrib.completed,
          this.masterData.maghrib.total,
        ],
        ["Isha", this.masterData.isha.completed, this.masterData.isha.total],
      ],
      formatters: [
        {
          columns: [1],
          type: "ColorFormat",
          options: { ranges: [{ from: 1, to: 50, bgcolor: "yellow" }] },
        },
      ],
      //opt_firstRowIsData: true,
      options: {
        height: 350,
        width: "100%",
      },
    };
  }
  exportToJson(data) {
    navigator.clipboard.writeText(JSON.stringify(data));
    this.presentToast("Copied");
  }
  getUniqueId(date?) {
    // console.log(date);
    date = date ? new Date(date) : new Date();
    let components = [
      date.getDate(),
      date.getMonth() + 1,
      date.getFullYear().toString().substring(2),
      // date.getHours(),
      // date.getMinutes(),
      // date.getSeconds(),
      // date.getMilliseconds(),
    ];
    return components.join("-");
  }
  last10dates = [...Array(10)].map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - i);
    return this.getUniqueId(d);
  });
  getlast10logs() {
    this.items = [];
    this.last10dates.forEach((d) => {
      this.storage.get("log" + d).then((r) => {
        console.log(r, "log" + d);
        this.items.push(r?.filter(Boolean));
      });
    });
  }
  deleteOneRecord(id, value, index) {
    console.log("deleting " + id, value);
    if (value.length === 1)
      this.storage.remove(id).then((r) => this.getlast10logs());
    else {
      console.log(value.length, " value.length is !=1");
      value.splice(index, 1);
      this.storage.set(id, value).then((r) => {
        this.getlast10logs();
      });
    }
  }
  deleteLog(id) {
    this.storage.remove(id).then((r) => this.getlast10logs());
  }
  ngAfterViewInit() {
    console.log("running aftervewiinit");
    this.fajr.countChange.subscribe((v) => console.log(v));
  }
  updateCountInFormontrol(e) {
    console.log("count=> " + e);
  }
}
