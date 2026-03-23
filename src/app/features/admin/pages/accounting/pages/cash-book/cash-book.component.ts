import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceiptsComponent } from './components/receipts/receipts.component';

@Component({
  selector: 'app-cash-book',
  standalone: true,
  imports: [CommonModule, ReceiptsComponent],
  template: `
    <div class="cash-book-container">
      <div class="tabs-header">
        <button 
          *ngFor="let tab of tabs" 
          [class.active]="activeTab === tab"
          (click)="activeTab = tab"
          class="tab-btn">
          {{ tab }}
        </button>
      </div>

      <div class="tab-content">
        <app-receipts *ngIf="activeTab === 'Receipts'"></app-receipts>
        <div *ngIf="activeTab !== 'Receipts'" class="placeholder-content">
          <div class="empty-state">
            <i class="fas fa-layer-group"></i>
            <h3>{{ activeTab }} Module</h3>
            <p>The {{ activeTab }} functionality is currently being processed.</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .cash-book-container {
      display: flex;
      flex-direction: column;
      gap: 24px;
      height: 100%;
    }

    .tabs-header {
      display: flex;
      gap: 12px;
      padding: 4px;
      background: #f8f9fa;
      border-radius: 12px;
      width: fit-content;
      box-shadow: inset 0 2px 4px rgba(0,0,0,0.05);
    }

    .tab-btn {
      padding: 10px 24px;
      border: none;
      background: transparent;
      border-radius: 8px;
      cursor: pointer;
      font-weight: 600;
      color: #6c757d;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 0.95rem;

      &:hover {
        color: #495057;
        background: rgba(0,0,0,0.02);
      }

      &.active {
        background: white;
        color: #6b46c1;
        box-shadow: 0 4px 12px rgba(107, 70, 193, 0.15);
      }
    }

    .tab-content {
      flex: 1;
      min-height: 0;
    }

    .placeholder-content {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 400px;
      background: #fdfdfd;
      border-radius: 16px;
      border: 2px dashed #e9ecef;
    }

    .empty-state {
      text-align: center;
      color: #adb5bd;

      i {
        font-size: 3rem;
        margin-bottom: 16px;
        opacity: 0.5;
      }

      h3 {
        color: #495057;
        margin-bottom: 8px;
      }
    }
  `]
})
export class CashBookComponent {
  tabs = ['Receipts', 'Payments', 'Contra Entry', 'Cancel Receipts'];
  activeTab = 'Receipts';
}
