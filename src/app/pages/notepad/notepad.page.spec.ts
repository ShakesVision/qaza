import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { NotepadPage } from './notepad.page';

describe('NotepadPage', () => {
  let component: NotepadPage;
  let fixture: ComponentFixture<NotepadPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NotepadPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(NotepadPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
