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

  ionViewWillEnter(){
    this.getOrderData();
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

  getOrderData() {
    this.afd.list('restaurants/' + localStorage.getItem('firebaseName') + '/' + this.getCurrentDate() + '/').valueChanges()
      .subscribe(res => {
        let tempArray: any = [];
        res.forEach((e) => {
          tempArray.push(e)
        });
        let cancelledList = [];
        let orderTimes = [];
        tempArray.forEach((element) => {
          if (element.status == 'cancelled'){
            cancelledList.push(element);
          }
          if (element.time_completed){
            let timeGotNumber = this.processtime(element.time_gotNumber);
            let timeOrderStarted = this.processtime(element.time_inProgress);
            let timeCompleted = this.processtime(element.time_completed);
            let totalOrderTime = timeCompleted - timeGotNumber;
            let timeWaiting = timeOrderStarted - timeGotNumber;
            orderTimes.push({
              id: element.id,
              timeOrderStarted: element.time_gotNumber,
              timeOrderInProgress: element.time_inProgress,
              timeOrderCompleted: element.time_completed,
              timeWaiting: timeWaiting,
              totalOrderTime: totalOrderTime
            });
          }
        });
        console.log(orderTimes);
        console.log(cancelledList);
      });
  }

  processtime(time){
    time = time.split(' ');
    let timeFormatted = time[0].split(':');
    let hourInMinutes = timeFormatted[0];
    hourInMinutes = parseInt(hourInMinutes) * 60;
    if (time[1] == 'PM'){
      hourInMinutes = parseInt(hourInMinutes) + 12;
    }else{
      // do nothing
    }
    let minutes = parseInt(timeFormatted[1]);
    let totalMinutes = hourInMinutes + minutes
    return totalMinutes;
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
}
