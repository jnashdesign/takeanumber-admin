import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { TextCustomerPageRoutingModule } from './text-customer-routing.module';

import { TextCustomerPage } from './text-customer.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    TextCustomerPageRoutingModule
  ],
  declarations: [TextCustomerPage]
})
export class TextCustomerPageModule {}
