import { Component, ViewChild, OnInit } from '@angular/core';
import { Chart } from 'chart.js';
import { AngularFireDatabase } from 'angularfire2/database';
import { SharedService } from '../shared.service';
declare var $: any;

@Component({
  selector: 'app-tab3',
  templateUrl: './tab3.page.html',
  styleUrls: ['./tab3.page.scss'],
})

export class Tab3Page implements OnInit {
  @ViewChild('totalTimeChart') totalTimeChart;
  @ViewChild('waitTimeChart') waitTimeChart;
  public bars: any;
  public avgWaitTime;
  public avgOrderTime;
  public completedOrders;
  public cancelledOrders;
  public today;
  public formattedDate;
  public restuarantName;
  public restaurantLogo;
  public restaurantType;

  constructor(
    public sharedService: SharedService,
    public afd: AngularFireDatabase) {
    this.today = this.sharedService.getCurrentDate();
    this.formattedDate = this.getFormattedDate();
    this.getOrderData(this.today);
    if (localStorage.getItem('restaurantLogo')){
      this.restaurantLogo = localStorage.getItem('restaurantLogo').replace(/['"]+/g, '');
    }
  }

  ngOnInit() {
  }

  getOrderData(date) {
    this.afd.list('users/customers/bellsSweetFactory').valueChanges()
    .subscribe(res => {
      console.log('customers')
      console.log(res);
    })

    let firebaseName = localStorage.getItem('firebaseName');
    this.afd.list('restaurants/'+ firebaseName +'/' + date).valueChanges()
      .subscribe(res => {

        let tempArray: any = [];
        res.forEach((e) => {
          tempArray.push(e)
        });
        let cancelledList = [];
        let orderTimes = [];
        let cancelledOrderTimes = [];
        let orderInfo = [];
        let orderIDArray = [];
        let orderTimeArray = [];
        let waitTimeArray = [];

        tempArray.forEach((element) => {
          console.log(element);
          orderInfo.push(element);
        });

        let OrderTimeSum = 0;
        let WaitTimeSum = 0;
        orderInfo.forEach((element) => {

        if (element.status == 'cancelled'){
            cancelledList.push(element);
            let timeGotNumber = this.processtime(element.time_gotNumber);
            let timeCompleted = this.processtime(element.time_completed);
            let totalOrderTime = timeCompleted - timeGotNumber;
            if (isNaN(totalOrderTime)){
              totalOrderTime = 0;
            }
            console.log(totalOrderTime);

            cancelledOrderTimes.push({
              id: element.id,
              gotNumber: element.time_gotNumber,
              name: element.name,
              totalOrderTime: totalOrderTime
          });

          } else if (element.time_completed){

            let timeGotNumber = this.processtime(element.time_gotNumber);
            let timeOrderStarted = this.processtime(element.time_inProgress);
            let timeCompleted = this.processtime(element.time_completed);
            let totalOrderTime = timeCompleted - timeGotNumber;
            let timeWaiting = timeOrderStarted - timeGotNumber;

            if (timeGotNumber && timeOrderStarted && timeCompleted && totalOrderTime && timeWaiting){
              OrderTimeSum = OrderTimeSum + totalOrderTime;
              WaitTimeSum = WaitTimeSum + timeWaiting;
              orderIDArray.push(element.id);
              orderTimeArray.push(totalOrderTime);
              waitTimeArray.push(timeWaiting);

              orderTimes.push({
                id: element.id,
                gotNumber: element.time_gotNumber,
                name: element.name,
                status: element.status,
                timeOrderStarted: element.time_gotNumber,
                timeOrderInProgress: element.time_inProgress,
                timeOrderCompleted: element.time_completed,
                timeWaiting: timeWaiting,
                totalOrderTime: totalOrderTime
              });
            }
          }
        });
        console.log(cancelledOrderTimes);
        // Create Charts
        this.createTotalChart(orderTimes);
        this.createWaitChart(orderTimes);

        // Create Order Recap Table
        orderTimes.forEach((element) => {
            $('#completedOrders').append('<tr style="border-bottom: 1px solid #ccc;"><td><strong>'+ element.id +'</strong></td><td class="custName">' + element.name + '</td><td>' + element.gotNumber + '</td><td>' + element.timeWaiting + '</td><td>' + element.totalOrderTime + '</td></tr>');
        });
        cancelledOrderTimes.forEach((element) => {
          $('#cancelledOrders').append('<tr style="border-bottom: 1px solid #ccc;"><td><strong>'+ element.id +'</strong></td><td class="custName">' + element.name + '</td><td>' + element.gotNumber + '</td><td>' + element.totalOrderTime + '</td></tr>')
        });

        this.cancelledOrders = cancelledList.length;
        let avgOrderTimeInfo = OrderTimeSum /orderTimes.length;
        let avgWaitTimeInfo = WaitTimeSum / orderTimes.length;

        if (avgWaitTimeInfo){
          this.avgWaitTime = avgWaitTimeInfo.toFixed(0) + ' Minutes';
        }else{
          this.avgWaitTime = 'Not enough info.'
        }
        if (avgOrderTimeInfo){
          this.avgOrderTime = avgOrderTimeInfo.toFixed(0) + ' Minutes';
        }else{
          this.avgOrderTime = 'Not enough info.'
        }
        this.completedOrders = orderTimes.length;
      });
  }

    createTotalChart(orderTimes) {
    let labelName;
    let chartName;
    let idArray = [];
    let totalTimeArray = [];
    labelName = 'Total Order Time';
    chartName = this.totalTimeChart.nativeElement

    orderTimes.forEach((element) => {
      idArray.push(element.id);
      totalTimeArray.push(element.totalOrderTime);
    });

    this.bars = new Chart(chartName, {
      type: 'line',
      data: {
        labels: idArray,
        datasets: [{
          label: labelName,
          data: totalTimeArray,
          backgroundColor: 'rgba(38, 194, 129, 0.75)', // array should have same number of elements as number of dataset
          borderColor: 'rgb(56, 109, 33)',// array should have same number of elements as number of dataset
          borderWidth: 2,
          // fill: false
        }]
      },
      options: {
        title: {
          display: true,
          text: 'From Got Number Status to Complete Status'
        },
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
        },
        events: ['']
      }
    });
  }

  createWaitChart(orderTimes) {
    let labelName;
    let chartName;
    let idArray = [];
    let waitTimeArray = [];
    labelName = 'Wait Time';
    chartName = this.waitTimeChart.nativeElement;

    orderTimes.forEach((element) => {
      idArray.push(element.id);
      waitTimeArray.push(element.timeWaiting);
    });

    this.bars = new Chart(chartName, {
      type: 'line',
      data: {
        labels: idArray,
        datasets: [{
          label: labelName,
          data: waitTimeArray,
          backgroundColor: 'rgba(38, 194, 129, 0.75)', // array should have same number of elements as number of dataset
          borderColor: 'rgb(56, 109, 33)',// array should have same number of elements as number of dataset
          borderWidth: 2,
          // fill: false
        }]
      },
      options: {
        title: {
          display: true,
          text: 'From Got Number Status to Ready to Order'
        },
        scales: {
          xAxes: [{
            scaleLabel: {
              display: true,
              labelString: 'Order Number'
            }
          }],
          yAxes: [{
            ticks: {
              beginAtZero:true
          },    
            scaleLabel: {
              display: true,
              labelString: 'Minutes'
            }
          }]
        },
        events: ['']
      }
    });
  }

  processtime(time){
    // console.log(time);
    if (time){
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

}