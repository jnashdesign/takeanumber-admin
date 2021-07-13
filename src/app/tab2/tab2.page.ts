import { Component } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { ModalController, ToastController } from '@ionic/angular';
import { SharedService } from '../shared.service';
declare var $: any;

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss']
})
export class Tab2Page {

  public firebaseUID;
  public firebaseName;
  public restaurantLogo;
  public itemList: any;
  public numItems: any;
  public tab;

  public inProgressTotal: Number;
  public completedTotal: Number;
  public cancelledTotal: Number;
  public erroredOrders = [];

  constructor(
    public afd: AngularFireDatabase,
    public modalController: ModalController,
    public toastCtrl: ToastController,
    public sharedService: SharedService) {
    this.tab = 'open';
    this.getItems(this.sharedService.getCurrentDate());
    if (localStorage.getItem('firebaseUID')){
      this.firebaseUID = localStorage.getItem('firebaseUID').replace(/['"]+/g, '');
      this.sharedService.setData(this.firebaseUID);
    }

    if (localStorage.getItem('restaurantLogo')){
      this.restaurantLogo = localStorage.getItem('restaurantLogo').replace(/['"]+/g, '');
    }
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
    this.getOrderData('in-progress');
    this.getOrderData('complete');
    this.getOrderData('cancelled');
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

        if (status == 'in-progress') {
          this.inProgressTotal = tempArray.length;
        } else if (status == 'complete') {
          this.completedTotal = tempArray.length;
        } else if (status == 'cancelled') {
          this.cancelledTotal = tempArray.length;
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