import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LoginpageComponent } from './loginpage.component';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

describe('LoginpageComponent', () => {
  let component: LoginpageComponent;
  let fixture: ComponentFixture<LoginpageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        LoginpageComponent,
        BrowserAnimationsModule,
        ToastrModule.forRoot(),
      ],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(LoginpageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
