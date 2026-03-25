import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UniversityListService } from './university-list.service';
import { UniversityList } from './university-list.model';

@Component({
    selector: 'app-university-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
<div class="page-container">
    <!-- List View -->
    <div *ngIf="!showEditView">
        <div class="header-actions">
            <h2>University List</h2>
            <div class="actions">
                <input type="text" placeholder="Search Universities..." (input)="onSearch($event)" class="search-box">
                <button class="btn-primary" (click)="openAddView()">+ Add New University</button>
            </div>
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>University Name</th>
                        <th>Code</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let university of filteredUniversities">
                        <td>{{ university.universityName }}</td>
                        <td>{{ university.universityCode }}</td>
                        <td>
                            <span class="status-badge" [class.active]="university.activeStatus === 'Active'">
                                {{ university.activeStatus }}
                            </span>
                        </td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-primary" (click)="openEditView(university)" title="Edit">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                            </div>
                        </td>


                    </tr>
                    <tr *ngIf="filteredUniversities.length === 0">
                        <td colspan="4" class="no-data">No universities found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Add/Edit Page View -->
    <div class="edit-page-view" *ngIf="showEditView">
        <div class="header-actions">
            <h2>{{ isEditing ? 'Edit University' : 'Add New University' }}</h2>
            <button class="btn-secondary" (click)="onCancel()">Back to List</button>
        </div>

        <div class="form-container card">
            <form [formGroup]="universityForm" (ngSubmit)="onSubmit()">
                <div class="form-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>University Name <span class="required">*</span></label>
                            <input type="text" formControlName="universityName" placeholder="Enter University Name">
                        </div>
                        <div class="form-group">
                            <label>University Code <span class="required">*</span></label>
                            <input type="text" formControlName="universityCode" placeholder="Enter Code">
                        </div>
                        <div class="form-group">
                            <label>Status <span class="required">*</span></label>
                            <select formControlName="activeStatus">
                                <option value="A">Active</option>
                                <option value="D">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div> <!-- end form-body -->
                <div class="form-footer">
                    <div class="validation-msg" *ngIf="universityForm.invalid && (universityForm.dirty || universityForm.touched)">
                        <span class="required">* Please fill all fields correctly. Code must be max 5 characters.</span>
                    </div>
                    <button type="submit" class="btn-primary" [disabled]="universityForm.invalid">
                        {{ isEditing ? 'Update University' : 'Save University' }}
                    </button>
                    <button type="button" class="btn-secondary" (click)="onCancel()">Cancel</button>
                </div>




            </form>
        </div>
    </div>
</div>
  `,

    styles: [`
.page-container {
    padding: 24px;
    background: #f8fafc;
    min-height: 100%;
}

.header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
}

.header-actions h2 {
    margin: 0;
    font-size: 1.5rem;
    font-weight: 700;
    color: #1e293b;
}

.actions {
    display: flex;
    gap: 12px;
}

.search-box {
    padding: 10px 16px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    width: 280px;
    font-size: 0.9rem;
    transition: all 0.2s;
}

.search-box:focus {
    border-color: #3b82f6;
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.table-container {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    overflow: hidden;
}

.data-table {
    width: 100%;
    border-collapse: collapse;
}

.data-table th {
    background: #f1f5f9;
    padding: 16px;
    text-align: left;
    font-size: 0.85rem;
    font-weight: 600;
    color: #64748b;
    text-transform: uppercase;
    letter-spacing: 0.025em;
}

.data-table td {
    padding: 16px;
    border-top: 1px solid #f1f5f9;
    color: #334155;
    font-size: 0.95rem;
}

.status-badge {
    display: inline-flex;
    padding: 4px 10px;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 600;
    background: #fee2e2;
    color: #991b1b;
}

.status-badge.active {
    background: #dcfce7;
    color: #166534;
}

.btn-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #e7f1ff;
    color: #0056b3;
    border: 1px solid #dbeafe;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
    font-size: 1.1rem;
    padding: 6px;
    width: 36px;
    height: 36px;
}

.btn-icon:hover {
    background: #cce3ff;
    color: #004494;
    transform: translateY(-2px);
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}





/* Edit View Styles */
.edit-page-view {
    animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
}

.card {
    background: #ffffff;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    padding: 32px;
}

.form-container {
    max-width: 800px;
    margin: 0 auto;
}

.form-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.form-group label {
    font-weight: 600;
    font-size: 0.875rem;
    color: #475569;
}

.form-group input, .form-group select {
    padding: 10px 14px;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    font-size: 0.95rem;
    color: #1e293b;
    transition: all 0.2s;
}

.form-group input:focus, .form-group select:focus {
    border-color: #3b82f6;
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.required {
    color: #ef4444;
}

.form-footer {
    display: flex;
    justify-content: flex-end;
    gap: 12px;
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid #f1f5f9;
}

.btn-primary {
    background: #2563eb;
    color: #ffffff;
    border: none;
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-primary:hover:not(:disabled) {
    background: #1d4ed8;
}

.btn-primary.btn-sm {
    padding: 6px 14px;
    font-size: 0.8rem;
    display: flex;
    align-items: center;
    gap: 6px;
}


.btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
}

.btn-secondary {
    background: #f8fafc;
    color: #475569;
    border: 1px solid #e2e8f0;
    padding: 10px 24px;
    border-radius: 8px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.btn-secondary:hover {
    background: #f1f5f9;
}

.no-data {
    text-align: center;
    padding: 48px !important;
    color: #94a3b8;
    font-style: italic;
}
  `]
})
export class UniversityListComponent implements OnInit {
    private fb = inject(FormBuilder);
    private universityService = inject(UniversityListService);
    private cdr = inject(ChangeDetectorRef);

    universities: UniversityList[] = [];
    filteredUniversities: UniversityList[] = [];

    showEditView = false;
    isEditing = false;
    selectedUniversity: UniversityList | null = null;

    universityForm: FormGroup = this.fb.group({
        universityName: ['', Validators.required],
        universityCode: ['', [Validators.required, Validators.maxLength(5)]],
        activeStatus: ['A', Validators.required]
    });



    ngOnInit() {
        this.loadUniversities();
    }

    loadUniversities() {
        this.universityService.getAll().subscribe({
            next: (data: any) => {
                this.universities = (Array.isArray(data) ? data : []).map((item: any) => ({
                    universityId: item.university_id || item.universityId || item.UniversityId || item.Id || item.id,
                    universityName: item.university_name || item.universityName || item.UniversityName || item.Name || item.name,
                    universityCode: item.university_code || item.universityCode || item.UniversityCode || '',
                    activeStatus: (item.status === 'A' || item.Status === 'A') ? 'Active' :
                        (item.status === 'D' || item.Status === 'D') ? 'Inactive' : 'Active'
                }));

                this.filteredUniversities = [...this.universities];
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Error loading universities', err);
                this.universities = [];
                this.filteredUniversities = [];
                this.cdr.detectChanges();
            }
        });
    }

    onSearch(event: any) {
        const query = event.target.value.toLowerCase();
        this.filteredUniversities = this.universities.filter(u =>
            (u.universityName && u.universityName.toLowerCase().includes(query)) ||
            (u.universityCode && u.universityCode.toLowerCase().includes(query))
        );
    }

    generateUniversityCode(): string {
        return 'U' + Math.floor(1000 + Math.random() * 9000);
    }

    openAddView() {
        this.isEditing = false;
        this.selectedUniversity = null;
        this.universityForm.reset({
            universityName: '',
            universityCode: this.generateUniversityCode(),
            activeStatus: 'A'
        });
        this.showEditView = true;
    }

    openEditView(university: UniversityList) {
        this.isEditing = true;
        this.selectedUniversity = university;
        this.universityForm.patchValue({
            universityName: university.universityName,
            universityCode: university.universityCode,
            activeStatus: university.activeStatus === 'Active' ? 'A' : 'D'
        });
        this.showEditView = true;
    }

    onCancel() {
        this.showEditView = false;
        this.universityForm.reset();
    }





    onSubmit() {
        if (this.universityForm.invalid) {
            alert('Please fill all required fields');
            return;
        }

        const formValues = this.universityForm.value;
        const payload: any = {
            UniversityId: this.isEditing ? this.selectedUniversity?.universityId : '0',
            UniversityName: formValues.universityName,
            UniversityCode: formValues.universityCode,
            Status: formValues.activeStatus,
            CreatedBy: 'Admin'
        };

        console.log('Form Values:', formValues);
        console.log('Payload:', payload);

        if (this.isEditing) {
            console.log('Updating university with ID:', this.selectedUniversity?.universityId);
            this.universityService.update(this.selectedUniversity?.universityId || '', payload).subscribe({

                next: (response) => {
                    console.log('Update success:', response);
                    alert('University updated successfully!');
                    this.loadUniversities();
                    this.showEditView = false;
                },
                error: (err) => {
                    console.error('Update failed:', err);
                    alert('Failed to update university: ' + (err.error?.message || err.message));
                }
            });
        } else {
            console.log('Creating new university');
            this.universityService.create(payload).subscribe({
                next: (response) => {
                    console.log('Create success:', response);
                    alert('University saved successfully!');
                    this.loadUniversities();
                    this.showEditView = false;
                },
                error: (err) => {
                    console.error('Create failed:', err);
                    alert('Failed to save university: ' + (err.error?.message || err.message));
                }
            });
        }



    }
}
