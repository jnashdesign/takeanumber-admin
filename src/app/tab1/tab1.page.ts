import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { ModalController, ToastController } from '@ionic/angular';
import { SharedService } from '../shared.service';
declare var $: any;

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss']
})
export class Tab1Page {

  public firebaseUID;
  public restaurantLogo;
  public itemList: any;
  public numItems: any;
  public tab;

  public readyToOrderTotal: Number;
  public waitingCustomersTotal: Number;
  public onHoldTotal: Number;
  public erroredOrders = [];

  constructor(
    public afd: AngularFireDatabase,
    public modalController: ModalController,
    public toastCtrl: ToastController,
    public sharedService: SharedService) {
    this.tab = 'waiting';

    if (localStorage.getItem('restaurantLogo')){
      this.restaurantLogo = localStorage.getItem('restaurantLogo').replace(/['"]+/g, '');
    }

    this.getItems(this.sharedService.getCurrentDate());
    if (localStorage.getItem('firebaseUID')){
      this.firebaseUID = localStorage.getItem('firebaseUID').replace(/['"]+/g, '');
      this.sharedService.setData(this.firebaseUID);
    }

    $(document).keydown(function(e) {
      if(e.altKey && e.keyCode == 88){
        if (localStorage.getItem('debug') !== 'true'){
          localStorage.setItem('debug','true');
          localStorage.setItem('loggedIn','true');
          localStorage.setItem('firebaseName','popupDFW');
          localStorage.setItem('firebaseUID','nyOszrxRuNbMynNBZGu5PubBEhc2');
          alert('Logged in as popupDFW');
        } else {
          $('.debugBtn').text('Clear')
          localStorage.clear();
          alert('Logged out');
        }      } 
    });
  }

  ionViewWillEnter(){
    this.sharedService.setData(this.firebaseUID);
    this.sharedService.getTabTotals();
  }

  changeStatus(e, status){
    this.sharedService.statusUpdate(e, status);
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
    this.afd.list('restaurants/' + localStorage.getItem('firebaseName') + '/' + this.sharedService.getCurrentDate() + '/',
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
        } else if (status == 'on-hold') {
          this.onHoldTotal = tempArray.length;
        } else {
          this.erroredOrders = tempArray;
        }
      });
  }

  async addCustomerModal() {
    this.sharedService.addCustomerModal()
  }

  async textCustomerModal(e) {
    this.sharedService.textCustomerModal(e);
  }

  segmentChanged(e) {
    console.log(e);
  }

}