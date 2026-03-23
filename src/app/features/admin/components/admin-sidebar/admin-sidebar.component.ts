import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';

@Component({
    selector: 'app-admin-sidebar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './admin-sidebar.component.html',
    styleUrl: './admin-sidebar.component.scss'
})
export class AdminSidebarComponent {
    public router = inject(Router);
    private route = inject(ActivatedRoute);

    isActive(route: string, exact: boolean = false): boolean {
        return this.router.isActive(this.router.createUrlTree([route]), {
            paths: 'subset',
            queryParams: exact ? 'exact' : 'ignored',
            fragment: 'ignored',
            matrixParams: 'ignored'
        });
    }

    // Helper for query params since routerLinkActive doesn't support them well out of the box for this specific use case
    isSectionActive(section: string): boolean {
        const tree = this.router.parseUrl(this.router.url);
        const g = tree.queryParams['section'];
        return g === section;
    }
}
