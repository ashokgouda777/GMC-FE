import { Injectable, inject } from '@angular/core';
import { AdminService } from '../../features/admin/services/admin.service';
import { AuthService } from './auth.service';
import { of, tap, Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class ThemeService {
    private adminService = inject(AdminService);
    private authService = inject(AuthService);

    loadTheme(): Observable<any> {
        const user = this.authService.currentUser();
        if (!user || !user.id) {
            return of(null);
        }

        return this.adminService.getSiteSettings(user.id).pipe(
            tap((settings: any) => {
                if (settings) {
                    this.setTheme(settings);
                }
            })
        );
    }

    setTheme(settings: any) {
        const root = document.documentElement;

        if (settings.primaryColor) {
            root.style.setProperty('--primary-color', settings.primaryColor);
        }
        if (settings.secondaryColor) {
            root.style.setProperty('--secondary-color', settings.secondaryColor);
        }
        if (settings.textColor) {
            root.style.setProperty('--text-color', settings.textColor);
        }
        if (settings.backgroundColor) {
            root.style.setProperty('--bg-color', settings.backgroundColor);
        }
        if (settings.buttonColor) {
            root.style.setProperty('--button-color', settings.buttonColor);
        }
        if (settings.sidebarColor) {
            root.style.setProperty('--sidebar-bg', settings.sidebarColor);
        }
        if (settings.tableHeaderBg) {
            root.style.setProperty('--table-header-bg', settings.tableHeaderBg);
        }
        if (settings.tableHeaderText) {
            root.style.setProperty('--table-header-text', settings.tableHeaderText);
        }

        // New Comprehensive Theme Options
        const setProp = (key: string, val: string) => {
            if (val) root.style.setProperty(key, val);
        };

        setProp('--topbar-bg', settings.topbarBg);
        setProp('--navbar-bg', settings.navbarBg);
        setProp('--navbar-text', settings.navbarText);
        setProp('--sidebar-text', settings.sidebarText);
        setProp('--card-bg', settings.cardBg);
        setProp('--sidebar-active-color', settings.sidebarActiveColor);

        // Table Dynamic Props
        setProp('--table-body-bg', settings.tableBodyBg);
        setProp('--table-body-text', settings.tableBodyText);
        setProp('--table-btn-color', settings.tableBtnColor);
    }
}
