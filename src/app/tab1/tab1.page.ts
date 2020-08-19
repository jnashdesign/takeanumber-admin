import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { Storage } from '@ionic/storage';
declare var $: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  public userID;
  public firebaseUID;
  public firebaseName;
  public restaurantName;
  public restaurantLogo;
  public itemList: any;
  public itemListReverse: any;
  public numItems: any;
  public items = [];
  public tab;

  public inProgressTotal: Number;
  public completedTotal: Number;
  public cancelledTotal: Number;
  public erroredOrders = [];

  constructor(
    public afd: AngularFireDatabase,
    public storage: Storage) {
    this.tab = 'open';
    this.getItems(this.getCurrentDate());
    if (localStorage.getItem('firebaseUID')){
      this.firebaseUID = localStorage.getItem('firebaseUID').replace(/['"]+/g, '');
      this.setData(this.firebaseUID);
    }
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
    this.getOrderData('in-progress');
    this.getOrderData('complete');
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
          console.log(tempArray)
        } else if (status == 'complete') {
          this.completedTotal = tempArray.length;
          console.log(tempArray)
        } else if (status == 'cancelled') {
          this.cancelledTotal = tempArray.length;
          console.log(tempArray)
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

  markComplete(e) {
    let itemKey = e.target.id;
    let date = this.getCurrentDate();
    let time = this.getTime();
    this.afd.object('restaurants/' + localStorage.getItem('firebaseName') + '/' + date + '/' + itemKey)
      .update({
        status: 'complete',
        time_completed: time
      });
  }

  markCancelled(e) {
    let itemKey = e.target.id;
    let date = this.getCurrentDate();
    this.afd.object('restaurants/' + localStorage.getItem('firebaseName') + '/' + date + '/' + itemKey)
      .update({
        status: 'cancelled'
      });
  }

  markInProgress(e) {
    let itemKey = e.target.id;
    let date = this.getCurrentDate();
    let time = this.getTime();
    this.afd.object('restaurants/' + localStorage.getItem('firebaseName') + '/' + date + '/' + itemKey)
      .update({
        status: 'in-progress',
        time_inProgress: time
      });
  }

  markWaiting(e) {
    let itemKey = e.target.id;
    let date = this.getCurrentDate();
    this.afd.object('restaurants/' + localStorage.getItem('firebaseName') + '/' + date + '/' + itemKey)
      .update({
        status: 'waiting'
      });
  }

  segmentChanged(e) {
    console.log(e);
  }

}
