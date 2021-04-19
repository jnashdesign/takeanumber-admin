import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { TextCustomerPage } from './text-customer.page';

const routes: Routes = [
  {
    path: '',
    component: TextCustomerPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class TextCustomerPageRoutingModule {}
