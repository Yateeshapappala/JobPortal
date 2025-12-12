import {
  Component,
  OnInit,
  ViewChild,
  ElementRef,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';

import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

import { ProfileService } from '../../../Services/profile.service';
import { User } from '../../../Models/user.model';
import { ToastrService } from 'ngx-toastr';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-basic-info',
  templateUrl: './basic-info.component.html',
  styleUrls: ['./basic-info.component.scss'],
  imports: [CommonModule, ReactiveFormsModule],
})
export class BasicInfoComponent implements OnInit {
  @Input() editMode = false;
  @Output() saved = new EventEmitter<void>();

  @ViewChild('fileInput') fileInput!: ElementRef;

  user!: User | null;
  form!: FormGroup;
  previewPic: string | null = null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.user = this.profileService.getCurrentUser();
    this.previewPic = this.user?.profilePic || null;

    this.form = this.fb.group({
      fullName: [this.user?.fullName || '', Validators.required],

      email: [this.user?.email || '', [Validators.required, Validators.email]],

      mobile: [this.user?.mobile || '', [Validators.pattern(/^[0-9]{10}$/)]],

      dob: [this.user?.dob || '', [this.dobValidator]],

      gender: [this.user?.gender || ''],
      city: [this.user?.city || ''],
      state: [this.user?.state || ''],
      country: [this.user?.country || ''],
    });
  }

  /** Custom DOB validator */
  dobValidator(control: AbstractControl): ValidationErrors | null {
    const value = control.value;
    if (!value) return null;

    const dob = new Date(value);
    const today = new Date();

    // must be past date
    if (dob >= today) {
      return { invalidDob: true };
    }

    // must be 18+
    const age = today.getFullYear() - dob.getFullYear();
    const monthCheck =
      today.getMonth() < dob.getMonth() ||
      (today.getMonth() === dob.getMonth() && today.getDate() < dob.getDate());

    if (age < 18 || (age === 18 && monthCheck)) {
      return { invalidDob: true };
    }

    return null;
  }

  openPic() {
    this.fileInput.nativeElement.click();
  }

  pickPic(e: any) {
    const f = e.target.files[0];
    const reader = new FileReader();
    reader.onload = () => (this.previewPic = reader.result as string);
    reader.readAsDataURL(f);
  }

  save() {
    if (!this.user) return;

    const updated = {
      ...this.user,
      ...this.form.value,
      profilePic: this.previewPic,
    };

    this.profileService.updateUser(updated);
    this.toastr.success('Profile updated successfully');
    this.saved.emit();
  }
}
