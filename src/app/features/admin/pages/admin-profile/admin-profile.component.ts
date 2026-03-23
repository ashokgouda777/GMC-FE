import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admin-profile',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="page-container">
      <h1>Admin Profile</h1>
      <div class="profile-card">
        <div class="avatar">
          <span>A</span>
        </div>
        <div class="info">
          <h3>Admin User</h3>
          <p>admin@gmcportal.com</p>
          <span class="role">Administrator</span>
        </div>
      </div>
    </div>
  `,
    styles: [`
    @import '../../../../../styles/variables';
    @import '../../../../../styles/mixins';

    .page-container {
      padding: $spacing-lg;
    }
    
    .profile-card {
        @include card-base;
        padding: $spacing-xl;
        display: flex;
        align-items: center;
        gap: $spacing-xl;
        max-width: 600px;
        
        .avatar {
            width: 100px;
            height: 100px;
            border-radius: 50%;
            background: $primary-color;
            color: $white;
            @include flex-center;
            font-size: 2.5rem;
            font-weight: bold;
        }
        
        .info {
            h3 { margin: 0 0 $spacing-xs 0; font-size: 1.5rem; }
            p { margin: 0 0 $spacing-md 0; color: $text-secondary; }
            .role {
                display: inline-block;
                padding: 4px 12px;
                background: rgba($primary-color, 0.1);
                color: $primary-color;
                border-radius: 20px;
                font-size: 0.85rem;
                font-weight: 500;
            }
        }
    }
  `]
})
export class AdminProfileComponent { }
