import { Component } from '@angular/core';

@Component({
    selector: 'app-shared-footer',
    standalone: true,
    template: `
    <footer class="app-footer">
      <div class="footer-content">
        <p>&copy; 2024 GMC Portal. All rights reserved.</p>
        <div class="footer-links">
            <a href="#">Privacy Policy</a>
            <a href="#">Terms of Service</a>
            <a href="#">Support</a>
        </div>
      </div>
    </footer>
  `,
    styles: [`
    @import '../../../../styles/variables';
    @import '../../../../styles/mixins';

    .app-footer {
        height: 60px;
        background: $white;
        border-top: 1px solid rgba(0,0,0,0.05);
        display: flex;
        justify-content: center;
        align-items: center;
        z-index: 20;
        width: 100%;

        .footer-content {
            width: 100%;
            max-width: 1200px;
            padding: 0 40px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            color: $text-secondary;
            font-size: 0.85rem;

            .footer-links {
                display: flex;
                gap: 24px;

                a {
                    text-decoration: none;
                    color: $text-secondary;
                    transition: color 0.2s;

                    &:hover {
                        color: $primary-color;
                    }
                }
            }
        }
    }

    @media (max-width: 768px) {
        .footer-content {
            flex-direction: column;
            gap: 10px;
            padding: 10px !important;
        }
    }
  `]
})
export class SharedFooterComponent { }
