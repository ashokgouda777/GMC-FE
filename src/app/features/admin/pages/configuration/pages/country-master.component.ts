import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CountryMasterService } from './country-master.service';
import { CountryList } from './country-master.model';

@Component({
  selector: 'app-country-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="page-container">
    <!-- List View -->
    <div *ngIf="!showEditView">
        <div class="header-actions">
            <h2>Country List</h2>
            <div class="actions">
                <input type="text" placeholder="Search Countries..." (input)="onSearch($event)" class="search-box">
                <button class="btn-primary" (click)="openAddView()">+ Add New Country</button>
            </div>
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Sl. No</th>
                        <th>Country Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let country of filteredCountries; let i = index">
                        <td>{{ i + 1 }}</td>
                        <td>{{ country.countryName }}</td>
                        <td>
                            <span class="status-badge" [class.active]="country.activeStatus === 'Active'">
                                {{ country.activeStatus }}
                            </span>
                        </td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-primary" (click)="openEditView(country)" title="Edit">
                                    Edit
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr *ngIf="filteredCountries.length === 0">
                        <td colspan="4" class="no-data">No countries found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Add/Edit View -->
    <div class="edit-page-view" *ngIf="showEditView">
        <div class="header-actions">
            <h2>{{ isEditing ? 'Edit Country' : 'Add New Country' }}</h2>
            <button class="btn-secondary" (click)="onCancel()">Back to List</button>
        </div>

        <div class="form-container card">
            <form [formGroup]="countryForm" (ngSubmit)="onSubmit()">
                <div class="form-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Country Name <span class="required">*</span></label>
                            <input type="text" formControlName="countryName" placeholder="Enter Country Name">
                        </div>
                        <div class="form-group" *ngIf="isEditing">
                            <label>Status</label>
                            <select formControlName="status">
                                <option value="A">Active</option>
                                <option value="D">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-footer">
                    <div class="validation-msg" *ngIf="countryForm.invalid && (countryForm.dirty || countryForm.touched)">
                        <span class="required">* Country Name is required.</span>
                    </div>
                    <div class="action-buttons">
                        <button type="submit" class="btn-primary" [disabled]="countryForm.invalid">
                            {{ isEditing ? 'Update Country' : 'Save Country' }}
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
.page-container { padding: 24px; background: #f8fafc; min-height: 100%; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
.header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; border-bottom: 1px solid #e2e8f0; padding-bottom: 16px; }
.header-actions h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: #0f172a; }
.actions { display: flex; gap: 12px; }
.search-box { padding: 10px 16px; border: 1px solid #e2e8f0; border-radius: 8px; width: 300px; font-size: 0.9rem; }
.table-container { background: #ffffff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: auto; }
.data-table { width: 100%; border-collapse: collapse; }
.data-table th { background: #f8fafc; padding: 16px; text-align: left; font-size: 0.85rem; font-weight: 600; color: #64748b; text-transform: uppercase; border-bottom: 2px solid #f1f5f9; }
.data-table td { padding: 16px; border-top: 1px solid #f1f5f9; color: #334155; }
.status-badge { display: inline-flex; padding: 4px 12px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
.status-badge.active { background: #dcfce7; color: #166534; }
.status-badge:not(.active) { background: #fee2e2; color: #991b1b; }

.card { background: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 32px; max-width: 600px; margin: 0 auto; }
.form-grid { display: grid; gap: 24px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-weight: 600; font-size: 0.9rem; color: #334155; }
.form-group input, .form-group select { padding: 12px 14px; border: 1px solid #e2e8f0; border-radius: 8px; font-size: 0.95rem; background: #ffffff; color: #1e293b; }
.form-group input:focus, .form-group select:focus { border-color: #3b82f6; outline: none; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.required { color: #ef4444; }

.form-footer { margin-top: 40px; padding-top: 24px; border-top: 1px solid #f1f5f9; display: flex; justify-content: space-between; align-items: center; }
.action-buttons { display: flex; gap: 16px; }

.btn-primary { background: #2563eb; color: #ffffff; border: none; padding: 12px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; transition: background 0.2s; }
.btn-primary:hover:not(:disabled) { background: #1d4ed8; }
.btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
.btn-secondary { background: #ffffff; color: #475569; border: 1px solid #e2e8f0; padding: 12px 32px; border-radius: 8px; font-weight: 600; cursor: pointer; }
.btn-secondary:hover { background: #f8fafc; }

.no-data { text-align: center; padding: 64px !important; color: #94a3b8; font-style: italic; }
  `]
})
export class CountryMasterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private countryService = inject(CountryMasterService);
  private cdr = inject(ChangeDetectorRef);

  countries: CountryList[] = [];
  filteredCountries: CountryList[] = [];

  showEditView = false;
  isEditing = false;
  selectedCountry: CountryList | null = null;

  countryForm = this.fb.group({
    countryName: ['', Validators.required],
    status: ['A', Validators.required]
  });

  ngOnInit() {
    this.loadCountries();
  }

  loadCountries() {
    this.countryService.getAll().subscribe({
      next: (response: any) => {
        // Handle both direct array and wrapped response.data
        const data = Array.isArray(response) ? response : (response.data || []);
        this.countries = data.map((item: any) => ({
          countryId: item.countryId || item.CountryId || item.id || '',
          countryName: item.countryName || item.CountryName || item.name || '',
          status: item.status || item.Status || (item.active === 'Yes' ? 'A' : 'D'),
          activeStatus: (item.status === 'A' || item.Status === 'A' || item.active === 'Yes') ? 'Active' : 'Inactive'
        }));
        this.filteredCountries = [...this.countries];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading countries', err)
    });
  }

  onSearch(event: any) {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredCountries = this.countries.filter(c =>
      c.countryName.toLowerCase().includes(query)
    );
  }

  openAddView() {
    this.isEditing = false;
    this.selectedCountry = null;
    this.countryForm.reset({ status: 'A', countryName: '' });
    this.showEditView = true;
  }

  openEditView(country: CountryList) {
    this.isEditing = true;
    this.selectedCountry = country;
    this.countryForm.patchValue({
      countryName: country.countryName,
      status: country.status
    });
    this.showEditView = true;
  }

  onCancel() {
    this.showEditView = false;
  }

  onSubmit() {
    if (this.countryForm.invalid) {
      this.countryForm.markAllAsTouched();
      return;
    }

    const v = this.countryForm.value;
    const payload = {
      CountryId: this.isEditing ? this.selectedCountry?.countryId : '0',
      CountryName: v.countryName,
      Status: v.status,
      CreatedBy: 'Admin'
    };

    this.countryService.save(payload).subscribe({
      next: () => {
        alert(`Country ${this.isEditing ? 'updated' : 'saved'} successfully!`);
        this.loadCountries();
        this.showEditView = false;
      },
      error: (err) => alert('Error: ' + (err.error?.message || err.message))
    });
  }
}
