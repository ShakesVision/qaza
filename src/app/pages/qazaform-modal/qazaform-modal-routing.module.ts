import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { QazaformModalPage } from './qazaform-modal.page';

const routes: Routes = [
  {
    path: '',
    component: QazaformModalPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class QazaformModalPageRoutingModule {}
