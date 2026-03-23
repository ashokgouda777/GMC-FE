import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../../services/admin.service';

@Component({
    selector: 'app-case-workers',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
        <!-- Page Layout matches UsersManagement -->
        <div class="page-layout">
            <!-- No sidebar here as it's handled by parent UserControlComponent via router-outlet -->
            <!-- But wait, UserControlComponent HAS a sidebar. This component is loaded INSIDE the content area of UserControlComponent. 
                 So we don't need .page-layout wrapper if the parent handles it.
                 Let's check UserControlComponent again. 
                 Ah, UserControlComponent uses SharedSidebar and router-outlet. 
                 So this component IS the content. 
                 We should just use the content structure directly. -->
            
            <div class="header-section">
                <h1>Case Workers Management</h1>
                <button *ngIf="!showCreateForm" class="btn-primary" (click)="toggleCreateForm()">
                    + Create Case Worker
                </button>
            </div>

            <!-- List View -->
            <div class="table-container" *ngIf="!showCreateForm">
                <table>
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let worker of caseWorkers">
                            <td>{{ worker.name }}</td>
                            <td>{{ worker.emailId }}</td>
                            <td>{{ worker.roleName }}</td>
                            <td>
                                <span class="status-badge" [class.active]="worker.active">
                                    {{ worker.active ? 'Active' : 'Inactive' }}
                                </span>
                            </td>
                            <td class="action-buttons">
                                <button class="btn-icon edit" title="Edit">
                                    Edit
                                </button>
                            </td>
                        </tr>
                        <tr *ngIf="caseWorkers.length === 0">
                            <td colspan="5" class="empty-state">No case workers found.</td>
                        </tr>
                    </tbody>
                </table>

                <h3 class="mt-4 mb-2">Login History (Demo)</h3>
                <table>
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Login Time</th>
                            <th>IP Address</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr *ngFor="let log of loginHistory">
                            <td>{{ log.username }}</td>
                            <td>{{ log.time }}</td>
                            <td>{{ log.ip }}</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <!-- Create Form View -->
            <div class="form-container" *ngIf="showCreateForm">
                <div class="form-header">
                    <h2>Create New Case Worker</h2>
                    <button class="btn-text" (click)="toggleCreateForm()">Back to List</button>
                </div>

                <form #workerForm="ngForm">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Name <span class="required">*</span></label>
                            <input type="text" [(ngModel)]="newWorker.username" name="username" placeholder="Enter full name" required #name="ngModel">
                            <div class="error" *ngIf="name.invalid && name.touched">Name is required</div>
                        </div>
                        <div class="form-group">
                            <label>Role <span class="required">*</span></label>
                            <select [(ngModel)]="newWorker.role" name="role" required #role="ngModel">
                                <option value="" disabled selected>Select Role</option>
                                <option value="Senior Case Worker">Senior Case Worker</option>
                                <option value="Case Worker">Case Worker</option>
                            </select>
                            <div class="error" *ngIf="role.invalid && role.touched">Role is required</div>
                        </div>
                        <div class="form-group">
                            <label>Email ID <span class="required">*</span></label>
                            <input type="email" [(ngModel)]="newWorker.email" name="email" placeholder="email@example.com" required email #email="ngModel">
                            <div class="error" *ngIf="email.invalid && email.touched">Enter a valid email</div>
                        </div>
                        <div class="form-group">
                            <label>Mobile Number <span class="required">*</span></label>
                            <!-- Pattern for 10 digits -->
                            <input type="text" [(ngModel)]="newWorker.mobile" name="mobile" placeholder="10 digit number" required pattern="^[0-9]{10}$" #mobile="ngModel">
                            <div class="error" *ngIf="mobile.invalid && mobile.touched">
                                <span *ngIf="mobile.errors?.['required']">Mobile number is required</span>
                                <span *ngIf="mobile.errors?.['pattern']">Enter a valid 10-digit mobile number</span>
                            </div>
                        </div>
                        <div class="form-group">
                            <label>Password <span class="required">*</span></label>
                            <input type="password" [(ngModel)]="newWorker.password" name="password" placeholder="Min 6 characters" required minlength="6" #password="ngModel">
                            <div class="error" *ngIf="password.invalid && password.touched">Min 6 chars required</div>
                        </div>
                        <div class="form-group">
                            <label>Active</label>
                            <select [(ngModel)]="newWorker.active" name="active">
                                <option [ngValue]="true">Yes</option>
                                <option [ngValue]="false">No</option>
                            </select>
                        </div>
                    </div>
                    
                    <div class="form-actions">
                        <button type="button" class="btn-cancel" (click)="toggleCreateForm()">Cancel</button>
                        <button type="button" class="btn-submit" (click)="saveWorker(workerForm)" [disabled]="!workerForm.valid">Save Case Worker</button>
                    </div>
                </form>
            </div>
        </div>
    `,
    styles: [`
        // Global styles handled in styles.scss (table-container, form-container, btn-*, etc.)
        // We only need local overrides if absolutely necessary.
        
        .status-badge {
            padding: 4px 10px;
            border-radius: 20px;
            font-size: 0.8rem;
            background: rgba(211, 47, 47, 0.1); // Error color light
            color: #D32F2F;
            
            &.active {
                background: rgba(5, 205, 153, 0.1); // Success color light
                color: #05CD99;
            }
        }

        .mt-4 { margin-top: 24px; }
        .mb-2 { margin-bottom: 8px; }
        
        .empty-state {
            text-align: center; 
            padding: 20px; 
            color: #666;
        }
    `]
})
export class CaseWorkersComponent implements OnInit {
    private adminService = inject(AdminService);
    private cdr = inject(ChangeDetectorRef);
    showCreateForm = false;

    newWorker = {
        username: '',
        role: '',
        email: '',
        mobile: '',
        password: '',
        active: true
    };

    caseWorkers: any[] = [];

    loginHistory = [
        { username: 'cw_sarah', time: '2023-10-27 09:15 AM', ip: '192.168.1.10' },
        { username: 'cw_mike', time: '2023-10-27 10:00 AM', ip: '192.168.1.12' },
        { username: 'cw_sarah', time: '2023-10-26 04:45 PM', ip: '192.168.1.10' },
    ];

    ngOnInit() {
        console.log('CaseWorkersComponent initialized');
        this.loadCaseWorkers();
    }

    loadCaseWorkers() {
        console.log('Loading case workers...');
        this.adminService.getCaseWorkers().subscribe({
            next: (data: any) => {
                console.log('Case workers data received:', data);
                // Handle potential API wrappers (e.g., { result: [...] } or { data: [...] })
                if (data && Array.isArray(data)) {
                    this.caseWorkers = data;
                } else if (data && data.result && Array.isArray(data.result)) {
                    this.caseWorkers = data.result;
                } else if (data && data.data && Array.isArray(data.data)) {
                    this.caseWorkers = data.data;
                } else {
                    console.warn('Unexpected data format:', data);
                    this.caseWorkers = [];
                }
                console.log('Assigned caseWorkers:', this.caseWorkers);
                this.cdr.markForCheck(); // Force check
            },
            error: (err) => {
                console.error('Error fetching case workers:', err);
            }
        });
    }

    toggleCreateForm() {
        this.showCreateForm = !this.showCreateForm;
        if (this.showCreateForm) {
            this.newWorker = { username: '', role: '', email: '', mobile: '', password: '', active: true };
        }
    }

    saveWorker(form: any) {
        if (form.valid) {
            const payload = {
                countryId: 0,
                stateId: 0,
                councilId: 0,
                name: this.newWorker.username,
                mobileNumber: this.newWorker.mobile,
                emailId: this.newWorker.email,
                password: this.newWorker.password,
                roleName: this.newWorker.role,
                roleId: 2,
                createdBy: 'admin'
            };

            this.adminService.createCaseWorker(payload).subscribe({
                next: (res) => {
                    alert('Case Worker created successfully!');
                    this.loadCaseWorkers();
                    this.toggleCreateForm();
                },
                error: (err) => {
                    console.error('Error creating case worker:', err);
                    alert('Failed to create Case Worker. Please try again.');
                }
            });
        }
    }
}
