import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-reports',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="page-container">
      <h1>Reports</h1>
      <p>View application reports and statistics.</p>
    </div>
  `,
    styles: [`
    .page-container {
      padding: 20px;
    }
    h1 {
      margin-bottom: 20px;
      color: #333;
    }
  `]
})
export class ReportsComponent { }
