import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registration-type',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class='config-page'>
      <h2>Registration Type</h2>
      <div class='placeholder-content'>
        <p>Registration Type content will go here.</p>
      </div>
    </div>
  `,
  styles: [`
    .config-page {
      padding: 0;
      h2 { color: #333; margin-bottom: 20px; font-size: 1.5rem; }
      .placeholder-content {
        padding: 40px;
        background: #f8f9fa;
        border: 1px dashed #ccc;
        border-radius: 8px;
        text-align: center;
        color: #666;
      }
    }
  `]
})
export class RegistrationTypeComponent {}
