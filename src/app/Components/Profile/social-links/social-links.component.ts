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
  selector: 'app-social-links',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './social-links.component.html',
  styleUrls: ['./social-links.component.scss'],
})
export class SocialLinksComponent implements OnInit {
  @Input() editMode = false; // ← Controlled by parent
  @Output() saved = new EventEmitter<void>(); // ← Parent closes card

  form!: FormGroup;
  user!: User | null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      linkedin: [
        '',
        [Validators.pattern(/^https?:\/\/(www\.)?linkedin\.com\/.*$/)],
      ],

      github: [
        '',
        [Validators.pattern(/^https?:\/\/(www\.)?github\.com\/.*$/)],
      ],

      website: [
        '',
        [
          Validators.pattern(
            /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-./?%&=]*)?$/
          ),
        ],
      ],
    });

    this.profileService.user$.subscribe((u) => {
      this.user = u;

      this.form.patchValue({
        linkedin: u?.social?.linkedin || '',
        github: u?.social?.github || '',
        website: u?.social?.website || '',
      });
    });
  }

  save() {
    if (!this.user) return;

    this.profileService.updateSection('social', this.form.value);
    this.toastr.success('Social links updated');
    this.saved.emit();
  }
}
