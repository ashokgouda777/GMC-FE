import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

import { HeaderComponent } from '../header/header.component';
import { FooterComponent } from '../footer/footer.component';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="layout-container">
      <div class="main-area">
        <app-header></app-header>
        <div class="content">
          <router-outlet></router-outlet>
        </div>
        <app-footer></app-footer>
      </div>
    </div>
  `,
  styles: [`
    @import '../../../styles/variables';

    .layout-container {
      display: block;
      min-height: 100vh;
      background: $bg-color;
      overflow-x: hidden;

      .main-area {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        padding-top: 130px; // Offset for double header (60px + 50px + spacing)

        .content {
          flex: 1;
          padding: 0 $spacing-md;
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
        }
      }
    }
  `]
})
export class MainLayoutComponent { }
