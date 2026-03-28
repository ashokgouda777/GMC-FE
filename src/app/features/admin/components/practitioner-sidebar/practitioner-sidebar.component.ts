import { Component, Input, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';
import { SharedSidebarComponent, SidebarItem } from '../../../../shared/components/shared-sidebar/shared-sidebar.component';

@Component({
    selector: 'app-practitioner-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule, SharedSidebarComponent],
    templateUrl: './practitioner-sidebar.component.html',
    styleUrl: './practitioner-sidebar.component.scss'
})
export class PractitionerSidebarComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    @Input() activeSection: string = 'Practitioner';

    menuItems: SidebarItem[] = [
        { label: 'Practitioner List', section: 'Practitioner', icon: '👥', route: '/admin/users', queryParams: { section: 'Practitioner' } },
        { label: 'PRC List', section: 'PRC', icon: '🏢', route: '/admin/users', queryParams: { section: 'PRC' } },
        { label: 'FMG List', section: 'FMG', icon: '📋', route: '/admin/users', queryParams: { section: 'FMG' } }
    ];

    displayItems: SidebarItem[] = [];

    ngOnInit() {
        this.updateActiveState();

        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            this.updateActiveState();
        });
    }

    updateActiveState() {
        this.displayItems = this.menuItems.map(item => {
            const section = item.section || item.label;
            return {
                ...item,
                active: this.isActive(section)
            };
        });
    }

    isActive(section: string): boolean {
        const currentSection = this.route.snapshot.queryParams['section'];
        const urlPath = this.router.url.split('?')[0];

        // Only highlight if we are in the users/practitioner module
        const isUsersArea = urlPath === '/admin/users' || urlPath.startsWith('/admin/practitioner/');
        if (!isUsersArea) return false;

        // If query param exists, it dominates the state
        if (currentSection) {
            return currentSection === section;
        }

        // Default to Practitioner if no specific section is requested (main list or profile view)
        return section === 'Practitioner';
    }
}
