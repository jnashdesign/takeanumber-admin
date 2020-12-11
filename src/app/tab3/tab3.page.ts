import { Component, ViewChild } from '@angular/core';
import { Chart } from 'chart.js';
import { Storage } from '@ionic/storage';
import { AngularFireDatabase } from 'angularfire2/database';
import { AngularFireAuth } from 'angularfire2/auth';
import { AlertController } from '@ionic/angular';
declare var $: any;

@Component({
  selector: 'app-tab3',
  templateUrl: 'tab3.page.html',
  styleUrls: ['tab3.page.scss']
})


export class Tab3Page {
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
  public userID;
  public avgWaitTime;
  public avgOrderTime;
  public completedOrders;
  public cancelledOrders;
  public today;
  public formattedDate;

  constructor(
    public storage: Storage,
    public afd: AngularFireDatabase,
    public alrtCtrl: AlertController,
    public afAuth: AngularFireAuth) {
      this.today = this.getCurrentDate();
      this.formattedDate = this.getFormattedDate();
      this.getDates();
      if (localStorage.getItem('restaurantLogo')){
        this.restaurantLogo = localStorage.getItem('restaurantLogo').replace(/['"]+/g, '');
        this.restuarantName = localStorage.getItem('restaurantName').replace(/['"]+/g, '');
        this.restaurantType = localStorage.getItem('restaurantType').replace(/['"]+/g, '');
        this.planType = localStorage.getItem('planType').replace(/['"]+/g, '');
        this.phone = localStorage.getItem('phone').replace(/['"]+/g, '');
        this.email = localStorage.getItem('email').replace(/['"]+/g, '');  
      }
      this.getOrderData(this.today);
  }

  ionViewDidEnter(){
  }

  createTotalChart(orderInfoArray) {
    let labelName;
    let chartName;
      $('#totalTimeChart').remove();
      $('.totalChartContent').append('<canvas id="totalTimeChart"></canvas>');  
      labelName = 'Total Order Time (minutes)';
      chartName = this.totalTimeChart.nativeElement

    this.bars = new Chart(chartName, {
      type: 'line',
      data: {
        labels: orderInfoArray.ids,
        datasets: [{
          label: labelName,
          data: orderInfoArray.times,
          backgroundColor: 'rgb(38, 194, 129)', // array should have same number of elements as number of dataset
          borderColor: 'rgb(56, 109, 33)',// array should have same number of elements as number of dataset
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Order Number'
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Minutes'
            }
          }]
        }
      }
    });
  }

  createWaitChart(orderInfoArray) {
    let labelName;
    let chartName;
      $('#waitTimeChart').remove();
      $('.waitChartContent').append('<canvas id="waitTimeChart"></canvas>');
      labelName = 'Wait Time (minutes)';
      chartName = this.waitTimeChart.nativeElement

    this.bars = new Chart(chartName, {
      type: 'line',
      data: {
        labels: orderInfoArray.ids,
        datasets: [{
          label: labelName,
          data: orderInfoArray.times,
          backgroundColor: 'rgb(38, 194, 129)', // array should have same number of elements as number of dataset
          borderColor: 'rgb(56, 109, 33)',// array should have same number of elements as number of dataset
          borderWidth: 2
        }]
      },
      options: {
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Order Number'
            }
          }],
          yAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Minutes'
            }
          }]
        }
      }
    });
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


  getDates(){
    this.afd.object('restaurants/'+ localStorage.getItem('firebaseName') +'/').valueChanges()
    .subscribe(res => {
      let tempArray = Object.keys(res);
      let monthArray: any = [];
      tempArray.pop();
      tempArray.forEach((foundDate) => {
        let newDate = foundDate.split('-');
        let month = newDate[0];
        if (parseInt(month) < 10){
          month = '0' + month + '-' + newDate[1] + '-' + newDate[2];
          monthArray.push(month);
        }else{
          monthArray.push(foundDate);
        }
      });
      monthArray.sort().reverse();
      monthArray.forEach((e) => {
        $('ion-select').append('<ion-select-option value="' + e + '">' + e + '</ion-select-option>')
      });
    });
  }

  onChange($event){
    this.getOrderData($event.target.value);
  }

  getOrderData(date) {
    let firebaseName = localStorage.getItem('firebaseName');
    this.afd.list('restaurants/'+ firebaseName +'/' + date).valueChanges()
      .subscribe(res => {
        // console.log(res)
        let tempArray: any = [];
        res.forEach((e) => {
          tempArray.push(e)
        });
        let cancelledList = [];
        let orderTimes = [];
        let orderInfo = [];
        let orderIDArray = [];
        let orderTimeArray = [];
        let waitTimeArray = [];
        tempArray.forEach((element) => {
          // console.log(element);
          let info = {
            id: element.id,
            status: element.status,
            time_gotNumber: element.time_gotNumber,
            time_inProgress: element.time_inProgress,
            time_completed: element.time_completed
          }
          orderInfo.push(info);
        });
        let OrderTimeSum = 0;
        let WaitTimeSum = 0;
        orderInfo.forEach((element) => {
          // console.log(element)
          if (element.status == 'cancelled'){
            cancelledList.push(element);
          } else if (element.time_completed){
            // console.log(element);
            let timeGotNumber = this.processtime(element.time_gotNumber);
            let timeOrderStarted = this.processtime(element.time_inProgress);
            let timeCompleted = this.processtime(element.time_completed);
            let totalOrderTime = timeCompleted - timeGotNumber;
            let timeWaiting = timeOrderStarted - timeGotNumber;
            OrderTimeSum = OrderTimeSum + totalOrderTime;
            WaitTimeSum = WaitTimeSum + timeWaiting;
            orderIDArray.push(element.id);
            orderTimeArray.push(totalOrderTime);
            waitTimeArray.push(timeWaiting)
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
        this.cancelledOrders = cancelledList.length;
        let avgOrderTimeInfo = OrderTimeSum /orderTimes.length;
        this.avgOrderTime = avgOrderTimeInfo.toFixed(0);
        let avgWaitTimeInfo = WaitTimeSum / orderTimes.length;
        if (avgWaitTimeInfo){
          this.avgWaitTime = avgWaitTimeInfo.toFixed(0);
        }else{
          this.avgWaitTime = 'Not enough info.'
        }
        this.completedOrders = orderTimes.length;
        let totalOrderTimeArray = {
          ids: orderIDArray,
          times: orderTimeArray
        }
        let totalWaitTimeArray = {
          ids: orderIDArray,
          times: waitTimeArray
        }
        this.createTotalChart(totalOrderTimeArray);
        this.createWaitChart(totalWaitTimeArray);
      });
  }

  processtime(time){
    time = time.split(' ');
    let timeFormatted = time[0].split(':');
    let hourNumber = timeFormatted[0];
    if (hourNumber !== '12'){
      if (time[1] == 'PM' || hourNumber !== '12'){
        hourNumber = JSON.parse(hourNumber) + 12;
      }else{
        // do nothing
      }
    }
    let hourInMinutes = JSON.parse(hourNumber) * 60;
    let minutes = parseInt(timeFormatted[1]);
    let totalMinutes = hourInMinutes + minutes
    return totalMinutes;
  }

  getFormattedDate() {
    // Get date info
    let d = new Date;
    let  months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    let month = months[d.getMonth()];
    let day = d.getDate();
    let year = d.getFullYear();
    let date = month + ' ' + day + ', ' + year;

    return date;
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
