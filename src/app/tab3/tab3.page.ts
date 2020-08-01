import { Component } from '@angular/core';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})


export class Tab3Page {
  public restuarantName = 'Bells Sweet Factory';
  public restaurantLogo = '../assets/bellsLogo.jpg';
  public restaurantType = 'truck';
  public planType = 'free'
  public restuarantPhone = '(601) 691-4701';
  public restuarantEmail = 'info@thebellssweetfactory.com';

  constructor() {}

}
