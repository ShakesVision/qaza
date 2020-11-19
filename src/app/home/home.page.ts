import { Component, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertController, Platform } from '@ionic/angular';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(
    public httpClient: HttpClient,
    public plt: Platform,
    public alertController: AlertController,    
    ) { }

  type: string='default';
  films: Observable<any>;
  timer: string;
  heading: string;
  urSpeaker: string;
  imgURL: string;

  title: string;
  message: string;
  bigIcon: string;
  // = "https://1.bp.blogspot.com/-O70DkJuZd5Y/XwR-u0YQByI/AAAAAAAAElk/XLYBs4hgUJgcAH7KXhHOCVpp21x2fq3_gCK4BGAsYHg/s320/logo.jpg";
  bigPic: string;
  extra: string;

  spin:boolean;
  err:string;
  status:string;

  password:string = 'JifYf58uy07d';

  ngOnInit() {
    /* this.type = 'default';
    this.films = this.httpClient.get('http://apis.baitulmaarif.com/services/timercountdown');
    this.films
      .subscribe(data => {
        console.log('my data: ', data);
        this.timer = data.TimerDate;
        this.heading = data.Heading;
        this.urSpeaker = data.UrMolanaName;
        this.imgURL = data.UrMolanaNameImgUrl;
      }); */
  }

  defaultNotif(seg: string) {
    this.spin = true;
    this.status = "";
	if(seg=='All')
		this.setTimerToZero();
    const post_data = {
      "app_id": "d966d91c-664e-47e8-ba65-314d82fe1196",
      "included_segments": [seg],
      "headings": { "en": "اس وقت بیان براہِ راست نشر ہو رہا ہے۔" },
      "contents": { "en": `واعظ: ترجمانِ حکیم الامت حضرت مفتی محمد ارشد صاحب بجھیڑی دامت برکاتہم` }
    }
    const httpOptions2 = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': 'Basic MzJlYjA0MTItYThlYy00ZjhiLTgyYTQtZDUzYmI2M2NlZjdl'
      })
    };
    this.httpClient.post('https://onesignal.com/api/v1/notifications', post_data, httpOptions2)
      .subscribe((new_data:any) => {
        console.log(new_data);
        this.status = `Sent successfully!\nDelivered to: ${new_data.recipients.toString()}`;
        this.spin = false;
      }, error => {
        console.log(error);
        this.status = "Error: "+error;
      });
  }

  newNotif(seg: string, heading: string, msg: string, bigIcon: string = "", bigPic: string = "", data={}) {
    this.spin = true;
    this.status = "";
    if(data !={})
      data = {
        extra: this.extra
      };
    const post_data = {
      "app_id": "d966d91c-664e-47e8-ba65-314d82fe1196",
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
        'Authorization': 'Basic MzJlYjA0MTItYThlYy00ZjhiLTgyYTQtZDUzYmI2M2NlZjdl'
      })
    };
    this.httpClient.post('https://onesignal.com/api/v1/notifications', post_data, httpOptions2)
      .subscribe((new_data:any) => {
        console.log(new_data);
        this.spin = false;
        this.status = `Sent successfully!\nDelivered to: ${new_data.recipients.toString()}`;
      }, error => {
        console.log(error);
        this.status = "Error: "+error;
      });      
  }

  segmentChanged(ev: any) {
    console.log('Segment changed', ev);
  }

  setTimerToZero() {
    this.spin = true;
    this.status = "";
    const url = `http://apis.baitulmaarif.com/services/autoSetCountdown`;
    const httpOptions1 = {
      headers: new HttpHeaders({		
        'Authorization': 'Basic ' + btoa('BaitulMaarif:' + this.password)
      })};
    this.httpClient.get(url, httpOptions1).subscribe((res:any) => {
      console.log(res);
      this.spin = false;
      this.status = 'Status Code:'+res.Status +'\n'+ res.Message;      
    }, error => {
      console.log(error);
      this.status = "Error: "+JSON.stringify(error);
    });
  }

  async presentAlertConfirm(method) {
    const alert = await this.alertController.create({      
      header: 'Confirm!',
      message: 'Do you really want to send this to <strong>All</strong>?',
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
            if(method=='new')
              this.newNotif('All',this.title,this.message,this.bigIcon,this.bigPic,this.extra)
            else
              this.defaultNotif('All');
          }
        }
      ]
    });

    await alert.present();
  }

  async timerAlertConfirm() {
    const alert = await this.alertController.create({      
      header: 'Confirm!',
      message: 'Set timer to 0 and go LIVE?',
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
            console.log('confirmed to go live.');
            this.setTimerToZero();
          }
        }
      ]
    });

    await alert.present();
  }

}
