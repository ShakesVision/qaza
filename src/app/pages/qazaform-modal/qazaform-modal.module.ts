import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";

import { IonicModule } from "@ionic/angular";

import { QazaformModalPageRoutingModule } from "./qazaform-modal-routing.module";

import { QazaformModalPage } from "./qazaform-modal.page";
import { CounterInputComponent } from "src/app/components/counter-input/counter-input.component";

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    QazaformModalPageRoutingModule,
    ReactiveFormsModule,
  ],
  declarations: [QazaformModalPage, CounterInputComponent],
})
export class QazaformModalPageModule {}
