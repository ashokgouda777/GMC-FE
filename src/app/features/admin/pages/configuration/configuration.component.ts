import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SharedSidebarComponent, SidebarItem } from '../../../../shared/components/shared-sidebar/shared-sidebar.component';

@Component({
  selector: 'app-configuration',
  standalone: true,
  imports: [CommonModule, RouterOutlet, SharedSidebarComponent],
  template: `
    <div class="page-layout">
        <app-shared-sidebar 
            title="Configuration" 
            [items]="sidebarItems">
        </app-shared-sidebar>

      <main class="content-area">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styles: [`
    @import 'sidebar-layout';
  `]
})
export class ConfigurationComponent {
  sidebarItems: SidebarItem[] = [
    { label: 'User Management', route: 'user-management' },
    { label: 'User Access Control', route: 'user-access-control' },
    { label: 'Website Configuration', route: 'website-config' },
    { label: 'Notification Configuration', route: 'notification-config' },
    { label: 'Broadcast SMS', route: 'broadcast-sms' },
    { label: 'University List', route: 'university-list' },
    { label: 'Colleges List', route: 'colleges-list' },
    { label: 'Subject Master', route: 'subject-master' },
    { label: 'Course List', route: 'course-list' },
    { label: 'State List', route: 'state-list' },
    { label: 'District List', route: 'district-list' },
    { label: 'Country Master', route: 'country-master' },
    { label: 'Nationality Master', route: 'nationality-master' },
    { label: 'Registration Type', route: 'registration-type' },
    { label: 'Signature', route: 'signature' }
  ];
}

