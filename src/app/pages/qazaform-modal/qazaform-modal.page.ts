import { Component, Input, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { ModalController } from "@ionic/angular";

@Component({
  selector: "app-qazaform-modal",
  templateUrl: "./qazaform-modal.page.html",
  styleUrls: ["./qazaform-modal.page.scss"],
})
export class QazaformModalPage implements OnInit {
  @Input() formValue;
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
  constructor(private modalController: ModalController) {}

  ngOnInit() {}
  updateCountInFormontrol(v: number, formControlName: string) {
    console.log("count=> " + v);
    this.qazaForm.controls[formControlName].setValue(v);
  }
  populateInputFieldsForUpdate(r) {
    console.log(r);
    //not working, probably because timestamp formcontrol is not prresent in the ui.
    //also maybe because formControl isn't really targetted from home, but from counter-input
    this.qazaForm.patchValue(r);
  }
  passData() {
    this.modalController.dismiss(this.qazaForm.getRawValue());
  }
  dismiss() {
    this.modalController.dismiss();
  }
}
