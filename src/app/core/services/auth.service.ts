import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';

import { HttpClient } from '@angular/common/http';
import { Observable, of, tap, map } from 'rxjs';
import { environment } from '../../../environments/environment';

export type UserRole = 'admin' | 'user';

export interface User {
    id: string;
    username: string;
    role: UserRole;
    roleId: number;
    roleName?: string; // Added roleName
    token: string;
}

interface LoginResponse {
    token: string;
    userId?: string; // Updated from user sample
    id?: any;
    name?: string;
    userName?: string;
    role_Id?: string | number;
    roleId?: number;
    roleName?: string;
}

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private http = inject(HttpClient);
    private router = inject(Router);
    private apiUrl = environment.apiUrl;

    // Signals for reactive state
    currentUserStr = localStorage.getItem('currentUser');
    currentUser = signal<User | null>(this.currentUserStr ? JSON.parse(this.currentUserStr) : null);

    login(credentials: { userName?: string; username?: string; password?: string }, role: UserRole): Observable<User> {
        // Backend expects 'userName' and 'password'
        const payload = {
            userName: credentials.userName || credentials.username, // handle both casing
            password: credentials.password,
        };

        const endpoint = role === 'user' ? '/Users/userlogin' : '/Users/login';
        return this.http.post<LoginResponse>(`${this.apiUrl}${endpoint}`, payload).pipe(
            map(response => {
                // Validate Token
                if (!response.token || this.isTokenExpired(response.token)) {
                    throw new Error('Invalid or expired token received');
                }

                // Adapt response to User interface
                const rawRoleId = response.role_Id || response.roleId;
                const roleId = rawRoleId ? Number(rawRoleId) : (role === 'admin' ? 1 : 3);

                // Map roleId to roleName if not provided
                let roleName = response.roleName;
                if (!roleName) {
                    switch (roleId) {
                        case 1: roleName = 'Admin'; break;
                        case 2: roleName = 'Case Worker'; break;
                        case 3: roleName = 'Data Entry Operator'; break;
                        default: roleName = 'User';
                    }
                }

                const user: User = {
                    id: response.userId || String(response.id || '0'), // Prioritize userId
                    username: response.name || response.userName || payload.userName || 'User',
                    role: role,
                    roleId: roleId,
                    roleName: roleName,
                    token: response.token
                };
                console.log('AuthService: User logged in', user);
                return user;
            }),
            tap(user => {
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUser.set(user);
            })
        );
    }

    logout() {
        const user = this.currentUser();
        const isAdmin = user?.role === 'admin';

        localStorage.removeItem('currentUser');
        this.currentUser.set(null);

        if (isAdmin) {
            this.router.navigate(['/auth/admin-login']);
        } else {
            this.router.navigate(['/auth/login']);
        }
    }

    isAuthenticated(): boolean {
        const user = this.currentUser();
        return !!user && !this.isTokenExpired(user.token);
    }

    hasRole(role: UserRole): boolean {
        const user = this.currentUser();
        return user ? user.role === role : false;
    }

    hasRequiredRole(allowedRoles: number[]): boolean {
        const user = this.currentUser();
        return user ? allowedRoles.includes(user.roleId) : false;
    }

    getToken(): string | null {
        return this.currentUser()?.token || null;
    }

    private isTokenExpired(token: string): boolean {
        try {
            const expiry = (JSON.parse(atob(token.split('.')[1]))).exp;
            return (Math.floor((new Date).getTime() / 1000)) >= expiry;
        } catch (e) {
            return true;
        }
    }
}
