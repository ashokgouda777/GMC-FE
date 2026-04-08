import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReceiptsComponent } from './components/receipts/receipts.component';

@Component({
  selector: 'app-cash-book',
  standalone: true,
  imports: [CommonModule, ReceiptsComponent],
  template: `
    <div class="cash-book-container">
      <app-receipts></app-receipts>
    </div>
  `,
  styles: [`
    .cash-book-container {
      display: flex;
      flex-direction: column;
      gap: 16px;
      height: 100%;
      color: var(--text-color, #1e293b);
      font-family: 'Poppins', 'Inter', sans-serif;
    }

    .tabs-header {
      display: flex;
      background: var(--card-bg, #ffffff);
      border-radius: 8px;
      width: fit-content;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1);
      border: 1px solid var(--sidebar-active-color, #e2e8f0);
      padding: 4px;
      gap: 4px;
    }

    .tab-btn {
      padding: 6px 16px;
      border: none;
      background: transparent;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 500;
      color: var(--text-color, #64748b);
      transition: all 0.2s ease;
      font-size: 0.85rem;
      white-space: nowrap;

      &:hover:not(.active) {
        background: rgba(var(--primary-color-rgb, 107, 70, 193), 0.05);
        color: var(--primary-color, #6b46c1);
      }

      &.active {
        background: var(--primary-color, #6b46c1);
        color: white;
        box-shadow: 0 2px 4px rgba(var(--primary-color-rgb, 107, 70, 193), 0.2);
      }
    }

    .tab-content {
      flex: 1;
      min-height: 0;
      animation: fadeIn 0.3s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .placeholder-content {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 400px;
      background: var(--card-bg, #ffffff);
      border-radius: 8px;
      border: 1px solid var(--sidebar-active-color, #e2e8f0);
      box-shadow: 0 1px 3px rgba(0,0,0,0.05);
    }

    .empty-state {
      text-align: center;
      color: #94a3b8;

      i {
        font-size: 2.5rem;
        margin-bottom: 16px;
        color: var(--primary-color, #cbd5e1);
        opacity: 0.8;
      }

      h3 {
        color: var(--text-color, #334155);
        margin-bottom: 8px;
        font-size: 1.1rem;
        font-weight: 600;
      }

      p {
        font-size: 0.85rem;
        max-width: 320px;
        margin: 0 auto;
      }
    }
  `]
})
export class CashBookComponent {
}
