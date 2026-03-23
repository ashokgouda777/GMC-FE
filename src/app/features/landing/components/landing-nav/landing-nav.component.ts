import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-landing-nav',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="landing-nav">
      <div class="logo">
        <a routerLink="/">GMC Portal</a>
      </div>
      <div class="nav-links">
        <a (click)="scrollTo('about')">About Us</a>
        <a (click)="scrollTo('members')">Members</a>
        <a (click)="scrollTo('contact')">Contact Us</a>
      </div>
      <div class="auth-buttons">
        <a routerLink="/auth/login" class="btn-login">User Login</a>
        <a routerLink="/auth/admin-login" class="btn-admin">Admin Login</a>
      </div>
    </nav>
  `,
  styles: [`
    @import '../../../../../styles/variables';
    @import '../../../../../styles/mixins';

    .landing-nav {
      @include flex-between;
      padding: $spacing-md $spacing-xl;
      background: rgba($white, 0.9);
      backdrop-filter: blur(10px);
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      z-index: 1000;
      box-shadow: $shadow-sm;
      height: 70px;

      .logo {
        font-size: 1.5rem;
        font-weight: 800;
        
        a {
          color: $primary-color;
          text-decoration: none;
        }
      }

      .nav-links {
        display: flex;
        gap: $spacing-lg;

        a {
            color: $text-color;
            text-decoration: none;
            font-weight: 500;
            cursor: pointer;
            transition: color 0.3s;

            &:hover {
                color: $primary-color;
            }
        }
      }

      .auth-buttons {
        display: flex;
        gap: $spacing-sm;

        a {
          text-decoration: none;
          padding: $spacing-xs $spacing-md;
          border-radius: 20px;
          font-weight: 500;
          transition: all 0.3s;
          font-size: 0.9rem;
        }

        .btn-login {
          color: $primary-color;
          border: 1px solid $primary-color;
          background: transparent;

          &:hover {
            background: color-mix(in srgb, var(--primary-color) 10%, transparent);
          }
        }

        .btn-admin {
          color: $white;
          background: $secondary-color;
          
          &:hover {
            filter: brightness(0.9);
            transform: translateY(-2px);
            box-shadow: $shadow-sm;
          }
        }
      }
    }
  `]
})
export class LandingNavComponent {
  constructor(private router: Router) { }

  scrollTo(sectionId: string) {
    // If not on home page, navigate home first (simplified logic)
    // For now assuming SPA landing behavior
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }
}
