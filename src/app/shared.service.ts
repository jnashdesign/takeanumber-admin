import { Injectable } from '@angular/core';
import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { AlertController } from '@ionic/angular';
import { AngularFireAuth } from 'angularfire2/auth';
import { ModalController, ToastController } from '@ionic/angular';
import { TextCustomerPage } from './text-customer/text-customer.page';
import { AddCustomerPage } from './add-customer/add-customer.page';
declare var $: any;

@Injectable({
  providedIn: 'root'
})
export class SharedService {
  public userID;
  public firebaseUID;
  public restaurantName;
  public inProgressTotal;
  public waitingTotal;
  public numItems;
  public erroredOrders;
  public restaurantLogo;

  constructor(
    public afd: AngularFireDatabase,
    public alertCtrl: AlertController,
    public modalCtrl: ModalController,
    public toastCtrl: ToastController
  ) { }

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
    this.getOrderData('waiting');
    this.getOrderData('in-progress');
    this.getOrderData('waiting');
    this.getOrderData('completed');
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

  getTime(){
    // Get time info.
    let d = new Date;
    let hours = d.getHours();
    let minutes = d.getMinutes();
    let minutesString;
    let time;

    // Check whether AM or PM 
    var newformat = hours >= 12 ? 'PM' : 'AM';

    // Find current hour in AM-PM Format 
    hours = hours % 12;

    // To display "0" as "12" 
    hours = hours ? hours : 12;
    minutesString = minutes < 10 ? '0' + minutes : minutes;

    // Format the date and time
    time = hours + ':' + minutesString + ' ' + newformat;
    
    return time;  
  }

  statusUpdate(e, status) {
    // collect data from event
    let itemInfo = e.target.id.split('|');
    let itemKey = itemInfo[0];
    let phone = itemInfo[1];
    let date = this.getCurrentDate();
    let time = this.getTime();
    let payload;

    // create payload based on status
    if (status == 'cancelled'){
      payload = {
        status: status,
        text: status+'|'+phone,
        time_cancelled: time
      }
     } else if (status == 'complete'){
        payload = {
          status: status,
          text: status+'|'+phone,
          time_complete: time
        }
    } else if (status == 'in-progress'){
      payload = {
        status: status,
        text: status+'|'+phone,
        time_inProgress: time
      }
    } else if (status == 'waiting'){
        payload = {
          status: status,
          text: status+'|'+phone,
          time_gotNumber: time
        }
    } else if (status == 'ready'){
        payload = {
          status: status,
          text: status+'|'+phone,
          time_readyToOrder: time
        } 
    } else {
        payload = {
          status: status,
          text: status+'|'+phone,
        }
    }


    this.afd.object('restaurants/' + localStorage.getItem('firebaseName') + '/' + date + '/' + itemKey)
      .update(payload)
      .catch(function(error) {
        console.error(error);
        this.afd.object('errors/' + localStorage.getItem('firebaseName') + '/' + date + '/' + itemKey)
        .update(error)
      });

      this.presentToast(status);
      this.getTabTotals();
  }

  setData(firebaseUID){
    this.afd.object('users/clients/' + firebaseUID)
    .valueChanges().subscribe((res:any) => {
      localStorage.setItem('restaurantName',res.restaurantName);
      localStorage.setItem('firebaseName', res.firebaseName);
      localStorage.setItem('restaurantLogo',res.restaurantLogo);
      this.restaurantLogo = res.restaurantLogo.replace(/['"]+/g, '');
      localStorage.setItem('restaurantType',res.restaurantType);
      localStorage.setItem('restaurantEmail',res.email);
      localStorage.setItem('planType',res.planType);
      localStorage.setItem('phone',res.phone);
      localStorage.setItem('email',res.email);
      localStorage.setItem('address', res.address);
      localStorage.setItem('hours',res.hours);
      localStorage.setItem('openStatus',res.openStatus);
      if (res.website){
        localStorage.setItem('site',res.site);
      }else{
        localStorage.removeItem('site');
      }
      if (res.facebook){
        localStorage.setItem('facebook',res.facebook);
      }else{
        localStorage.removeItem('facebook');
      }
      if (res.instagram){
        localStorage.setItem('instagram',res.instagram);
      }else{
        localStorage.removeItem('instagram');
      }
      if (res.twitter){
        localStorage.setItem('twitter', res.twitter);
      }else{
        localStorage.removeItem('twitter');
      }
    });
  }

  async presentToast(status) {
    const toast = await this.toastCtrl.create({
      message: 'Order status changed to ' + status + '.',
      duration: 2000
    });
    toast.present();
  }

  async addCustomerModal() {
    const modal = await this.modalCtrl.create({
      component: AddCustomerPage
    });
    return await modal.present();
  }

  async textCustomerModal(e) {
    let itemInfo = e.target.id.split('|');
    let itemKey = itemInfo[0];
    let phone = itemInfo[1];
    let itemKeySplit = itemKey.split('_');
    let name = itemKeySplit[1];

    const modal = await this.modalCtrl.create({
      component: TextCustomerPage,
      componentProps: { 
        phoneNumber: phone,
        itemKey: itemKey,
        name: name
      }
    });
    return await modal.present();
  }
}
