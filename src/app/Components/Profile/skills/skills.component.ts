import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProfileService } from '../../../Services/profile.service';
import { ToastrService } from 'ngx-toastr';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { User } from '../../../Models/user.model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-skills',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss'],
})
export class SkillsComponent implements OnInit {
  @Input() editMode = false; // <-- controlled by parent
  @Output() saved = new EventEmitter<void>(); // <-- event to close card

  user!: User | null;
  form!: FormGroup;
  skills: string[] = [];

  constructor(
    private profileService: ProfileService,
    private fb: FormBuilder,
    private toastr: ToastrService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      skillInput: [''],
    });

    // 🔥 Subscribe so UI updates instantly when saved
    this.profileService.user$.subscribe((u) => {
      this.user = u;
      this.skills = [...(u?.skills || [])];
    });
  }

  addSkill() {
    const v = (this.form.get('skillInput')!.value || '').trim();
    if (v && !this.skills.includes(v)) this.skills.push(v);

    this.form.patchValue({ skillInput: '' });
  }

  remove(i: number) {
    this.skills.splice(i, 1);
  }
  onEnter(event: KeyboardEvent) {
    event.preventDefault();
    this.addSkill();
  }

  save() {
    if (!this.user) {
      this.toastr.error('User not loaded');
      return;
    }

    const updated: User = {
      ...this.user,
      skills: this.skills,
    };

    this.profileService.updateUser(updated);
    this.toastr.success('Skills updated');

    this.saved.emit(); // 🔥 closes the edit mode in parent
  }
}
