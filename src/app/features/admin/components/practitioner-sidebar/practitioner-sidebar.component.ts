import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { SharedSidebarComponent, SidebarItem } from '../../../../shared/components/shared-sidebar/shared-sidebar.component';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'app-practitioner-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule, SharedSidebarComponent],
    template: `
    <app-shared-sidebar 
        title="Practitioner Management" 
        [items]="sidebarItems">
    </app-shared-sidebar>
    `,
    styles: [] // Styles delegated to shared component
})
export class PractitionerSidebarComponent implements OnInit {
    private router = inject(Router);
    private route = inject(ActivatedRoute);
    private adminService = inject(AdminService);

    sidebarItems: SidebarItem[] = [];

    menuItems: any[] = [
        { label: 'Practitioner List', section: 'Practitioner' },
        { label: 'PRC List', section: 'PRC' },
        { label: 'FMG List', section: 'FMG' }
    ];

    ngOnInit() {
        this.updateActiveState();

        this.router.events.pipe(
            filter(event => event instanceof NavigationEnd)
        ).subscribe(() => {
            this.updateActiveState();
        });
    }

    updateActiveState() {
        this.sidebarItems = this.menuItems.map(item => {
            const section = item.section || item.label;
            return {
                label: item.label,
                route: '/admin/users',
                queryParams: { section: section },
                active: this.isActive(section)
            };
        });
    }

    isActive(section: string): boolean {
        const tree = this.router.parseUrl(this.router.url);
        const currentSection = tree.queryParams['section'];
        const urlPath = this.router.url.split('?')[0];

        // 1. Exact match on section query param
        if (currentSection === section) {
            return true;
        }

        // 2. Default logic for 'Practitioner' section (which is the first item/default list)
        if (section === 'Practitioner') {
            // Active if no section param AND we are on the main users list
            if (!currentSection && urlPath === '/admin/users') {
                return true;
            }
            // Active if we are on the practitioner detail page
            if (urlPath.startsWith('/admin/practitioner/')) {
                return true;
            }
        }

        return false;
    }
}
