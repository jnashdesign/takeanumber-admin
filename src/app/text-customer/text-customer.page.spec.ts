import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { TextCustomerPage } from './text-customer.page';

describe('TextCustomerPage', () => {
  let component: TextCustomerPage;
  let fixture: ComponentFixture<TextCustomerPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TextCustomerPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(TextCustomerPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
