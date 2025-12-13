import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SocialLinksComponent } from './social-links.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

describe('SocialLinksComponent', () => {
  let component: SocialLinksComponent;
  let fixture: ComponentFixture<SocialLinksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SocialLinksComponent,BrowserAnimationsModule,ToastrModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SocialLinksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
