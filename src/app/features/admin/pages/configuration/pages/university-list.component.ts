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
    <div class="header-actions">
        <h2>University List</h2>
        <div class="actions">
            <input type="text" placeholder="Search Universities..." (input)="onSearch($event)" class="search-box">
            <button class="btn-primary" (click)="openAddModal()">+ Add New University</button>
        </div>
    </div>

    <!-- University List -->
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
                            <button class="btn-icon edit" (click)="openEditModal(university)" title="Edit">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button class="btn-icon delete" (click)="confirmDelete(university)" title="Deactivate" *ngIf="university.activeStatus === 'Active'">
                                <i class="fas fa-trash-alt"></i>
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

    <!-- Add/Edit Modal -->
    <div class="modal-overlay" *ngIf="showModal">
        <div class="modal-content">
            <div class="modal-header">
                <h3>{{ isEditing ? 'Edit University' : 'Add New University' }}</h3>
                <button class="btn-close" (click)="closeModal()">&times;</button>
            </div>
            <form [formGroup]="universityForm" (ngSubmit)="onSubmit()">
                <div class="modal-body">
                    <div class="form-group">
                        <label>University Name <span class="required">*</span></label>
                        <input type="text" formControlName="universityName" placeholder="Enter University Name">
                    </div>
                    <div class="form-group">
                        <label>University Code <span class="required">*</span></label>
                        <input type="text" formControlName="universityCode" placeholder="Enter Code" readonly>
                    </div>
                    <div class="form-group">
                        <label>Status <span class="required">*</span></label>
                        <select formControlName="activeStatus">
                            <option value="A">Active</option>
                            <option value="D">Inactive</option>
                        </select>
                    </div>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn-secondary" (click)="closeModal()">Cancel</button>
                    <button type="submit" class="btn-primary" [disabled]="universityForm.invalid">
                        {{ isEditing ? 'Update' : 'Save' }}
                    </button>
                </div>
            </form>
        </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-overlay" *ngIf="showDeleteModal">
        <div class="modal-content small">
            <div class="modal-header">
                <h3>Confirm Deactivation</h3>
                <button class="btn-close" (click)="closeDeleteModal()">&times;</button>
            </div>
            <div class="modal-body">
                <p>Are you sure you want to deactivate <strong>{{ selectedUniversity?.universityName }}</strong>?</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn-secondary" (click)="closeDeleteModal()">Cancel</button>
                <button type="button" class="btn-danger" (click)="onDelete()">Deactivate</button>
            </div>
        </div>
    </div>
</div>
  `,
  styles: [`
.page-container {
    padding: 20px;
}

.header-actions {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;

    h2 {
        margin: 0;
        font-size: 1.5rem;
        color: #333;
    }

    .actions {
        display: flex;
        gap: 12px;
    }
}

.search-box {
    padding: 8px 12px;
    border: 1px solid #ddd;
    border-radius: 4px;
    width: 250px;
    font-size: 0.9rem;

    &:focus {
        border-color: #007bff;
        outline: none;
    }
}

.table-container {
    background: #fff;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.05);
    overflow: hidden;
}

.data-table {
    width: 100%;
    border-collapse: collapse;

    th {
        background: #f8f9fa;
        padding: 12px 16px;
        text-align: left;
        font-weight: 600;
        color: #666;
        border-bottom: 2px solid #eee;
    }

    td {
        padding: 12px 16px;
        border-bottom: 1px solid #eee;
        color: #444;
    }

    tr:hover {
        background: #fdfdfd;
    }
}

.status-badge {
    padding: 4px 8px;
    border-radius: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    background: #ffeeba;
    color: #856404;

    &.active {
        background: #d4edda;
        color: #155724;
    }
}

.table-actions {
    display: flex;
    gap: 8px;
}

.btn-icon {
    background: none;
    border: none;
    cursor: pointer;
    padding: 4px;
    border-radius: 4px;
    transition: background 0.2s;

    &.edit { color: #007bff; &:hover { background: #e7f1ff; } }
    &.delete { color: #dc3545; &:hover { background: #fff1f2; } }
}

.no-data {
    text-align: center;
    padding: 40px !important;
    color: #999;
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.modal-content {
    background: #fff;
    border-radius: 8px;
    width: 500px;
    max-width: 90%;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);

    &.small {
        width: 400px;
    }
}

.modal-header {
    padding: 16px 20px;
    border-bottom: 1px solid #eee;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h3 {
        margin: 0;
        font-size: 1.25rem;
    }

    .btn-close {
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #999;
    }
}

.modal-body {
    padding: 20px;
}

.modal-footer {
    padding: 16px 20px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: flex-end;
    gap: 12px;
}

.form-group {
    margin-bottom: 16px;

    label {
        display: block;
        margin-bottom: 6px;
        font-weight: 500;
        color: #555;
    }

    input, select {
        width: 100%;
        padding: 8px 12px;
        border: 1px solid #ddd;
        border-radius: 4px;
        font-size: 0.95rem;

        &:focus {
            border-color: #007bff;
            outline: none;
        }

        &[readonly] {
            background-color: #f8f9fa;
            cursor: not-allowed;
        }
    }
}

.required {
    color: #dc3545;
}

/* Button Styles */
.btn-primary {
    background: #007bff;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
    font-weight: 500;
    &:disabled { opacity: 0.6; cursor: not-allowed; }
}

.btn-secondary {
    background: #6c757d;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
}

.btn-danger {
    background: #dc3545;
    color: #fff;
    border: none;
    padding: 8px 16px;
    border-radius: 4px;
    cursor: pointer;
}
  `]
})
export class UniversityListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private universityService = inject(UniversityListService);
  private cdr = inject(ChangeDetectorRef);

  universities: UniversityList[] = [];
  filteredUniversities: UniversityList[] = [];

  showModal = false;
  showDeleteModal = false;
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

  openAddModal() {
    this.isEditing = false;
    this.selectedUniversity = null;
    this.universityForm.reset({
      universityName: '',
      universityCode: this.generateUniversityCode(),
      activeStatus: 'A'
    });
    this.showModal = true;
  }

  openEditModal(university: UniversityList) {
    this.isEditing = true;
    this.selectedUniversity = university;
    this.universityForm.patchValue({
      universityName: university.universityName,
      universityCode: university.universityCode,
      activeStatus: university.activeStatus === 'Active' ? 'A' : 'D'
    });
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
    this.universityForm.reset({
      activeStatus: 'A'
    });
  }

  confirmDelete(university: UniversityList) {
    this.selectedUniversity = university;
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
    this.selectedUniversity = null;
  }

  onDelete() {
    if (this.selectedUniversity && this.selectedUniversity.universityId) {
      this.universityService.delete(this.selectedUniversity.universityId).subscribe({
        next: () => {
          alert('University has been made Inactive!');
          this.closeDeleteModal();
          this.loadUniversities();
        },
        error: (err) => alert('Failed to deactivate university: ' + (err.error?.message || err.message))
      });
    }
  }

  onSubmit() {
    if (this.universityForm.invalid) {
      alert('Please fill all required fields');
      return;
    }

    const formValues = this.universityForm.value;
    const payload: any = {
      UniversityId: '0',
      UniversityName: formValues.universityName,
      UniversityCode: formValues.universityCode,
      CreatedBy: 'Admin',
      Status: formValues.activeStatus
    };

    if (this.isEditing && this.selectedUniversity?.universityId) {
      // Keep the original ID for the update call
      payload.UniversityId = this.selectedUniversity.universityId;

      this.universityService.update(this.selectedUniversity.universityId, payload).subscribe({
        next: () => {
          alert('University updated successfully!');
          this.loadUniversities();
          this.closeModal();
        },
        error: (err) => alert('Failed to update university: ' + (err.error?.message || err.message))
      });
    } else {
      this.universityService.create(payload).subscribe({
        next: () => {
          alert('University saved successfully!');
          this.loadUniversities();
          this.closeModal();
        },
        error: (err) => alert('Failed to save university: ' + (err.error?.message || err.message))
      });
    }
  }
}
