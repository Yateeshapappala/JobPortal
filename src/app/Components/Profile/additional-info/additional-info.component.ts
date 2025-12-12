import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { ProfileService } from '../../../Services/profile.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../../Models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-additional-info',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './additional-info.component.html',
})
export class AdditionalInfoComponent implements OnInit {
  @Input() editMode = false;
  @Output() saved = new EventEmitter<void>();

  form!: FormGroup;
  user!: User | null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      languages: ['', [Validators.pattern(/^[a-zA-Z ,]*$/)]],
      certifications: ['', [Validators.minLength(3)]],
      achievements: ['', [Validators.minLength(3)]],
    });

    this.profileService.user$.subscribe((u) => {
      this.user = u;

      this.form.patchValue({
        languages: (u?.additional?.languages || []).join(', '),
        certifications: (u?.additional?.certifications || []).join(', '),
        achievements: (u?.additional?.achievements || []).join(', '),
      });
    });
  }

  save() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      this.toastr.error('Please fix validation errors.');
      return;
    }

    if (!this.user) {
      this.toastr.error('User not loaded');
      return;
    }

    const v = this.form.value;

    const additional = {
      languages: v.languages
        ? v.languages
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      certifications: v.certifications
        ? v.certifications
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
      achievements: v.achievements
        ? v.achievements
            .split(',')
            .map((s: string) => s.trim())
            .filter(Boolean)
        : [],
    };

    //  Correct unified saving method
    this.profileService.updateSection('additional', additional);

    this.toastr.success('Additional info updated');
    this.saved.emit(); // close card
  }
}
