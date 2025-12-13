import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SkillsComponent } from './skills.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrService } from 'ngx-toastr';
import { ProfileService } from '../../../Services/profile.service';
import { Subject } from 'rxjs';
import { User } from '../../../Models/user.model';

describe('SkillsComponent', () => {
  let component: SkillsComponent;
  let fixture: ComponentFixture<SkillsComponent>;

  /* ---------- MOCK USER ---------- */
  const mockUser: User = {
    fullName: 'John Doe',
    email: 'john@test.com',
    username: 'john',
    skills: ['Angular', 'TypeScript'],
  } as User;

  /* ---------- MOCK PROFILE SERVICE ---------- */
  const userSubject = new Subject<User | null>();

  const profileServiceMock = {
    user$: userSubject.asObservable(),
    updateUser: jasmine.createSpy('updateUser'),
  };

  /* ---------- MOCK TOASTR ---------- */
  const toastrMock = {
    success: jasmine.createSpy('success'),
    error: jasmine.createSpy('error'),
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SkillsComponent, BrowserAnimationsModule],
      providers: [
        { provide: ProfileService, useValue: profileServiceMock },
        { provide: ToastrService, useValue: toastrMock },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SkillsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    // emit user AFTER init
    userSubject.next(mockUser);
  });

  /* ---------- BASIC ---------- */

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /* ---------- INIT ---------- */

  it('should load skills from user$', () => {
    expect(component.user).toEqual(mockUser);
    expect(component.skills).toEqual(['Angular', 'TypeScript']);
  });

  /* ---------- ADD SKILL ---------- */

  it('should add a new skill', () => {
    component.form.patchValue({ skillInput: 'React' });

    component.addSkill();

    expect(component.skills).toContain('React');
    expect(component.form.value.skillInput).toBe('');
  });

  it('should not add duplicate skill', () => {
    component.form.patchValue({ skillInput: 'Angular' });

    component.addSkill();

    expect(component.skills.filter(s => s === 'Angular').length).toBe(1);
  });

  it('should not add empty skill', () => {
    component.form.patchValue({ skillInput: '   ' });

    component.addSkill();

    expect(component.skills.length).toBe(2);
  });

  /* ---------- REMOVE SKILL ---------- */

  it('should remove skill by index', () => {
    component.remove(0);

    expect(component.skills).toEqual(['TypeScript']);
  });

  /* ---------- ENTER KEY ---------- */

  it('should add skill on enter key press', () => {
    const event = new KeyboardEvent('keydown', { key: 'Enter' });
    spyOn(event, 'preventDefault');

    component.form.patchValue({ skillInput: 'NodeJS' });
    component.onEnter(event);

    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.skills).toContain('NodeJS');
  });

  /* ---------- SAVE ---------- */

  it('should save skills and emit event', () => {
    spyOn(component.saved, 'emit');

    component.save();

    expect(profileServiceMock.updateUser).toHaveBeenCalledWith({
      ...mockUser,
      skills: component.skills,
    });

    expect(toastrMock.success).toHaveBeenCalledWith('Skills updated');
    expect(component.saved.emit).toHaveBeenCalled();
  });
});
