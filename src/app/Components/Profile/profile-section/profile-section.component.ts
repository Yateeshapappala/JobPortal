import { Component, Input } from '@angular/core';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-profile-section',
  templateUrl: './profile-section.component.html',
  styleUrls: ['./profile-section.component.scss'],
  imports: [NgClass],
})
export class ProfileSectionComponent {
  @Input() title!: string;
  editMode = false; // parent controls the section edit state

  toggle() {
    this.editMode = !this.editMode;
  }
}
