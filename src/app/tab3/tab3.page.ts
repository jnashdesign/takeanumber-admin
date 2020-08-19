import { Component } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AlertController } from '@ionic/angular';

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})


export class Tab3Page {
  public restuarantName;
  public restaurantLogo;
  public restaurantType;
  public planType;
  public phone;
  public email;
  public userID;

  constructor(
    public storage: Storage,
    public afd: AngularFireDatabase,
    public alrtCtrl: AlertController,
    public afAuth: AngularFireAuth) {
      if (localStorage.getItem('restaurantLogo')){
        this.restaurantLogo = localStorage.getItem('restaurantLogo').replace(/['"]+/g, '');
        this.restuarantName = localStorage.getItem('restaurantName').replace(/['"]+/g, '');
        this.restaurantType = localStorage.getItem('restaurantType').replace(/['"]+/g, '');
        this.planType = localStorage.getItem('planType').replace(/['"]+/g, '');
        this.phone = localStorage.getItem('phone').replace(/['"]+/g, '');
        this.email = localStorage.getItem('email').replace(/['"]+/g, '');  
      }
  }

  async logout() {
    const alert = await this.alrtCtrl.create({
      header: 'Logging Out',
      message: 'Are you sure you want to log out?',
      buttons: [ {
        text: 'Cancel',
        role: 'cancel',
      },
        {
          text: 'Yes',
          handler: () => {
            localStorage.clear();
            localStorage.setItem('loggedIn', 'false');
            this.afAuth.auth.signOut();
            window.location.replace('https://takeanumber.tech/');
          }
        }
      ]        
    });

    await alert.present();
  }

  dismiss(){

  }

}
