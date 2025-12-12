import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { ProfileService } from '../../Services/profile.service';
import { User } from '../../Models/user.model';
import { CommonModule } from '@angular/common';
import { ProfileSectionComponent } from './profile-section/profile-section.component';
import { BasicInfoComponent } from './basic-info/basic-info.component';
import { SummaryComponent } from './summary/summary.component';
import { ExperienceComponent } from './experience/experience.component';
import { EducationComponent } from './education/education.component';
import { SkillsComponent } from './skills/skills.component';
import { ProjectsComponent } from './projects/projects.component';
import { SocialLinksComponent } from './social-links/social-links.component';
import { AdditionalInfoComponent } from './additional-info/additional-info.component';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss'],
  imports: [
    CommonModule,
    ProfileSectionComponent,
    BasicInfoComponent,
    SummaryComponent,
    ExperienceComponent,
    EducationComponent,
    SkillsComponent,
    ProjectsComponent,
    SocialLinksComponent,
    AdditionalInfoComponent,
  ],
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  showPhotoMenu = false;

  @ViewChild('photoInput') photoInput!: ElementRef;

  constructor(private profileService: ProfileService) {}

  ngOnInit(): void {
    this.profileService.user$.subscribe((u) => (this.user = u));
  }

  togglePhotoMenu() {
    this.showPhotoMenu = !this.showPhotoMenu;
  }

  triggerPhotoUpload() {
    this.showPhotoMenu = false;
    this.photoInput.nativeElement.click();
  }

  updatePhoto(event: any) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      this.profileService.updateSection('profilePic', reader.result);
    };
    reader.readAsDataURL(file);
  }

  removePhoto() {
    this.profileService.updateSection('profilePic', null);
    this.showPhotoMenu = false;
  }
}
