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
  pastDateValidator,
  endDateValidator,
} from '../../../Validators/date.validator';
import { removeEmptyRows } from '../../../utils/remove-empty';

@Component({
  selector: 'app-education',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './education.component.html',
})
export class EducationComponent implements OnInit {
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
      education: this.fb.array([]),
    });

    this.profileService.user$.subscribe((u) => {
      this.user = u;
      this.loadFromUser(u);
    });
  }

  get education(): FormArray {
    return this.form.get('education') as FormArray;
  }

  /** Build 1 education row with validators */
  createEducationForm(data: any = {}) {
    return this.fb.group(
      {
        degree: [
          data.degree || '',
          [Validators.required, Validators.minLength(2)],
        ],

        institute: [
          data.institute || '',
          [Validators.required, Validators.minLength(2)],
        ],

        startDate: [data.startDate || '', [pastDateValidator]],
        endDate: [data.endDate || ''],

        score: [data.score || '', [Validators.maxLength(10)]],
      },
      { validators: endDateValidator }
    );
  }

  loadFromUser(u: User | null) {
    const ed = u?.education || [];

    this.education.clear();
    ed.forEach((e) => this.addFromData(e));

    if (ed.length === 0) this.add();
  }

  add() {
    this.education.push(this.createEducationForm());
  }

  addFromData(e: any) {
    this.education.push(this.createEducationForm(e));
  }

  remove(i: number) {
    this.education.removeAt(i);
  }

  save() {
    if (!this.user) return;

    const cleaned = removeEmptyRows(this.education.value, [
      'degree',
      'institute',
      'startDate',
      'endDate',
      'score',
    ]);

    this.profileService.updateSection('education', cleaned);
    this.toastr.success('Education updated');
    this.saved.emit();
  }
}
