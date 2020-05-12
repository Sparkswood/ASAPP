import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { IonicModule } from '@ionic/angular';

import { HomeScreenPage } from './home-screen.page';

describe('HomeScreenPage', () => {
  let component: HomeScreenPage;
  let fixture: ComponentFixture<HomeScreenPage>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HomeScreenPage ],
      imports: [IonicModule.forRoot()]
    }).compileComponents();

    fixture = TestBed.createComponent(HomeScreenPage);
    component = fixture.componentInstance;
    fixture.detectChanges();
  }));

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
