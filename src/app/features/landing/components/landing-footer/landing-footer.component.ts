import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-landing-footer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <footer class="landing-footer">
      <div class="footer-content">
        <div class="footer-section">
            <h3>GMC Portal</h3>
            <p>Empowering communities through digital connections.</p>
        </div>
        <div class="footer-section">
            <h4>Links</h4>
            <a href="#">About</a>
            <a href="#">Members</a>
            <a href="#">Contact</a>
        </div>
        <div class="footer-section">
            <h4>Contact</h4>
            <p>Email: info@gmcportal.com</p>
            <p>Phone: +1 234 567 890</p>
        </div>
      </div>
      <div class="footer-bottom">
        <p>&copy; 2024 GMC Portal. All rights reserved.</p>
      </div>
    </footer>
  `,
  styles: [`
    @import '../../../../../styles/variables';

    .landing-footer {
        background: $text-color; // Dark bg
        color: $white;
        padding: $spacing-xl 0 $spacing-md;
        margin-top: auto; 

        .footer-content {
            max-width: 1200px;
            margin: 0 auto;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: $spacing-xl;
            padding: 0 $spacing-lg;

            .footer-section {
                h3 { color: $primary-color; margin-bottom: $spacing-md; }
                h4 { color: $white; margin-bottom: $spacing-md; text-transform: uppercase; font-size: 0.9rem; letter-spacing: 1px; }
                p { color: #aaa; margin-bottom: $spacing-xs; font-size: 0.9rem; }
                
                a {
                    display: block;
                    color: #aaa;
                    text-decoration: none;
                    margin-bottom: $spacing-xs;
                    font-size: 0.9rem;
                    transition: color 0.3s;
                    
                    &:hover { color: $primary-color; }
                }
            }
        }

        .footer-bottom {
            text-align: center;
            margin-top: $spacing-xl;
            padding-top: $spacing-md;
            border-top: 1px solid rgba(255,255,255,0.1);
            color: #666;
            font-size: 0.8rem;
        }
    }
  `]
})
export class LandingFooterComponent { }
