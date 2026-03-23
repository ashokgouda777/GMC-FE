import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SharedSidebarComponent, SidebarItem } from '../../../../shared/components/shared-sidebar/shared-sidebar.component';

@Component({
    selector: 'app-user-control',
    standalone: true,
    imports: [CommonModule, RouterOutlet, SharedSidebarComponent],
    template: `
    <div class="page-layout">
        <app-shared-sidebar 
            title="Roles" 
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
export class UserControlComponent {
    sidebarItems: SidebarItem[] = [
        { label: 'Case Workers', route: 'case-workers' },
        { label: 'Admins', route: 'admins' }
    ];
}
