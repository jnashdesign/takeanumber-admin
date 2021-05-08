import { Component, ViewChild } from '@angular/core';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AlertController, ToastController } from '@ionic/angular';
import { SharedService } from '../shared.service';
declare var $: any;

@Component({
  selector: 'app-tab4',
  templateUrl: 'tab4.page.html',
  styleUrls: ['tab4.page.scss']
})


export class Tab4Page {
  @ViewChild('totalTimeChart') totalTimeChart;
  @ViewChild('waitTimeChart') waitTimeChart;
  public bars: any;
  public colorArray: any;
  public restuarantName;
  public restaurantLogo;
  public restaurantType;
  public planType;
  public phone;
  public email;
  public site;
  public facebook;
  public instagram;
  public twitter;
  public userID;
  public avgWaitTime;
  public avgOrderTime;
  public completedOrders;
  public cancelledOrders;
  public today;
  public formattedDate;
  public openStatus;
  public firebaseName;
  public firebaseUID;
  public hours;
  public address;

  constructor(
    public storage: Storage,
    public toastCtrl: ToastController,
    public afd: AngularFireDatabase,
    public alrtCtrl: AlertController,
    public sharedService: SharedService,
    public afAuth: AngularFireAuth) {
      if (localStorage.getItem('restaurantLogo')){
        this.firebaseUID = localStorage.getItem('firebaseUID').replace(/['"]+/g, '');
        this.firebaseName = localStorage.getItem('firebaseName').replace(/['"]+/g, '');
        this.restaurantLogo = localStorage.getItem('restaurantLogo').replace(/['"]+/g, '');
        this.restuarantName = localStorage.getItem('restaurantName').replace(/['"]+/g, '');
        this.restaurantType = localStorage.getItem('restaurantType').replace(/['"]+/g, '');
        this.planType = localStorage.getItem('planType').replace(/['"]+/g, '');
        this.phone = localStorage.getItem('phone').replace(/['"]+/g, '');
        this.email = localStorage.getItem('email').replace(/['"]+/g, '');
        this.site = localStorage.getItem('site').replace(/['"]+/g, '');
        this.openStatus = localStorage.getItem('openStatus').replace(/['"]+/g, '');
        this.address = localStorage.getItem('address');
        this.hours = localStorage.getItem('hours');
        if (localStorage.getItem('facebook')){
          this.facebook = localStorage.getItem('facebook').replace(/['"]+/g, '');
        }
        if (localStorage.getItem('twitter')){
          this.twitter = localStorage.getItem('twitter').replace(/['"]+/g, '');
        }
        if (localStorage.getItem('instagram')){
          this.instagram = localStorage.getItem('instagram').replace(/['"]+/g, '');
        }
      }
  }

  ionViewDidEnter(){
    this.sharedService.setData(this.firebaseUID);
  }

  onChange($event){
    console.log($event);
  }

  async save(){   
    let payload = {
      "address" : $('#address').val(),
      "hours" : $('#hours').val(),
      "email" : $('#email').val(),
      "facebook" : $('#facebook').val(),
      "instagram" : $('#instagram').val(),
      "openStatus" : $('#openStatus').val(),
      "phone" : $('#phone').val(),
      "site" : $('#site').val(),
      "twitter" : $('#twitter').val()
    }

    // Update firebase
    this.afd.object('/restaurants/' + this.firebaseName + '/client_info')
    .update(payload).then(resolve => {
      console.log('success');
    }, reject => {
      this.savedMessage('error');
    })
    .catch(reject => {
      this.savedMessage('error');
    });

    // Update firebase
    this.afd.object('/users/clients/' + this.firebaseUID)
    .update(payload)
    .then(resolve => {
      this.savedMessage('success');
    }, reject => {
      this.savedMessage('error');
    })
    .catch(reject => {
      this.savedMessage('error');
    });

    // Update localStorage
    localStorage.setItem('address', $('#address').val());
    this.address = $('#address').val();
    localStorage.setItem('hours', $('#hours').val());
    this.hours = $('#hours').val();
    localStorage.setItem('email',$('#email').val());
    this.email = $('#email').val()
    localStorage.setItem('facebook',$('#facebook').val());
    this.facebook = $('#facebook').val();
    localStorage.setItem('instagram',$('#instagram').val());
    this.instagram = $('#instagram').val();
    localStorage.setItem('openStatus',$('#openStatus').val());
    this.openStatus = $('#openStatus').val();
    localStorage.setItem('site',$('#site').val());
    this.site = $('#site').val();
    localStorage.setItem('twitter',$('#twitter').val());
    this.twitter = $('#twitter').val();
  }

  async savedMessage(status) {
    let message
    if (status == 'success'){
      message = 'Saved successfully!'
    }else{
      message = 'Oops! An error occurred';
    }
    const alert = await this.toastCtrl.create({
      message: message,
      cssClass: 'toastController',
      duration: 3000      
    });
    alert.present(); //update
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