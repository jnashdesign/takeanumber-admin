import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  public userID;
  public firebaseUID;
  public restaurantName;

  constructor(
    public afd: AngularFireDatabase) {
      // if (localStorage.getItem('loggedIn') !== 'true'){
      //   window.location.replace('https://takeanumber.tech/');
      // }
    }

  }