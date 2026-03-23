import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { adminConfigResolver } from './core/resolvers/admin-config.resolver';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { AdminLoginComponent } from './features/admin/pages/admin-login/admin-login.component';
import { UserLoginComponent } from './features/user/pages/user-login/user-login.component';
import { LandingPageComponent } from './features/landing/pages/landing-page/landing-page.component';

export const routes: Routes = [
    // Landing Route (Default)
    {
        path: '',
        component: LandingPageComponent,
        pathMatch: 'full'
    },

    // Auth Routes (Public)
    {
        path: 'auth',
        component: AuthLayoutComponent,
        children: [
            { path: 'admin-login', component: AdminLoginComponent },
            { path: 'login', component: UserLoginComponent }, // Default user login
            { path: '', redirectTo: 'login', pathMatch: 'full' }
        ]
    },

    // Admin Routes (Protected, Layout)
    {
        path: 'admin',
        component: MainLayoutComponent,
        canActivate: [authGuard('admin')],
        resolve: { config: adminConfigResolver },
        loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
    },

    // User Routes (Protected, Layout)
    {
        path: 'user',
        component: MainLayoutComponent,
        canActivate: [authGuard('user')],
        loadChildren: () => import('./features/user/user.routes').then(m => m.USER_ROUTES)
    },

    // Fallback
    { path: '**', redirectTo: '' }
];

