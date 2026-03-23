import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, UserRole } from '../services/auth.service';

export const authGuard = (role?: UserRole): CanActivateFn => {
    return (route, state) => {
        const authService = inject(AuthService);
        const router = inject(Router);

        if (!authService.isAuthenticated()) {
            // Redirect to login if not authenticated
            // Decide logic for admin vs user login based on tried url or default
            if (state.url.includes('admin')) {
                return router.createUrlTree(['/auth/admin-login']);
            }
            return router.createUrlTree(['/auth/login']);
        }

        if (role && !authService.hasRole(role)) {
            // Role mismatch
            console.warn(`Unauthorized access attempt. Required role: ${role}`);
            return router.createUrlTree(['/']); // Redirect home or error page
        }

        return true;
    };
};
