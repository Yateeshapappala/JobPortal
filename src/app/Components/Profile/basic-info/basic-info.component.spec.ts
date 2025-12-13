import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicInfoComponent } from './basic-info.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

describe('BasicInfoComponent', () => {
  let component: BasicInfoComponent;
  let fixture: ComponentFixture<BasicInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicInfoComponent,BrowserAnimationsModule,ToastrModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
