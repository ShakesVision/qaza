import { AfterViewInit, Component, OnInit, ViewChild } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import {
  AlertController,
  IonContent,
  IonTextarea,
  ModalController,
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
import {
  DatabasesEnum,
  Master,
  MasterCompletedModel,
  QazaItemModel,
} from "../models/db-model";
import { FormControl, FormGroup } from "@angular/forms";
import { GoogleChartInterface, GoogleChartType } from "ng2-google-charts";
import { CounterInputComponent } from "../components/counter-input/counter-input.component";
import { QazaformModalPage } from "../pages/qazaform-modal/qazaform-modal.page";

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
    public toastController: ToastController,
    private modalController: ModalController
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
  datesArray: Date[] = [];
  goBackNum: number = 10;
  logKeysArray: string[];
  isMasterEditable: boolean = false;
  qazaForm = new FormGroup({
    date: new FormControl(""),
    fajr: new FormControl(0),
    zuhr: new FormControl(0),
    asr: new FormControl(0),
    maghrib: new FormControl(0),
    isha: new FormControl(0),
    witr: new FormControl(0),
    fast: new FormControl(0),
    timestamp: new FormControl(new Date()),
  });
  masterForm = new FormGroup({
    fajrTotal: new FormControl(0),
    fajrCompleted: new FormControl(0),
    zuhrTotal: new FormControl(0),
    zuhrCompleted: new FormControl(0),
    asrTotal: new FormControl(0),
    asrCompleted: new FormControl(0),
    maghribTotal: new FormControl(0),
    maghribCompleted: new FormControl(0),
    ishaTotal: new FormControl(0),
    ishaCompleted: new FormControl(0),
    witrTotal: new FormControl(0),
    witrCompleted: new FormControl(0),
    fastTotal: new FormControl(0),
    fastCompleted: new FormControl(0),
  });
  public barChart: GoogleChartInterface;
  public fastChart: GoogleChartInterface;

  ngOnInit() {
    this.plt.ready().then(() => {
      this.showBanner();
    });
    this.loadLogKeysArray();
    this.getAll();
    this.getlastXlogs();
    document.addEventListener(
      this.admobFree.events.REWARD_VIDEO_REWARD,
      (result) => {
        this.storage.set("authKey", this.authKey);
      }
    );
    if (!this.isMasterEditable) this.masterForm.disable();
  }
  refresh() {
    this.loadLogKeysArray();
    this.getlastXlogs();
    this.getAll();
  }

  populateMasterForm() {
    console.log("Populating master form");
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
    this.masterForm.controls.witrTotal.setValue(this.masterData.witr.total);
    this.masterForm.controls.witrCompleted.setValue(
      this.masterData.witr.completed
    );
    this.masterForm.controls.fastTotal.setValue(this.masterData.fast.total);
    this.masterForm.controls.fastCompleted.setValue(
      this.masterData.fast.completed
    );
  }

  updateMaster(): Promise<any> {
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
      witr: {
        total: this.masterForm.controls.witrTotal.value,
        completed: this.masterForm.controls.witrCompleted.value,
      },
      fast: {
        total: this.masterForm.controls.fastTotal.value,
        completed: this.masterForm.controls.fastCompleted.value,
      },
    };
    return this.storage.set(DatabasesEnum.Master, this.masterData).then((_) => {
      console.log("master set successfully", _);
      this.presentToast("Master updated successfully.");
      this.getAll();
    });
  }
  appendInMasterData(data?: QazaItemModel, operator: string = "+") {
    let operators = {
      "+": (a, b) => a + b,
      "-": (a, b) => a - b,
    };
    let values: MasterCompletedModel;
    if (data)
      values = {
        fajrComplete: data.fajr,
        zuhrComplete: data.zuhr,
        asrComplete: data.asr,
        maghribComplete: data.maghrib,
        ishaComplete: data.isha,
        witrComplete: data.witr,
        fastComplete: data.fast,
      };
    else
      values = {
        fajrComplete: this.qazaForm.controls.fajr.value,
        zuhrComplete: this.qazaForm.controls.zuhr.value,
        asrComplete: this.qazaForm.controls.asr.value,
        maghribComplete: this.qazaForm.controls.maghrib.value,
        ishaComplete: this.qazaForm.controls.isha.value,
        witrComplete: this.qazaForm.controls.witr.value,
        fastComplete: this.qazaForm.controls.fast.value,
      };
    this.masterForm.controls.fajrCompleted.setValue(
      operators[operator](
        this.masterForm.controls.fajrCompleted.value,
        values.fajrComplete
      )
    );
    this.masterForm.controls.zuhrCompleted.setValue(
      operators[operator](
        this.masterForm.controls.zuhrCompleted.value,
        values.zuhrComplete
      )
    );
    this.masterForm.controls.asrCompleted.setValue(
      operators[operator](
        this.masterForm.controls.asrCompleted.value,
        values.asrComplete
      )
    );
    this.masterForm.controls.maghribCompleted.setValue(
      operators[operator](
        this.masterForm.controls.maghribCompleted.value,
        values.maghribComplete
      )
    );
    this.masterForm.controls.ishaCompleted.setValue(
      operators[operator](
        this.masterForm.controls.ishaCompleted.value,
        values.ishaComplete
      )
    );
    this.masterForm.controls.witrCompleted.setValue(
      operators[operator](
        this.masterForm.controls.witrCompleted.value,
        values.witrComplete
      )
    );
    this.masterForm.controls.fastCompleted.setValue(
      operators[operator](
        this.masterForm.controls.fastCompleted.value,
        values.fastComplete
      )
    );
    this.masterData = this.masterForm.getRawValue();
    return this.updateMaster();
  }
  collectMaster(data: QazaItemModel[]) {
    let val: QazaItemModel = {
      fajr: 0,
      zuhr: 0,
      asr: 0,
      maghrib: 0,
      isha: 0,
      witr: 0,
      fast: 0,
      // fajrComplete: this.masterForm.controls.fajrComplete.value,
      // zuhrComplete: this.masterForm.controls.zuhrComplete.value,
      // asrComplete: this.masterForm.controls.asrComplete.value,
      // maghribComplete: this.masterForm.controls.maghribComplete.value,
      // ishaComplete: this.masterForm.controls.ishaComplete.value,
      // witrComplete: this.masterForm.controls.witrComplete.value,
      // fastComplete: this.masterForm.controls.fastComplete.value,
    };
    data.forEach((v) => {
      val.fajr += v.fajr;
      val.zuhr += v.zuhr;
      val.asr += v.asr;
      val.maghrib += v.maghrib;
      val.isha += v.isha;
      val.witr += v.witr;
      val.fast += v.fast;
    });
    this.masterForm.controls.fajrCompleted.setValue(val.fajr);
    this.masterForm.controls.zuhrCompleted.setValue(val.zuhr);
    this.masterForm.controls.asrCompleted.setValue(val.asr);
    this.masterForm.controls.maghribCompleted.setValue(val.maghrib);
    this.masterForm.controls.ishaCompleted.setValue(val.isha);
    this.masterForm.controls.witrCompleted.setValue(val.witr);
    this.masterForm.controls.fastCompleted.setValue(val.fast);
    this.updateMaster();
  }
  getLogId = (id) => "log" + id;
  updateMultipleLogs(data: QazaItemModel[]) {
    console.log(data);
    const id = this.getLogId(this.getUniqueId(data[0].date));
    this.storage.get(id).then((old: any) => {
      console.log(old);
      if (old) {
        console.log("runnnnn", id);
        old.push(data);
        this.storage.set(id, old).then((_) => {
          console.log("log updated successfully", _);
          // this.appendInMasterData(data);
          this.getlastXlogs(this.goBackNum);
        });
      } else {
        console.log("newwww", id);
        if (!(data instanceof Array)) {
          data = [data];
        }
        this.storage.set(id, data).then((d) => {
          console.log("log set successfully", d);
          d.forEach(async (r) => await this.appendInMasterData(r));
          this.refresh();
          this.setLogKeysArray(id);
        });
      }
    });
  }
  updateLog(
    data: QazaItemModel,
    toUpdate: boolean = false,
    index?: number
  ): Promise<any> {
    console.log(data, index);
    const id = this.getLogId(this.getUniqueId(data.date));
    return this.storage.get(id).then((old: any) => {
      console.log(old);
      if (old) {
        if (toUpdate) {
          old[index] = data;
          this.storage.set(id, old).then(async (_) => {
            // old.forEach(async (r) => await this.appendInMasterData(r));
            await this.collectMaster(old);
            this.refresh();
          });
        } else {
          old.push(data);
          this.storage.set(id, old).then(async (_) => {
            console.log("log updated successfully", _);
            await this.appendInMasterData(data);
            this.getlastXlogs(this.goBackNum);
          });
        }
      } else {
        this.storage.set(id, [data]).then(async (_) => {
          console.log("log set successfully", _);
          await this.appendInMasterData(data);
          this.getlastXlogs(this.goBackNum, new Date(), true);
          this.setLogKeysArray(id);
        });
      }
    });
  }
  loadLogKeysArray() {
    this.storage.get(DatabasesEnum.LogKeys).then((logKeysArr: string[]) => {
      this.logKeysArray = logKeysArr;
      console.log("found " + this.logKeysArray.length + " logs");
    });
  }
  setLogKeysArray(id: string) {
    this.storage.get(DatabasesEnum.LogKeys).then((logKeysArr: string[]) => {
      console.log("adding logkeys. before: ", logKeysArr);
      if (!logKeysArr) this.logKeysArray = [];
      this.logKeysArray = logKeysArr;
      this.logKeysArray.push(id);
      this.logKeysArray = Array.from(new Set(this.logKeysArray));
      this.storage.set(DatabasesEnum.LogKeys, this.logKeysArray).then((_) => {
        console.log(_);
      });
    });
  }
  async importPrompt() {
    const alert = await this.alertController.create({
      cssClass: "en",
      header: "Import!",
      subHeader: "Paste the json data to import.", //Should be a list of lists (list of Logs containing list of Entries.)
      inputs: [
        {
          name: "data",
          id: "data",
          type: "textarea",
          placeholder: "Text to import...متن برائے درامد",
          cssClass: "importTextArea",
        },
      ],
      buttons: [
        {
          text: "Cancel",
          role: "cancel",
          cssClass: "secondary",
          handler: () => {
            console.log("Confirm Cancel");
          },
        },
        {
          text: "Import",
          handler: (d) => {
            this.importLogs(JSON.parse(d.data));
          },
        },
      ],
    });

    await alert.present();
  }
  async importLogs(data: QazaItemModel[][]) {
    console.log(data);
    if (Array.isArray(data)) {
      if (!Array.isArray(data[0])) data = <any>[data];
    }
    for (let i = 0; i < data.length; i++) {
      await this.updateMultipleLogs(data[i]);
      // for (let j = 0; j < data[i].length; j++) {
      //   console.log(data[i][j]);
      //   await this.updateLog(data[i][j]);
      // }
    }
  }
  exportAllLogs() {
    let arrayToExport: QazaItemModel[] = [];
    for (let i = 0; i < this.logKeysArray.length; i++) {
      console.log("Exporting " + this.logKeysArray.length + " logs...");
      this.storage.get(this.logKeysArray[i]).then((data) => {
        arrayToExport.push(data);
        if (i == this.logKeysArray.length - 1) {
          this.exportToJson(arrayToExport);
        }
      });
    }
  }
  deleteAllLogs() {
    for (let i = 0; i < this.logKeysArray.length; i++) {
      console.log("Deleting " + this.logKeysArray.length + " logs...");
      this.storage.get(this.logKeysArray[i]).then((data) => {
        this.deleteLog(this.logKeysArray[i], data);
        if (i == this.logKeysArray.length - 1) {
          console.log("last log");
          this.logKeysArray = [];
          this.storage
            .set(DatabasesEnum.LogKeys, this.logKeysArray)
            .then((_) => {
              console.log(_);
            });
        }
      });
    }
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
    this.storage.get(DatabasesEnum.Master).then((entries) => {
      console.log(entries);
      if (entries) {
        this.masterDataPresent = true;
        // this.items = entries;
        this.masterData = entries;
        this.populateMasterForm();
        this.loadCharts();
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
    this.scrollToTop();
  }
  delete(index: number) {
    this.items.splice(index, 1);
    this.setAll(this.items).then((_) => this.getAll());
  }
  scrollToTop() {
    this.content.scrollToTop(1000);
  }
  doRefresh(event) {
    setTimeout(() => {
      this.refresh();
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
    this.loadCharts();

    this.subscription = this.plt.backButton.subscribe(() => {
      navigator["app"].exitApp();
    });
  }
  ionViewWillLeave() {
    // this.showInterstitial();
    this.subscription.unsubscribe();
  }
  async presentToast(msg, clr = "success") {
    const toast = await this.toastController.create({
      message: msg,
      color: clr,
      duration: 2000,
      keyboardClose: true,
      position: "middle",
    });
    toast.present();
  }
  async deleteConfirm(id?, data?, msg?) {
    if (!msg)
      msg = `Do you really want to delete the entry for <strong><em>${id}</em></strong> completely?`;
    const alert = await this.alertController.create({
      header: "Confirm!",
      message: msg,
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
            if (id) this.deleteLog(id, data);
            else this.deleteAllLogs();
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
  loadCharts() {
    this.barChart = {
      chartType: GoogleChartType.ColumnChart,
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
        ["Witr", this.masterData.witr.completed, this.masterData.witr.total],
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
    this.fastChart = {
      chartType: GoogleChartType.PieChart,
      dataTable: [
        ["Completed", this.masterData.fast.completed],
        [
          "Remaining",
          this.masterData.fast.total - this.masterData.fast.completed,
        ],
      ],
      firstRowIsData: true,
      options: { title: "Fast" },
    };
  }
  exportToJson(data) {
    navigator.clipboard.writeText(JSON.stringify(data));
    this.presentToast("Copied");
  }
  getUniqueId(date?): string {
    // console.log(date);
    date = date ? new Date(date) : new Date();
    let components = [
      date?.getDate(),
      date?.getMonth() + 1,
      date?.getFullYear().toString().substring(2),
      // date.getHours(),
      // date.getMinutes(),
      // date.getSeconds(),
      // date.getMilliseconds(),
    ];
    return components.join("-");
  }
  lastXdatesFrom = (x, dt?) =>
    [...Array(x)].map((_, i) => {
      const d = new Date(dt);
      d.setDate(d.getDate() - i);
      this.datesArray.push(d);
      return this.getUniqueId(d);
    });
  // lastXdatesFrom(x: number, d: Date): string[] {
  //   let dateArr: string[] = [];
  //   dateArr = [...Array(x)].map((_, i) => {
  //     d.setDate(d.getDate() - i);
  //     console.log(d);
  //     this.datesArray.push(d);
  //     return this.getUniqueId(d);
  //   });
  //   console.log(dateArr);
  //   // return (dateArr = this.last10dates(x, d));
  //   return dateArr;
  // }
  getlastXlogs(x: number = 10, d: Date = new Date(), reset: boolean = true) {
    // x:number=10
    if (reset === true) {
      console.log("in reset");
      this.items = [];
      this.datesArray = [];
    }
    if (this.datesArray.length > 0) d.setDate(d.getDate() - 1);
    console.log(x, d);
    this.lastXdatesFrom(x, d).forEach((d) => {
      this.storage.get(this.getLogId(d)).then((r) => {
        console.log(r, this.getLogId(d));
        this.items.push(r?.filter(Boolean));
      });
    });
  }
  deleteOneRecord(id, value, index) {
    console.log("deleting " + id, value);
    const toBeDeleted = value[index];
    if (value.length === 1)
      this.storage.remove(id).then((r) => {
        console.log(toBeDeleted, "-");
        this.appendInMasterData(toBeDeleted, "-");
        this.getlastXlogs(this.goBackNum);
      });
    else {
      console.log(value.length, " value.length is !=1");
      value.splice(index, 1);
      this.storage.set(id, value).then((r) => {
        console.log(toBeDeleted, "-");
        this.appendInMasterData(toBeDeleted, "-");
        this.getlastXlogs(this.goBackNum);
      });
    }
  }
  deleteLog(id, data: QazaItemModel[]) {
    this.storage.remove(id).then((r) => {
      this.logKeysArray = this.logKeysArray.filter((a) => a !== id);
      console.log(data);
      let final: QazaItemModel = {
        fajr: 0,
        zuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
        witr: 0,
        fast: 0,
      };
      data?.forEach((item) => {
        final.fajr += item.fajr;
        final.zuhr += item.zuhr;
        final.asr += item.asr;
        final.maghrib += item.maghrib;
        final.isha += item.isha;
        final.witr += item.witr;
        final.fast += item.fast;
      });
      console.log(final);
      this.appendInMasterData(final, "-");
      this.getlastXlogs(this.goBackNum);
    });
  }
  ngAfterViewInit() {
    this.qazaForm.controls.date.setValue(new Date().toISOString());
  }

  async openQazaModal(formValue?, index?) {
    // const formValue = this.qazaForm.getRawValue();
    const m = await this.modalController.create({
      component: QazaformModalPage,
      componentProps: { formValue },
      swipeToClose: true,
      cssClass: "qaza-modal",
    });
    await m.present();
    const { data } = await m.onDidDismiss();
    if (data) {
      console.log(index, data.toUpdate);
      if (data.toUpdate) {
        this.updateLog(data.item, data.toUpdate, index);
      } else this.updateLog(data.item);
    }
  }
  changeMasterEditableToggle(ev) {
    this.isMasterEditable = !this.isMasterEditable;
    if (!this.isMasterEditable) this.masterForm.disable();
    else this.masterForm.enable();
  }
  warnIfNotEditable() {
    if (!this.isMasterEditable)
      this.presentToast(
        "Turn the 'Editable' toggle ON before editing.",
        "warning"
      );
  }
}
