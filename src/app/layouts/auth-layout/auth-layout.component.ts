import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SharedHeaderComponent } from '../../shared/components/shared-header/shared-header.component';
import { SharedFooterComponent } from '../../shared/components/shared-footer/shared-footer.component';

@Component({
    selector: 'app-auth-layout',
    standalone: true,
    imports: [RouterOutlet, SharedHeaderComponent, SharedFooterComponent],
    template: `
    <div class="layout-container">
      
      <app-shared-header></app-shared-header>

      <!-- Main Content Area -->
      <main class="auth-content">
        <div class="background-shape shape-1"></div>
        <div class="background-shape shape-2"></div>
        
        <div class="auth-card glass">
            <!-- Router Outlet for Login Forms -->
            <router-outlet></router-outlet>
        </div>
      </main>

      <app-shared-footer></app-shared-footer>

    </div>
  `,
    styles: [`
    @import '../../../styles/variables';
    @import '../../../styles/mixins';

    .layout-container {
      min-height: 100vh;
      width: 100vw;
      background: $bg-color;
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }

    // --- Main Content Styles ---
    .auth-content {
        flex: 1;
        position: relative;
        @include flex-center;
        padding: $spacing-md;

        .background-shape {
            position: absolute;
            border-radius: 50%;
            filter: blur(80px);
            z-index: 0;
            pointer-events: none;
        }

        .shape-1 {
            width: 400px;
            height: 400px;
            background: rgba($primary-color, 0.4);
            top: 10%;
            left: 10%;
        }

        .shape-2 {
            width: 300px;
            height: 300px;
            background: rgba($secondary-color, 0.4);
            bottom: 10%;
            right: 10%;
        }

        .auth-card {
            @include glass-effect;
            padding: 40px; // Increased padding for professional look
            border-radius: 24px;
            width: 100%;
            max-width: 480px;
            z-index: 10;
            box-shadow: $glass-shadow;
            background: rgba(255, 255, 255, 0.85); // Slightly more opaque for readability
        }
    }
  `]
})
export class AuthLayoutComponent { }
