import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdditionalInfoComponent } from './additional-info.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

describe('AdditionalInfoComponent', () => {
  let component: AdditionalInfoComponent;
  let fixture: ComponentFixture<AdditionalInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdditionalInfoComponent,BrowserAnimationsModule,ToastrModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdditionalInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
