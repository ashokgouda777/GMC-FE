import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { StateListService } from './state-list.service';
import { StateList } from './state-list.model';
import { CountryMasterService } from './country-master.service';
import { CountryList } from './country-master.model';

@Component({
  selector: 'app-state-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="page-container">
    <!-- List View -->
    <div *ngIf="!showEditView">
        <div class="header-actions">
            <h2>State List</h2>
            <div class="actions">
                <input type="text" placeholder="Search States..." (input)="onSearch($event)" class="search-box">
                <button class="btn-primary" (click)="openAddView()">+ Add New State</button>
            </div>
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Sl. No</th>
                        <th>Country Name</th>
                        <th>State Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let state of filteredStates; let i = index">
                        <td>{{ i + 1 }}</td>
                        <td>{{ state.countryName }}</td>
                        <td>{{ state.stateName }}</td>
                        <td>
                            <span class="status-badge" [class.active]="state.activeStatus === 'Active'">
                                {{ state.activeStatus }}
                            </span>
                        </td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-primary" (click)="openEditView(state)" title="Edit">
                                    Edit
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr *ngIf="filteredStates.length === 0">
                        <td colspan="5" class="no-data">No states found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Add/Edit View -->
    <div class="edit-page-view" *ngIf="showEditView">
        <div class="header-actions">
            <h2>{{ isEditing ? 'Edit State' : 'Add New State' }}</h2>
            <button class="btn-secondary" (click)="onCancel()">Back to List</button>
        </div>

        <div class="form-container card">
            <form [formGroup]="stateForm" (ngSubmit)="onSubmit()">
                <div class="form-body">
                    <div class="form-grid grid-2">
                        <div class="form-group">
                            <label>Country <span class="required">*</span></label>
                            <select formControlName="countryId">
                                <option value="">Select Country</option>
                                <option *ngFor="let country of countries" [value]="country.countryId">
                                    {{ country.countryName }} ({{ country.countryId }})
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>State Name <span class="required">*</span></label>
                            <input type="text" formControlName="stateName" placeholder="Enter State Name">
                        </div>
                        <div class="form-group" *ngIf="isEditing">
                            <label>Status</label>
                            <select formControlName="status">
                                <option value="A">Active</option>
                                <option value="N">Inactive</option>
                            </select>
                        </div>
                    </div>
                </div>

                <div class="form-footer">
                    <div class="validation-msg" *ngIf="stateForm.invalid && (stateForm.dirty || stateForm.touched)">
                        <span class="required">* All fields are required.</span>
                    </div>
                    <div class="action-buttons">
                        <button type="submit" class="btn-primary" [disabled]="stateForm.invalid">
                            {{ isEditing ? 'Update State' : 'Save State' }}
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
export class StateListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private stateService = inject(StateListService);
  private countryService = inject(CountryMasterService);
  private cdr = inject(ChangeDetectorRef);

  states: StateList[] = [];
  filteredStates: StateList[] = [];
  countries: CountryList[] = [];

  showEditView = false;
  isEditing = false;
  selectedState: StateList | null = null;

  stateForm = this.fb.group({
    countryId: ['', Validators.required],
    stateName: ['', Validators.required],
    status: ['A', Validators.required]
  });

  ngOnInit() {
    this.loadCountries();
    this.loadStates();
  }

  loadCountries() {
    this.countryService.getAll().subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : (response.data || []);
        this.countries = data.map((item: any) => ({
          countryId: String(item.countryId || item.CountryId || item.id || ''),
          countryName: item.countryName || item.CountryName || item.name || '',
          status: item.status || item.Status || (item.active === 'Yes' ? 'A' : 'N')
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading countries', err)
    });
  }

  loadStates() {
    this.stateService.getAll().subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : (response.data || []);
        this.states = data.map((item: any) => ({
          stateId: String(item.stateId || item.StateId || item.id || ''),
          stateName: item.stateName || item.StateName || item.name || '',
          countryId: String(item.countryId || item.CountryId || ''),
          countryName: item.countryName || item.CountryName || '',
          status: item.active || item.status || item.Status || (item.active === 'Yes' ? 'A' : 'N'),
          activeStatus: (item.active === 'A' || item.status === 'A' || item.Status === 'A' || item.active === 'Yes' || item.status === 'Active') ? 'Active' : 'Inactive'
        }));
        this.filteredStates = [...this.states];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading states', err)
    });
  }

  onSearch(event: any) {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredStates = this.states.filter(s =>
      s.stateName.toLowerCase().includes(query) ||
      s.countryName.toLowerCase().includes(query)
    );
  }

  openAddView() {
    this.isEditing = false;
    this.selectedState = null;
    this.stateForm.reset({ status: 'A', countryId: '', stateName: '' });
    this.showEditView = true;
  }

  openEditView(state: StateList) {
    this.isEditing = true;
    this.selectedState = state;
    this.stateForm.patchValue({
      countryId: state.countryId,
      stateName: state.stateName,
      status: state.status
    });
    this.showEditView = true;
  }

  onCancel() {
    this.showEditView = false;
  }

  onSubmit() {
    if (this.stateForm.invalid) {
      this.stateForm.markAllAsTouched();
      return;
    }

    const v: any = this.stateForm.value;
    const payload = {
      stateId: this.isEditing ? (this.selectedState?.stateId || '0') : '0',
      countryId: v.countryId,
      stateName: v.stateName,
      active: v.status,
      createdBy: 'Admin',
      createdOn: new Date().toISOString(),
      updatedBy: 'Admin',
      updatedOn: new Date().toISOString()
    };

    this.stateService.save(payload).subscribe({
      next: () => {
        alert(`State ${this.isEditing ? 'updated' : 'saved'} successfully!`);
        this.loadStates();
        this.showEditView = false;
      },
      error: (err) => alert('Error: ' + (err.error?.message || err.message))
    });
  }
}
