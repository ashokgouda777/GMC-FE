import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { SharedSidebarComponent, SidebarItem } from '../../../../shared/components/shared-sidebar/shared-sidebar.component';

@Component({
    selector: 'app-accounting',
    standalone: true,
    imports: [CommonModule, RouterOutlet, SharedSidebarComponent],
    template: `
    <div class="page-layout">
        <app-shared-sidebar 
            title="Accounting" 
            [items]="sidebarItems">
        </app-shared-sidebar>

      <main class="content-area">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
    styles: [`
    @import 'sidebar-layout';
  `]
})
export class AccountingComponent {
    sidebarItems: SidebarItem[] = [
        { label: 'Cash Book', route: 'cash-book' },
        { label: 'Ledger Report', route: 'ledger-report' },
        { label: 'Daybook Report', route: 'daybook-report' }
    ];
}
