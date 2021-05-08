import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AlertController } from '@ionic/angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { ModalController, ToastController } from '@ionic/angular';
import { TextCustomerPage } from '../text-customer/text-customer.page';
import { AddCustomerPage } from '../add-customer/add-customer.page';
declare var $: any;

@Component({
  selector: 'app-tabs',
  templateUrl: 'tabs.page.html',
  styleUrls: ['tabs.page.scss']
})
export class TabsPage {
  public userID;
  public firebaseUID;
  public restaurantName;
  public inProgressTotal;
  public waitingTotal;
  public numItems;
  public erroredOrders;

  constructor(
    public afd: AngularFireDatabase,
    public afAuth: AngularFireAuth,
    public toastCtrl: ToastController,
    public modalCtrl: ModalController,
    public alrtCtrl: AlertController) {
      // localStorage.setItem('loggedIn','true');
      // localStorage.setItem('firebaseUID','VN1XqtC3M8PqNn3MQP12lX7NYsx2');

      if (localStorage.getItem('loggedIn') !== 'true'){
        this.loggedOutAlert();
      }else if (!localStorage.getItem('firebaseUID')){
        this.loggedOutAlert();
      }
    }

    async loggedOutAlert() {
      const alert = await this.alrtCtrl.create({
        header: 'Logged Out',
        message: 'You are being redirected to the home screen.',
        buttons: [ {
            text: 'Okay',
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

  }