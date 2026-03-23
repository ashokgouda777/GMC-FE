import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <p>&copy; 2024 GMC Portal. All rights reserved.</p>
    </footer>
  `,
  styles: [`
    @import '../../../styles/variables';
    @import '../../../styles/mixins';

    .footer {
      height: 40px;
      background: $white;
      border-top: 1px solid #ddd;
      @include flex-center;
      font-size: 0.8rem;
      color: #777;
    }
  `]
})
export class FooterComponent { }
