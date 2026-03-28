import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NationalityMasterService } from './nationality-master.service';
import { NationalityList } from './nationality-master.model';

@Component({
  selector: 'app-nationality-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="page-container">
    <!-- List View -->
    <div *ngIf="!showEditView">
        <div class="header-actions">
            <h2>Nationality List</h2>
            <div class="actions">
                <input type="text" placeholder="Search Nationalities..." (input)="onSearch($event)" class="search-box">
                <button class="btn-primary" (click)="openAddView()">+ Add New Nationality</button>
            </div>
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Sl. No</th>
                        <th>Nationality</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let nationality of filteredNationalities; let i = index">
                        <td>{{ i + 1 }}</td>
                        <td>{{ nationality.nationality }}</td>
                        <td>
                            <span class="status-badge" [class.active]="nationality.activeStatus === 'Active'">
                                {{ nationality.activeStatus }}
                            </span>
                        </td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-primary" (click)="openEditView(nationality)" title="Edit">
                                    Edit
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr *ngIf="filteredNationalities.length === 0">
                        <td colspan="4" class="no-data">No nationalities found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Add/Edit View -->
    <div class="edit-page-view" *ngIf="showEditView">
        <div class="header-actions">
            <h2>{{ isEditing ? 'Edit Nationality' : 'Add New Nationality' }}</h2>
            <button class="btn-secondary" (click)="onCancel()">Back to List</button>
        </div>

        <div class="form-container card">
            <form [formGroup]="nationalityForm" (ngSubmit)="onSubmit()">
                <div class="form-body">
                    <div class="form-grid grid-2">
                        <div class="form-group">
                            <label>Nationality <span class="required">*</span></label>
                            <input type="text" formControlName="nationality" placeholder="Enter Nationality">
                        </div>
                        <div class="form-group" *ngIf="isEditing">
                            <label>Status</label>
                            <select formControlName="status">
                                <option value="Yes">Active</option>
                                <option value="No">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-footer">
                    <div class="validation-msg" *ngIf="nationalityForm.invalid && (nationalityForm.dirty || nationalityForm.touched)">
                        <span class="required">* Nationality is required.</span>
                    </div>
                    <div class="action-buttons">
                        <button type="submit" class="btn-primary" [disabled]="nationalityForm.invalid">
                            {{ isEditing ? 'Update Nationality' : 'Save Nationality' }}
                        </button>
                        <button type="button" class="btn-secondary" (click)="onCancel()">Cancel</button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>
  `,
  styles: [`
.page-container { padding: 24px; background: var(--bg-color); min-height: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid rgba(0,0,0,0.05); padding-bottom: 16px; }
.header-actions h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-color); }
.actions { display: flex; gap: 12px; }
.search-box { padding: 10px 16px; border: 1px solid rgba(0,0,0,0.1); background: var(--card-bg); color: var(--text-color); border-radius: 8px; width: 300px; font-size: 0.9rem; }
.table-container { background: var(--card-bg); border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: var(--table-header-bg); padding: 16px; text-align: left; font-size: 0.85rem; font-weight: 600; color: var(--table-header-text); text-transform: uppercase; border-bottom: 2px solid rgba(0,0,0,0.05); }
.data-table td { padding: 16px; border-top: 1px solid rgba(0,0,0,0.05); background: var(--table-body-bg); color: var(--table-body-text); }
.status-badge { display: inline-flex; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge:not(.active) { background: #fee2e2; color: #991b1b; }

.card { background: var(--card-bg); border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 32px; max-width: 600px; margin: 0 auto; }
.form-grid { display: grid; gap: 24px; }
.grid-2 { grid-template-columns: 1fr 1fr; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-weight: 600; font-size: 0.9rem; color: var(--text-color); }
.form-group input, .form-group select { padding: 12px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; font-size: 0.95rem; background: var(--card-bg); color: var(--table-body-text); }
.form-group input:focus, .form-group select:focus { border-color: var(--primary-color); outline: none; box-shadow: 0 0 0 3px rgba(var(--primary-color), 0.1); }
.required { color: #ef4444; }

.form-footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid rgba(0,0,0,0.05); display: flex; justify-content: space-between; align-items: center; }
.action-buttons { display: flex; gap: 16px; }

.btn-primary { background: var(--button-color); color: #ffffff; border: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: filter 0.2s; }
.btn-primary:hover:not(:disabled) { filter: brightness(0.9); }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background: var(--bg-color); color: var(--text-color); border: 1px solid rgba(0,0,0,0.1); padding: 12px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-secondary:hover { background: rgba(0,0,0,0.05); }

.no-data { text-align: center; padding: 64px !important; color: var(--text-color); opacity: 0.6; font-style: italic; }
  `]
})
export class NationalityMasterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private nationalityService = inject(NationalityMasterService);
  private cdr = inject(ChangeDetectorRef);

  nationalities: NationalityList[] = [];
  filteredNationalities: NationalityList[] = [];

  showEditView = false;
  isEditing = false;
  selectedNationality: NationalityList | null = null;

  nationalityForm = this.fb.group({
    nationality: ['', Validators.required],
    status: ['Yes', Validators.required]
  });

  ngOnInit() {
    this.loadNationalities();
  }

  loadNationalities() {
    this.nationalityService.getAll().subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : (response.data || []);
        this.nationalities = data.map((item: any) => {
          const isActive = (item.status === 'Active' || item.status === 'A' || item.Status === 'Active' || item.active === 'Yes' || item.status === 'Yes');
          return {
            nationalityId: String(item.nationalityId || item.NationalityId || item.id || ''),
            nationality: item.nationality || item.Nationality || item.nationalityName || item.NationalityName || '',
            status: isActive ? 'Yes' : 'No',
            activeStatus: isActive ? 'Active' : 'Inactive'
          };
        });
        this.filteredNationalities = [...this.nationalities];
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading nationalities', err)
    });
  }

  onSearch(event: any) {
     const query = (event.target as HTMLInputElement).value.toLowerCase();
     this.filteredNationalities = this.nationalities.filter(n =>
       n.nationality.toLowerCase().includes(query)
     );
   }

  openAddView() {
     this.isEditing = false;
     this.selectedNationality = null;
     this.nationalityForm.reset({ status: 'Yes', nationality: '' });
     this.showEditView = true;
   }

  openEditView(nationality: NationalityList) {
     this.isEditing = true;
     this.selectedNationality = nationality;
     this.nationalityForm.patchValue({
       nationality: nationality.nationality,
       status: nationality.status
     });
     this.showEditView = true;
   }

  onCancel() {
    this.showEditView = false;
  }

  onSubmit() {
    if (this.nationalityForm.invalid) {
      this.nationalityForm.markAllAsTouched();
      return;
    }

    const v: any = this.nationalityForm.value;
    const payload = {
      nationalityId: this.isEditing ? String(this.selectedNationality?.nationalityId) : '0',
      nationality: v.nationality,
      status: v.status, // Sending "Yes" or "No"
      createdBy: 'Admin',
      createdOn: new Date().toISOString()
    };

    this.nationalityService.save(payload).subscribe({
      next: () => {
        alert(`Nationality ${this.isEditing ? 'updated' : 'saved'} successfully!`);
        this.loadNationalities();
        this.showEditView = false;
      },
      error: (err: any) => alert('Error: ' + (err.error?.message || err.message))
    });
  }
}
