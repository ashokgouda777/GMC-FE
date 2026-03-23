import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-admins',
    standalone: true,
    imports: [CommonModule],
    template: `
        <div class="page-layout">
            <div class="header-section">
                <h1>Admin Management</h1>
            </div>
            <div class="table-container">
                <div class="empty-state">
                    <p>Admin management content coming soon...</p>
                </div>
            </div>
        </div>
    `,
    styles: [`
        .empty-state {
            text-align: center;
            padding: 40px;
            color: #666;
            font-style: italic;
        }
    `]
})
export class AdminsComponent { }
