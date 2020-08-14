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

  public userID = 'bellsSweetFactory';
  public restaurantName = 'Bells Sweet Factory';
  public description = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse placerat, ligula interdum consequat blandit, nisi arcu mollis leo, sed consequat augue massa vitae dolor. Maecenas efficitur rhoncus dui. Etiam magna felis, faucibus eu iaculis ac, feugiat a quam. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Fusce in tempus enim, nec vulputate purus. Etiam sodales commodo nisl vel porttitor. Morbi laoreet aliquet quam, ac vestibulum ligula pulvinar a.';
  public restaurantLogo = '../assets/bellsLogo.jpg';
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
  }

  getCurrentDate() {
    // Get date info
    let d = new Date;
    let month = d.getMonth() + 1;
    let day = d.getDate();
    let year = d.getFullYear();
    let date = month + '-' + day + '-' + year;

    return date;
  }

  getItems(date) {
    // Pull items from Firebase to be displayed
    this.itemList = this.afd.list(this.userID + '/' + date + '/').valueChanges();
    this.afd.list(this.userID + '/' + date + '/').valueChanges()
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
    this.afd.list(this.userID + '/' + this.getCurrentDate() + '/',
      ref => ref.orderByChild('status').equalTo(status))
      .snapshotChanges().subscribe((res) => {
        let tempArray: any = [];
        res.forEach((e) => {
          tempArray.push(e.payload.val())
        });

        if (status == 'in-progress') {
          this.inProgressTotal = tempArray.length;
        } else if (status == 'complete') {
          this.completedTotal = tempArray.length;
        } else if (status == 'cancelled') {
          this.cancelledTotal = tempArray.length;
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
    this.afd.object(this.userID + '/' + date + '/' + itemKey)
      .update({
        status: 'complete',
        time: {
          completed: time
        }
      });
  }

  markCancelled(e) {
    let itemKey = e.target.id;
    let date = this.getCurrentDate();
    this.afd.object(this.userID + '/' + date + '/' + itemKey)
      .update({
        status: 'cancelled'
      });
  }

  markInProgress(e) {
    let itemKey = e.target.id;
    let date = this.getCurrentDate();
    let time = this.getTime();
    this.afd.object(this.userID + '/' + date + '/' + itemKey)
      .update({
        status: 'in-progress',
        time: {
          inProgress: time
        }
      });
  }

  markWaiting(e) {
    let itemKey = e.target.id;
    let date = this.getCurrentDate();
    this.afd.object(this.userID + '/' + date + '/' + itemKey)
      .update({
        status: 'waiting'
      });
  }

  segmentChanged(e) {
    console.log(e);
  }

}
