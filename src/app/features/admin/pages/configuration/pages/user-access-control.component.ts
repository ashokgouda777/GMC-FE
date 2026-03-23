import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-user-access-control',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page-container">
      <div class="header-section">
        <h2>Role Based Access Control</h2>
        <p class="subtitle">Manage permissions for different user roles</p>
      </div>

      <div class="control-panel">
        <label>Select Role to Configure:</label>
        <select [(ngModel)]="selectedRole" (change)="onRoleChange()">
            <option [ngValue]="null" disabled>-- Select a Role --</option>
            <option *ngFor="let role of roles" [ngValue]="role">{{ role.role_desc }}</option>
        </select>
      </div>

      <div class="permissions-card" *ngIf="selectedRole">
        <div class="card-header">
            <h3>Permissions for {{ selectedRole.role_desc }}</h3>
            <button class="btn-save" (click)="savePermissions()">Save Changes</button>
        </div>

        <table class="permissions-table">
            <thead>
                <tr>
                    <th>Module Name</th>
                    <th class="text-center">Read</th>
                    <th class="text-center">Write</th>
                    <th class="text-center">Delete</th>
                    <th class="text-center">Select All</th>
                </tr>
            </thead>
            <tbody>
                <tr *ngFor="let module of modules">
                    <td class="module-name">{{ module.name }}</td>
                    <td class="text-center">
                        <input type="checkbox" [(ngModel)]="permissions[module.id].read">
                    </td>
                    <td class="text-center">
                        <input type="checkbox" [(ngModel)]="permissions[module.id].write">
                    </td>
                    <td class="text-center">
                        <input type="checkbox" [(ngModel)]="permissions[module.id].delete">
                    </td>
                    <td class="text-center">
                        <input type="checkbox" (change)="toggleAll(module.id, $event)">
                    </td>
                </tr>
            </tbody>
        </table>
      </div>

      <div class="empty-state" *ngIf="!selectedRole">
        <p>Please select a role above to view and edit permissions.</p>
      </div>
    </div>
  `,
  styles: [`
    @import 'variables';

    .page-container {
      padding: 0;
    }

    .header-section {
        margin-bottom: $spacing-md;
        h2 { margin: 0; color: $text-color; font-size: 1.5rem; }
        .subtitle { color: $text-secondary; font-size: 0.9rem; margin-top: 5px; }
    }

    .control-panel {
        background: $white;
        padding: $spacing-md;
        border-radius: 8px;
        box-shadow: $shadow-sm;
        margin-bottom: $spacing-md;
        display: flex;
        align-items: center;
        gap: $spacing-md;

        label { font-weight: 500; color: $text-color; }
        select {
            padding: 8px 12px;
            border: 1px solid $border-color;
            border-radius: 6px;
            min-width: 250px;
            font-size: 1rem;
            color: $text-color;
            &:focus { outline: none; border-color: $primary-color; }
        }
    }

    .permissions-card {
        background: $white;
        border-radius: 8px;
        box-shadow: $shadow-sm;
        overflow: hidden;

        .card-header {
            padding: $spacing-md;
            border-bottom: 1px solid $border-color;
            display: flex;
            justify-content: space-between;
            align-items: center;

            h3 { margin: 0; color: $primary-color; font-size: 1.1rem; }
            
            .btn-save {
                background: $primary-color;
                color: $white;
                border: none;
                padding: 8px 20px;
                border-radius: 6px;
                cursor: pointer;
                font-weight: 500;
                &:hover { background: $primary-dark; }
            }
        }

        .permissions-table {
            width: 100%;
            border-collapse: collapse;

            th, td {
                padding: 15px;
                border-bottom: 1px solid $bg-color;
            }

            th {
                text-align: left;
                background: rgba($primary-color, 0.03);
                color: $text-secondary;
                font-weight: 600;
                font-size: 0.9rem;
                &.text-center { text-align: center; }
            }

            td {
                color: $text-color;
                &.text-center { text-align: center; }
                &.module-name { font-weight: 500; }
                
                input[type="checkbox"] {
                    width: 18px;
                    height: 18px;
                    cursor: pointer;
                    accent-color: $primary-color;
                }
            }
            
            tr:last-child td { border-bottom: none; }
            tr:hover { background: rgba(0,0,0,0.01); }
        }
    }

    .empty-state {
        text-align: center;
        padding: 40px;
        color: $text-secondary;
        background: rgba($primary-color, 0.02);
        border-radius: 8px;
        border: 1px dashed $border-color;
    }
  `]
})
export class UserAccessControlComponent implements OnInit {
  private adminService = inject(AdminService);

  roles: any[] = [];
  selectedRole: any = null;

  modules = [
    { id: 'dashboard', name: 'Dashboard' },
    { id: 'user_management', name: 'User Management' },
    { id: 'configuration', name: 'System Configuration' },
    { id: 'reports', name: 'Reports & Analytics' },
    { id: 'audit_logs', name: 'Audit Logs' }
  ];

  // Initialize permissions structure
  permissions: any = {};

  constructor() {
    this.modules.forEach(m => {
      this.permissions[m.id] = { read: false, write: false, delete: false };
    });
  }

  ngOnInit() {
    this.loadRoles();
  }

  loadRoles() {
    this.adminService.getRoles().subscribe({
      next: (data: any) => {
        this.roles = Array.isArray(data) ? data : [];
      },
      error: (err) => {
        console.error('Error loading roles', err);
        // Fallback mock
        this.roles = [
          { role_id: 1, role_desc: 'Admin' },
          { role_id: 2, role_desc: 'Case Worker' },
          { role_id: 3, role_desc: 'Data Entry Operator' }
        ];
      }
    });
  }

  onRoleChange() {
    console.log('Selected Role:', this.selectedRole);
    // Here we would ideally fetch existing permissions for this role from an API
    // For now, we simulate different states or just reset
    this.resetPermissions();

    // Simulate loading saved permissions
    if (this.selectedRole.role_desc === 'Admin') {
      this.setAllPermissions(true);
    }
  }

  resetPermissions() {
    Object.keys(this.permissions).forEach(key => {
      this.permissions[key] = { read: false, write: false, delete: false };
    });
  }

  setAllPermissions(value: boolean) {
    Object.keys(this.permissions).forEach(key => {
      this.permissions[key] = { read: value, write: value, delete: value };
    });
  }

  toggleAll(moduleId: string, event: any) {
    const isChecked = event.target.checked;
    this.permissions[moduleId].read = isChecked;
    this.permissions[moduleId].write = isChecked;
    this.permissions[moduleId].delete = isChecked;
  }

  savePermissions() {
    if (!this.selectedRole) return;

    const payload = {
      roleId: this.selectedRole.role_id,
      permissions: this.permissions
    };

    console.log('Saving Permissions:', payload);
    alert(`Permissions saved successfully for role: ${this.selectedRole.role_desc}`);
    // this.adminService.savePermissions(payload).subscribe(...)
  }
}
