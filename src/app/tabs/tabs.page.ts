import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AlertController } from '@ionic/angular';
import { AngularFireAuth } from 'angularfire2/auth';
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
    public alrtCtrl: AlertController) {
      // localStorage.setItem('loggedIn','true');
      // localStorage.setItem('firebaseUID','nwO2FR0TeHVxXX60sEadtmAeVLA3');

      if (localStorage.getItem('loggedIn') !== 'true'){
        this.loggedOutAlert();
      }else if (!localStorage.getItem('firebaseUID')){
        this.loggedOutAlert();
      }
    }

    getCurrentDate() {
      // Get date info
      let d = new Date;
      let month = d.getMonth() + 1;
      let day = d.getDate();
      let year = d.getFullYear();
      let date = month + '-' + day + '-' + year;
      // let date = '8-14-2020';
  
      return date;
    }
  
    getTabTotals() {
      let date = this.getCurrentDate();
      // Pull items from Firebase to be displayed
      this.afd.list('restaurants/' + localStorage.getItem('firebaseName') + '/' + date + '/').valueChanges()
        .subscribe(data => {
          this.numItems = data.length;
          return data;
        });
      this.getOrderData('in-progress');
      this.getOrderData('waiting');
      this.getOrderData('cancelled');
    }
  
    getOrderData(status) {
      // Get completed orders
      this.afd.list('restaurants/' + localStorage.getItem('firebaseName') + '/' + this.getCurrentDate() + '/',
        ref => ref.orderByChild('status').equalTo(status))
        .snapshotChanges().subscribe((res) => {
          console.log(res);
          let tempArray: any = [];
          res.forEach((e) => {
            tempArray.push(e.payload.val())
          });
  
          if (status == 'in-progress') {
            this.inProgressTotal = tempArray.length;
            console.log(this.inProgressTotal);
            if (this.inProgressTotal > 0){
              $('#tab-button-tab2').append('<style>#tab-button-tab2:before{content:"' + this.inProgressTotal + '"}</style>');
            }else{
              $('#tab-button-tab2').append('<style>#tab-button-tab2:before{content:inherit}</style>');
            }
          } else if (status == 'waiting') {
            this.waitingTotal = tempArray.length;
            console.log(this.waitingTotal);
            if (this.waitingTotal > 0){
            $('#tab-button-tab1').append('<style>#tab-button-tab1:before{content:"' + this.waitingTotal + '"}</style>');
            }else{
              $('#tab-button-tab1').append('<style>#tab-button-tab1:before{content:inherit}</style>');
            }
          } else {
            this.erroredOrders = tempArray;
            console.log(this.erroredOrders);
          }
        });
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