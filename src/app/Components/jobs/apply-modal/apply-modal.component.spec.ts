import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ApplyModalComponent } from './apply-modal.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';



describe('ApplyModalComponent', () => {
  let component: ApplyModalComponent;
  let fixture: ComponentFixture<ApplyModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ApplyModalComponent,BrowserAnimationsModule,ToastrModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ApplyModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
