import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-shared-header',
  standalone: true,
  imports: [RouterLink],
  template: `
    <header class="app-header">
      <div class="brand">
        <span class="logo-icon">🔷</span>
        <span class="brand-name">GMC Portal</span>
      </div>
      
      <nav class="app-nav">
        <a routerLink="/" class="nav-link">Home</a>
        <a href="#about" class="nav-link">About Us</a>
        <a href="#members" class="nav-link">Members</a>
        <a href="#contact" class="nav-link">Contact Us</a>
        <a routerLink="/auth/admin-login" class="nav-link">Admin Login</a>
      </nav>
    </header>
  `,
  styles: [`
    @import '../../../../styles/variables';
    @import '../../../../styles/mixins';

    .app-header {
        height: 70px;
        background: $white;
        padding: 0 40px; // Fixed padding for consistency
        display: flex; // Ensure flex
        align-items: center; // Vertical center
        box-shadow: 0 4px 20px rgba(0,0,0,0.05);
        position: fixed;
        top: 0;
        z-index: 1000;
        width: 100%;
        box-sizing: border-box;

        .brand {
            display: flex;
            align-items: center;
            gap: 10px;

            .logo-icon {
                font-size: 1.5rem;
            }

            .brand-name {
                font-size: 1.25rem;
                font-weight: 700;
                color: $primary-color;
                letter-spacing: -0.5px;
            }
        }

        .app-nav {
            margin-left: auto; // Push to right
            display: flex;
            gap: $spacing-md;

            .nav-link {
                text-decoration: none;
                color: $text-secondary;
                font-weight: 500;
                font-size: 0.95rem;
                transition: all 0.2s ease;
                padding: 6px 12px;
                border-radius: 8px;
                cursor: pointer;

                &:hover {
                    color: $primary-color;
                    background: rgba($primary-color, 0.05);
                }
            }
        }
    }

    @media (max-width: 768px) {
        .app-header { 
            padding: 0 20px;
            .app-nav { display: none; }
        }
    }
  `]
})
export class SharedHeaderComponent { }
