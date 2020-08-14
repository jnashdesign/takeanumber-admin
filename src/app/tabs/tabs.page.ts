import { Component } from '@angular/core';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {

  constructor() {
    if (!localStorage.getItem('loggedIn')){
      window.location.replace("https://takeanumber.tech/");    
    }
  }

}
