import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-nationality-master',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class='config-page'>
      <h2>Nationality Master</h2>
      <div class='placeholder-content'>
        <p>Nationality Master content will go here.</p>
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
export class NationalityMasterComponent {}
