import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-header',
    standalone: true,
    imports: [CommonModule, RouterLink, RouterLinkActive],
    template: `
    <header class="header">
        <div class="top-bar">
            <div class="brand">
                <h2>GMC <span class="accent">Portal</span></h2>
            </div>

            <!-- Dashboard Link in Top Bar -->
            <a *ngIf="auth.hasRole('admin')" routerLink="/admin/dashboard" routerLinkActive="active" [routerLinkActiveOptions]="{exact: true}" class="dashboard-link">
                Dashboard
            </a>
            
            <div class="spacer"></div>

            <div class="user-info">
                <div class="login-time">
                    <span>Login:</span>
                    <strong>{{ loginTime | date:'shortTime' }}</strong>
                </div>
                
                <div class="user-profile" *ngIf="currentUser()">
                    <div class="avatar">{{ currentUser()?.username?.charAt(0)?.toUpperCase() }}</div>
                    <span class="name">{{ currentUser()?.username }}</span>
                </div>
                
                <button class="btn-logout" (click)="logout()">Logout ➡</button>
            </div>
        </div>

        <nav class="nav-bar" *ngIf="auth.hasRole('admin')">
            <a *ngIf="auth.hasRequiredRole([1, 2])" routerLink="/admin/configuration" routerLinkActive="active">Configuration</a>
            <span class="divider"></span>
            
            <a routerLink="/admin/users" routerLinkActive="active">Practitioner</a>
            <span class="divider"></span>
            
            <a routerLink="/admin/accounting" routerLinkActive="active">Accounting</a>
            <span class="divider"></span>
            
            <a routerLink="/admin/reports" routerLinkActive="active">Reports</a>
        </nav>
    </header>
  `,
    styles: [`
    @import '../../../styles/variables';
    @import '../../../styles/mixins';

    .header {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      display: flex;
      flex-direction: column;
      box-shadow: 0 4px 20px rgba(0,0,0,0.05);

      .top-bar {
          background: var(--topbar-bg, #ffffff);
          height: 60px;
          display: flex;
          align-items: center;
          padding: 0 $spacing-lg;
          gap: $spacing-xl;
          
          .brand {
              h2 { 
                  margin: 0; 
                  font-size: 1.5rem; 
                  color: $text-color;
                  .accent { color: $primary-color; } 
              }
          }

          .dashboard-link {
              text-decoration: none;
              color: $primary-color;
              background: none;
              border: 1px solid $primary-color;
              padding: 6px 16px;
              border-radius: 20px;
              font-weight: 600;
              font-size: 0.9rem;
              transition: all 0.2s;
              
              &:hover { 
                  background-color: $primary-color; 
                  color: $white;
              }
              &.active { 
                  background-color: rgba($primary-color, 0.1); 
                  box-shadow: none;
              }
          }
          
          .spacer { flex: 1; }
          
          .user-info {
              display: flex;
              align-items: center;
              gap: $spacing-lg;
              color: $text-color;
              
              .login-time {
                  font-size: 0.85rem;
                  color: $text-secondary;
                  strong { color: $text-color; margin-left: 5px; }
              }
              
              .user-profile {
                  display: flex;
                  align-items: center;
                  gap: 10px;
                  
                  .avatar { 
                      width: 32px; 
                      height: 32px; 
                      background: $primary-color; 
                      color: $white; 
                      border-radius: 50%; 
                      display: flex; 
                      align-items: center; 
                      justify-content: center; 
                      font-weight: bold; 
                  }
                  .name { font-weight: 600; }
              }
              
              .btn-logout {
                  background: none;
                  border: 1px solid $primary-color;
                  color: $primary-color;
                  padding: 6px 16px;
                  border-radius: 20px;
                  cursor: pointer;
                  font-size: 0.85rem;
                  transition: all 0.2s;
                  &:hover { background: $primary-color; color: $white; }
              }
          }
      }

      .nav-bar {
         height: 40px; /* Slimmer nav bar */
         display: flex;
         align-items: center;
         gap: 5px;
         /* Modern Gradient Background (Pink Theme) or Dynamic */
         background: var(--navbar-bg, linear-gradient(90deg, #0077B6 0%, #0096C7 100%)); 
         padding: 0 $spacing-lg;
         
         a {
             text-decoration: none;
             color: var(--navbar-text, #ffffff); /* Highlighted Text */
             font-weight: 600; /* Bold for prominence */
             padding: 6px 16px; /* Larger hit area */
             font-size: 0.9rem;
             white-space: nowrap;
             border-radius: 20px; /* Pill shape for buttons */
             transition: all 0.2s ease;
             
             &:hover { 
                 background: rgba(255,255,255,0.2); 
                 text-decoration: none; 
                 color: var(--navbar-text, #ffffff);
                 transform: translateY(-1px);
             }
             
             &.active { 
                 background: $white; /* Perfect Template Highlight */
                 color: $primary-color; /* Text becomes Primary Pink */
                 font-weight: 700;
                 box-shadow: 0 4px 6px rgba(0,0,0,0.1);
             }
             
             &.disabled { 
                 opacity: 0.7; 
                 cursor: not-allowed; 
                 &:hover { background: none; transform: none; }
             }
         }

         .divider {
             width: 1px;
             height: 16px;
             background: rgba(255, 255, 255, 0.4);
             margin: 0 5px;
         }
      }
    }
  `]
})
export class HeaderComponent {
    auth = inject(AuthService);
    currentUser = this.auth.currentUser;

    loginTime = new Date();

    logout() {
        if (confirm('Logout?')) {
            this.auth.logout();
        }
    }

    toggleDropdown() {
        // Decomissioned in favor of direct logout
    }
}
