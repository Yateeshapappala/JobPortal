import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';

import { ProfileService } from '../../../Services/profile.service';
import { ToastrService } from 'ngx-toastr';
import { User } from '../../../Models/user.model';
import { CommonModule } from '@angular/common';
import {
  endDateValidator,
  pastDateValidator,
} from '../../../Validators/date.validator';
import { removeEmptyRows } from '../../../utils/remove-empty';

@Component({
  selector: 'app-experience',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './experience.component.html',
})
export class ExperienceComponent implements OnInit {
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
      experience: this.fb.array([]),
    });

    this.profileService.user$.subscribe((u) => {
      this.user = u;
      this.setExperienceFromUser(u);
    });
  }

  get experience(): FormArray {
    return this.form.get('experience') as FormArray;
  }

  /** Create validated form row */
  createExperienceForm(data: any = {}) {
    return this.fb.group(
      {
        title: [
          data.title || '',
          [Validators.required, Validators.minLength(2)],
        ],
        company: [
          data.company || '',
          [Validators.required, Validators.minLength(2)],
        ],

        startDate: [data.startDate || '', [pastDateValidator]],
        endDate: [data.endDate || ''],

        current: [data.current || false],

        tech: [data.tech || '', [Validators.maxLength(50)]],
        description: [data.description || ''],
      },
      { validators: endDateValidator }
    );
  }

  /** Load existing experience */
  setExperienceFromUser(u: User | null) {
    const exp = u?.experience || [];

    this.experience.clear();

    exp.forEach((e) => this.addFromData(e));

    if (exp.length === 0) this.add();
  }

  add() {
    this.experience.push(this.createExperienceForm());
  }

  addFromData(e: any) {
    this.experience.push(this.createExperienceForm(e));
  }

  remove(i: number) {
    this.experience.removeAt(i);
  }

  save() {
    if (!this.user) return;

    const cleaned = removeEmptyRows(this.experience.value, [
      'title',
      'company',
      'startDate',
      'endDate',
      'description',
      'tech',
    ]);

    this.profileService.updateSection('experience', cleaned);
    this.toastr.success('Experience updated');
    this.saved.emit();
  }
}
