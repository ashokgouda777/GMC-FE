import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

export interface SidebarItem {
  label: string;
  route?: string; // For routerLink
  queryParams?: any; // For routerLink queryParams
  action?: string; // For click handling (if no route)
  icon?: string;
  active?: boolean; // Manual active state
  section?: string; // For grouping or specialized highlighting
}

@Component({
  selector: 'app-shared-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <aside class="standard-sidebar">
      <h3 *ngIf="title">{{ title }}</h3>
      <nav>
        <ng-container *ngFor="let item of items">
          
          <!-- Router Link Item -->
          <a *ngIf="item.route" 
             [routerLink]="item.route" 
             [queryParams]="item.queryParams"
             [routerLinkActive]="item.active === undefined ? 'active' : ''"
             [routerLinkActiveOptions]="{exact: false}"
             [class.active]="item.active"
             class="sidebar-item">
            <span *ngIf="item.icon" class="sidebar-icon" [ngClass]="item.icon.includes(' ') ? item.icon : ''">
                {{ item.icon.includes(' ') ? '' : item.icon }}
            </span>
            {{ item.label }}
          </a>

          <!-- Action Item (Click) -->
          <a *ngIf="!item.route" 
             (click)="onItemClick(item)"
             [class.active]="item.active"
             class="sidebar-item">
            <span *ngIf="item.icon" class="sidebar-icon" [ngClass]="item.icon.includes(' ') ? item.icon : ''">
                {{ item.icon.includes(' ') ? '' : item.icon }}
            </span>
            {{ item.label }}
          </a>

        </ng-container>
      </nav>
    </aside>
  `,
  styles: [`
    @import 'sidebar-layout';

    .sidebar-item {
        cursor: pointer;
    }
  `]
})
export class SharedSidebarComponent {
  @Input() title: string = '';
  @Input() items: SidebarItem[] = [];
  @Output() itemClick = new EventEmitter<SidebarItem>();

  onItemClick(item: SidebarItem) {
    this.itemClick.emit(item);
  }
}
