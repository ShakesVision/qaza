import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { QazaformModalPage } from './qazaform-modal.page';

describe('QazaformModalPage', () => {
  let component: QazaformModalPage;
  let fixture: ComponentFixture<QazaformModalPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ QazaformModalPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(QazaformModalPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
