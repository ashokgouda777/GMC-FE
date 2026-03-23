import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <aside class="sidebar">
      <div class="logo">
        <h2>GMC <span class="accent">Portal</span></h2>
      </div>
      <nav>
        <ul>
          <p class="menu-label">MENU</p>
          <ng-container *ngIf="auth.hasRole('admin')">
            <li><a routerLink="/admin/dashboard" routerLinkActive="active">
              <span class="icon">▀</span> Dashboard
            </a></li>
            <li><a routerLink="/admin/users" routerLinkActive="active">
              <span class="icon">●</span> Users Management
            </a></li>
            <li><a routerLink="/admin/profile" routerLinkActive="active">
              <span class="icon">👤</span> Admin Profile
            </a></li>
          </ng-container>
          
          <ng-container *ngIf="auth.hasRole('user')">
            <li><a routerLink="/user/dashboard" routerLinkActive="active">
              <span class="icon">▀</span> Dashboard
            </a></li>
            <li><a routerLink="/user/profile" routerLinkActive="active">
              <span class="icon">●</span> My Profile
            </a></li>
          </ng-container>
        </ul>
      </nav>
      

    </aside>
  `,
  styles: [`
    @import '../../../styles/variables';
    @import '../../../styles/mixins';
    
    .sidebar {
      width: $sidebar-width;
      height: 100%;
      background: $white;
      display: flex;
      flex-direction: column;
      padding: $spacing-md;

      .logo {
        height: $header-height;
        display: flex;
        align-items: center;
        padding-bottom: $spacing-md;
        margin-bottom: $spacing-md;
        border-bottom: 1px solid rgba(0,0,0,0.05);
        
        h2 {
          margin: 0;
          color: $text-color;
          font-size: 1.5rem;
          font-weight: 700;
          letter-spacing: -0.5px;
          
          .accent {
            color: $primary-color;
          }
        }
      }

      nav {
        flex: 1;
        
        .menu-label {
            font-size: 0.75rem;
            color: $text-secondary;
            font-weight: 600;
            margin-bottom: $spacing-sm;
            padding-left: $spacing-sm;
        }
        
        ul {
          li {
            margin-bottom: $spacing-xs;
            
            a {
              display: flex;
              align-items: center;
              padding: $spacing-sm;
              color: $text-secondary;
              transition: all 0.3s;
              border-radius: 12px;
              font-weight: 500;
              
              .icon {
                margin-right: $spacing-sm;
                font-size: 0.8rem;
              }

              &:hover {
                background: rgba($primary-color, 0.05);
                color: $primary-color;
                transform: translateX(4px);
              }

              &.active {
                background: $primary-color;
                color: $white;
                box-shadow: 0 10px 20px rgba($primary-color, 0.2);
                
                .icon {
                    color: $white;
                }
              }
            }
          }
        }
      }
      
      .sidebar-footer {
          margin-top: auto;
          
          .card-upgrade {
              background: linear-gradient(135deg, $secondary-color, color-mix(in srgb, $secondary-color, black 15%));
              border-radius: 20px;
              padding: $spacing-md;
              color: white;
              text-align: center;
              position: relative;
              overflow: hidden;
              
              &::after {
                  content: '';
                  position: absolute;
                  top: -20px;
                  right: -20px;
                  width: 80px;
                  height: 80px;
                  background: rgba(255,255,255,0.2);
                  border-radius: 50%;
              }

              p { margin: 0; font-weight: bold; }
              small { opacity: 0.8; font-size: 0.8rem; }
          }
      }
    }
  `]
})
export class SidebarComponent {
  auth = inject(AuthService);
}
