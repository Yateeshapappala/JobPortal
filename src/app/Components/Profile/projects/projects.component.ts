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
import { removeEmptyRows } from '../../../utils/remove-empty';

@Component({
  selector: 'app-projects',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './projects.component.html',
})
export class ProjectsComponent implements OnInit {
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
      projects: this.fb.array([]),
    });

    this.profileService.user$.subscribe((u) => {
      this.user = u;
      this.loadFromUser(u);
    });
  }

  get projects(): FormArray {
    return this.form.get('projects') as FormArray;
  }

  /** Build a validated project row */
  createProjectForm(data: any = {}) {
    return this.fb.group({
      title: [data.title || '', [Validators.required, Validators.minLength(3)]],

      tech: [data.tech || '', [Validators.required, Validators.minLength(2)]],

      url: [
        data.url || '',
        [Validators.pattern(/^(https?:\/\/)?([\w\-])+(\.[\w\-]+)+[/#?]?.*$/)],
      ],

      description: [
        data.description || '',
        [Validators.required, Validators.minLength(10)],
      ],
    });
  }

  loadFromUser(u: User | null) {
    const p = u?.projects || [];

    this.projects.clear();
    p.forEach((proj) => this.projects.push(this.createProjectForm(proj)));

    if (p.length === 0) this.add(); // always at least 1 row
  }

  add() {
    this.projects.push(this.createProjectForm());
  }

  remove(i: number) {
    this.projects.removeAt(i);
  }

  save() {
    if (!this.user) return;

    const cleaned = removeEmptyRows(this.projects.value, [
      'title',
      'description',
      'tech',
      'url',
    ]);

    this.profileService.updateSection('projects', cleaned);
    this.toastr.success('Projects updated');
    this.saved.emit();
  }
}
