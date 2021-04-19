import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from 'angularfire2/database';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  selector: 'app-text-customer',
  templateUrl: './text-customer.page.html',
  styleUrls: ['./text-customer.page.scss'],
})
export class TextCustomerPage implements OnInit {
  phoneNumber;
  itemKey;
  name;
  messageTopic = 'moreInfo';
  messagePreview = 'TakeANumber: Please see the restaurant owner, we need more info.';

  constructor(
    public afd: AngularFireDatabase,
    public toastCtrl: ToastController,
    public modalController: ModalController) { }

  ngOnInit() {
    console.log(`number: ${this.phoneNumber}, itemKey: ${this.itemKey}, name: ${this.name}`);
  }

  topicChanged(){
    if (this.messageTopic == 'moreInfo'){
      this.messagePreview = 'TakeANumber: We need more information, please see the restaurant staff.';
    } else if (this.messageTopic == 'orderProblem'){
      this.messagePreview = 'TakeANumber: There\'s a problem with your order, please see the restaurant staff.';      
    } else if (this.messageTopic == 'soldOut'){
      this.messagePreview = 'TakeANumber: One of the items you ordered is sold out, please see the restaurant staff.';
    } else {
      this.messageTopic = 'moreInfo';
      this.messagePreview = 'TakeANumber: We need more information, please see the restaurant staff.';
    }
  }

  close() {
    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true
    });
  }

  async presentToast() {
    const toast = await this.toastCtrl.create({
      message: 'Your text message has been sent.',
      duration: 2000
    });
    toast.present();
  }

  sendPersonalMessage(){
    console.log('test');
    let date = this.getCurrentDate();
    let time = this.getTime();
    let timestamp = new Date().getTime();
    let payload = {
          time: time,
          phoneNumber: this.phoneNumber,
          message: this.messagePreview
      }
      
    this.afd.object('restaurants/' + localStorage.getItem('firebaseName') + '/' + date + '/' + this.itemKey + '/' + 'messages' + '/' + timestamp).update(payload);
    
    this.presentToast();
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

}
