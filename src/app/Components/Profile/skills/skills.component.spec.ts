import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SkillsComponent } from './skills.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';

describe('SkillsComponent', () => {
  let component: SkillsComponent;
  let fixture: ComponentFixture<SkillsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsComponent,BrowserAnimationsModule,ToastrModule.forRoot()]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
