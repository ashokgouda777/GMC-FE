import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminSidebarComponent } from '../admin-sidebar/admin-sidebar.component';

@Component({
    selector: 'app-admin-layout',
    standalone: true,
    imports: [CommonModule, RouterModule, AdminSidebarComponent],
    template: `
    <div class="admin-layout">
        <app-admin-sidebar></app-admin-sidebar>
        <main class="main-content">
            <router-outlet></router-outlet>
        </main>
    </div>
  `,
    styles: [`
    .admin-layout {
        display: flex;
        height: 100vh;
        width: 100vw;
        background-color: #f5f7fb; 
        gap: 20px; 
    }

    .main-content {
        flex: 1;
        overflow-y: auto;
        padding: 20px 20px 20px 0; // Top/Bottom/Right padding, left is handled by gap
        position: relative;
        height: 100%;
        display: flex;
        flex-direction: column;
    }
  `]
})
export class AdminLayoutComponent { }
