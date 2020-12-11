import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from '@ionic/storage';
import { TabsPage } from '../tabs/tabs.page';
declare var $: any;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  public userID;
  public firebaseUID;
  public firebaseName;
  public restaurantLogo;
  public itemList: any;
  public itemListReverse: any;
  public numItems: any;
  public items = [];
  public tab;

  public readyToOrderTotal: Number;
  public waitingCustomersTotal: Number;
  public onHoldTotal: Number;
  public erroredOrders = [];

  constructor(
    public afd: AngularFireDatabase,
    public tabsPage: TabsPage,
    public storage: Storage) {
    this.tab = 'waiting';
    this.getItems(this.getCurrentDate());
    if (localStorage.getItem('firebaseUID')){
      this.firebaseUID = localStorage.getItem('firebaseUID').replace(/['"]+/g, '');
      this.setData(this.firebaseUID);
    }
  }

  ionViewWillEnter(){
    this.tabsPage.getTabTotals();
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
    });
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

  getItems(date) {
    // Pull items from Firebase to be displayed
    this.itemList = this.afd.list('restaurants/' + localStorage.getItem('firebaseName') + '/' + date + '/').valueChanges();
    this.afd.list('restaurants/' + localStorage.getItem('firebaseName') + '/' + date + '/').valueChanges()
      .subscribe(data => {
        this.numItems = data.length;
        return data;
      });

    this.getOrderData('waiting');
    this.getOrderData('ready');
    this.getOrderData('on-hold');
  }

  getOrderData(status) {
    // Get completed orders
    this.afd.list('restaurants/' + localStorage.getItem('firebaseName') + '/' + this.getCurrentDate() + '/',
      ref => ref.orderByChild('status').equalTo(status))
      .snapshotChanges().subscribe((res) => {
        let tempArray: any = [];
        res.forEach((e) => {
          tempArray.push(e.payload.val())
        });

        if (status == 'waiting') {
          this.waitingCustomersTotal = tempArray.length;
        } else if (status == 'ready') {
          this.readyToOrderTotal = tempArray.length;
        } else if (status == 'waiting') {
            this.waitingCustomersTotal = tempArray.length;
        } else if (status == 'on-hold') {
          this.onHoldTotal = tempArray.length;
        } else {
          this.erroredOrders = tempArray;
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

  markWaiting(e) {
    let itemKey = e.target.id;
    let date = this.getCurrentDate();
    this.afd.object('restaurants/' + localStorage.getItem('firebaseName') + '/' + date + '/' + itemKey)
      .update({
        status: 'waiting'
      });
      this.tabsPage.getTabTotals();
  }

  markReady(e) {
    this.sendMessage(e, 'ready');
  }
  
  markOnHold(e) {
    this.sendMessage(e, 'on-hold');
  }

  sendMessage(e, status){
    let itemInfo = e.target.id.split('|');
    let itemKey = itemInfo[0];
    let textOptIn = itemInfo[1];
    let phone = itemInfo[2];
    let date = this.getCurrentDate();
    let time = this.getTime();
    let payload;

    console.log(itemInfo);

    if (textOptIn == 'false'){
      phone = undefined;
    }

    if (phone !== undefined){
       payload = {
        text: status+'|'+phone,
        status: status,
        time_completed: time
      }
    }else{
      payload = {
        status: status,
        time_completed: time
      }
    }
    this.afd.object('restaurants/' + localStorage.getItem('firebaseName') + '/' + date + '/' + itemKey)
      .update(payload);
      this.tabsPage.getTabTotals();
  }

  markInProgress(e){
    let itemKey = e.target.id;
    let date = this.getCurrentDate();
    let time = this.getTime();
    this.afd.object('restaurants/' + localStorage.getItem('firebaseName') + '/' + date + '/' + itemKey)
      .update({
        status: 'in-progress',
        time_inProgress: time
      });
      this.tabsPage.getTabTotals();
  }

  segmentChanged(e) {
    console.log(e);
  }

}