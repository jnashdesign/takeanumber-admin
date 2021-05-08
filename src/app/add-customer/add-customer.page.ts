import { Component, OnInit } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AngularFireDatabase } from 'angularfire2/database';
declare var $: any;

@Component({
  selector: 'app-add-customer',
  templateUrl: './add-customer.page.html',
  styleUrls: ['./add-customer.page.scss'],
})

export class AddCustomerPage implements OnInit {
  
  // String variables
  public timeStamp: any;
  public tab: string;
  public myID: string;
  public date: string;
  public time: string;
  public name: string;
  public status: string;
  public firebaseName: string;
  public phoneNumber: string;

    // Array variables
    public itemList: any;
    public numItems: Number;
    public restaurants: any;
    public items = [];
    public presentModalVar;
    public textUpdates: boolean;
    public textOption: boolean;
    public textToggle: boolean;
    public numberSaved: boolean;
  
  constructor(
    public modalController: ModalController,
    public afd: AngularFireDatabase,
    public toastCtrl: ToastController) {
      this.firebaseName = localStorage.getItem('firebaseName');
  }

  ngOnInit() {
  }

  close() {
    this.numItems = undefined,
    this.phoneNumber = undefined,
    this.phoneNumber = undefined,
    this.timeStamp = undefined

    // using the injected ModalController this page
    // can "dismiss" itself and optionally pass back data
    this.modalController.dismiss({
      'dismissed': true
    });
  }

    // Define popup function collecting 
  // header and message params.
  async presentToast(messageHeader, message) {
    // Create the popup
    const toast = await this.toastCtrl.create({
      header: messageHeader,
      message: message,
      position: 'top',
      buttons: [{
          text: 'Got it!',
          role: 'cancel',
          handler: () => {
            console.log('Cancel clicked');
          }
        }]
    });

    // Present the popup
    toast.present();
  }

  numbersOnly(e){
    if (e.which != 8 && e.which != 0 && (e.which < 48 || e.which > 57)) {
      return false;
    }
  }

  validateInfo(){
    // Get customer name field input
    let name = $('#nameInput').val();

    console.log(name);
    // Throw error if name is not provided.
    if (!name) {
      this.presentToast('Oops! Name is required.', 'We need a name to add to your number.');
    }else{
      this.validatePhoneNumber(name);
    }
  }

  validatePhoneNumber(name){
    let mobileFormat = /^[1-9]{1}[0-9]{9}$/;
    let currentValue = $('#phoneNumberInput').val();
    if(mobileFormat.test(currentValue) == false && currentValue != 10){
        $('#phoneNumberInput').css('border-color','red').addClass('error');
        this.presentToast('Oops! Number is required.', 'There seems to be an issue with your phone number.');
        return;
    } else{
        $('#phoneNumberInput').css('border-color','#2ad85b').removeClass('error');
        // Update opt in variable and storage reference
        this.phoneNumber = $('#phoneNumberInput').val();
        this.numberSaved = true;
        this.addItem(name);
    }
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

  addItem(name) {
    let date = this.getCurrentDate();
    let time = this.getTime();

    // Create a timestamp to append to the Firebase entry 
    // to ensure they stay chronological
    let newDate = new Date();
    this.timeStamp = newDate.getTime();
    console.log(date);

    this.afd.list('/restaurants/' + this.firebaseName + '/' + date + '/').valueChanges()
      .subscribe(data => {
        console.log(data);
        if (data.length === 1){
          this.numItems = 0;
        }else{
          this.numItems = data.length + 1;
        }

      let payload;
      if (this.numberSaved == true){
        payload = {
          date: date,
          id: this.numItems,
          name: name,
          phone: this.phoneNumber,
          status: 'in-progress',
          text: 'in-progress|'+this.phoneNumber,
          time_gotNumber: time,
          time_inProgress: time,
          timeStamp: this.timeStamp
        }
      }

      // Push data to Firebase
      this.afd.object('/restaurants/' + this.firebaseName + '/' + date + '/' + this.timeStamp + '_' + name)
      .update(payload);

      let userInfo = {
        lastActiveDate: date,
        lastActiveTime: time,
        name: this.name,
        phone: this.phoneNumber
      }
      
      this.afd.object('/users/customers/' + this.firebaseName + '/' + this.phoneNumber)
      .update(userInfo);
    }
  )};
}
