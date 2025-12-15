import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ProfileService } from '../../../Services/profile.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../../Models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-summary',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './summary.component.html',
  styleUrls: ['./summary.component.scss'],
})
export class SummaryComponent implements OnInit {
  @Input() editMode = false; // 🔥 receives from app-profile-section
  @Output() saved = new EventEmitter<void>(); // 🔥 notifies parent on save

  form!: FormGroup;
  user!: User | null;

  constructor(
    private fb: FormBuilder,
    private profileService: ProfileService,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
      this.form = this.fb.group({
      summary: [this.user?.summary || ''],
    });
    this.profileService.user$.subscribe((u) => {
      this.user = u;
      if (u) {
        this.form.patchValue({ summary: u.summary });
      }
    });

  
  }

  save() {
    if (!this.user) return;
    this.profileService.updateSection('summary', this.form.value.summary);
    this.toastr.success('Summary updated');
    this.saved.emit();
  }
}
