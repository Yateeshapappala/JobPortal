import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobDetailsComponent } from './job-details.component';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

describe('JobDetailsComponent', () => {
  let component: JobDetailsComponent;
  let fixture: ComponentFixture<JobDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobDetailsComponent,BrowserAnimationsModule,ToastrModule.forRoot()],
      providers:[
        provideRouter([]),
        provideHttpClient(),
        //provideHttpClientTesting(),
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(JobDetailsComponent);
    component = fixture.componentInstance;
        component.jobDetails = {
      id: 1,
      title: 'Test Job',
      description: 'Test description',
    };

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
