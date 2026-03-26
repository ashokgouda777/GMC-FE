import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { DistrictListService } from './district-list.service';
import { DistrictList } from './district-list.model';
import { StateListService } from './state-list.service';
import { StateList } from './state-list.model';
import { CountryMasterService } from './country-master.service';
import { CountryList } from './country-master.model';

@Component({
  selector: 'app-district-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="page-container">
    <!-- List View -->
    <div *ngIf="!showEditView">
        <div class="header-actions">
            <h2>District List</h2>
            <div class="actions">
                <input type="text" placeholder="Search Districts..." (input)="onSearch($event)" class="search-box">
                <button class="btn-primary" (click)="openAddView()">+ Add New District</button>
            </div>
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Sl. No</th>
                        <th>Country Name</th>
                        <th>State Name</th>
                        <th>District Name</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let district of filteredDistricts; let i = index">
                        <td>{{ i + 1 }}</td>
                        <td>{{ district.countryName }}</td>
                        <td>{{ district.stateName }}</td>
                        <td>{{ district.districtName }}</td>
                        <td>
                            <span class="status-badge" [class.active]="district.activeStatus === 'Active'">
                                {{ district.activeStatus }}
                            </span>
                        </td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-primary" (click)="openEditView(district)" title="Edit">
                                    Edit
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr *ngIf="filteredDistricts.length === 0">
                        <td colspan="6" class="no-data">No districts found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Add/Edit View -->
    <div class="edit-page-view" *ngIf="showEditView">
        <div class="header-actions">
            <h2>{{ isEditing ? 'Edit District' : 'Add New District' }}</h2>
            <button class="btn-secondary" (click)="onCancel()">Back to List</button>
        </div>

        <div class="form-container card">
            <form [formGroup]="districtForm" (ngSubmit)="onSubmit()">
                <div class="form-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Country <span class="required">*</span></label>
                            <select formControlName="countryId" (change)="onCountryChange()">
                                <option value="">Select Country</option>
                                <option *ngFor="let country of countries" [value]="country.countryId">
                                    {{ country.countryName }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>State <span class="required">*</span></label>
                            <select formControlName="stateId">
                                <option value="">Select State</option>
                                <option *ngFor="let state of availableStates" [value]="state.stateId">
                                    {{ state.stateName }}
                                </option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>District Name <span class="required">*</span></label>
                            <input type="text" formControlName="districtName" placeholder="Enter District Name">
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
                    <div class="validation-msg" *ngIf="districtForm.invalid && (districtForm.dirty || districtForm.touched)">
                        <span class="required">* All fields are required.</span>
                    </div>
                    <div class="action-buttons">
                        <button type="submit" class="btn-primary" [disabled]="districtForm.invalid">
                            {{ isEditing ? 'Update District' : 'Save District' }}
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
export class DistrictListComponent implements OnInit {
  private fb = inject(FormBuilder);
  private districtService = inject(DistrictListService);
  private stateService = inject(StateListService);
  private countryService = inject(CountryMasterService);
  private cdr = inject(ChangeDetectorRef);

  districts: DistrictList[] = [];
  filteredDistricts: DistrictList[] = [];
  countries: CountryList[] = [];
  allStates: StateList[] = [];
  availableStates: StateList[] = [];

  showEditView = false;
  isEditing = false;
  selectedDistrict: DistrictList | null = null;

  districtForm = this.fb.group({
    countryId: ['', Validators.required],
    stateId: ['', Validators.required],
    districtName: ['', Validators.required],
    appYN: ['N'],
    appCenter: [''],
    status: ['A', Validators.required]
  });

  ngOnInit() {
    this.loadCountries();
    this.loadStates();
    this.loadDistricts();
  }

  loadCountries() {
    this.countryService.getAll().subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : (response.data || []);
        this.countries = data.map((item: any) => ({
          countryId: item.countryId || item.CountryId || item.id || '',
          countryName: item.countryName || item.CountryName || item.name || '',
          status: item.status || item.Status || (item.active === 'Yes' ? 'A' : 'D')
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
        this.allStates = data.map((item: any) => ({
          stateId: item.stateId || item.StateId || item.id || '',
          stateName: item.stateName || item.StateName || item.name || '',
          countryId: item.countryId || item.CountryId || ''
        }));
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading states', err)
    });
  }

  loadDistricts() {
    this.districtService.getAll().subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : (response.data || []);
        this.districts = data.map((item: any) => ({
          districtId: item.districtId || item.DistrictId || item.id || '',
          districtName: item.districtName || item.DistrictName || '',
          stateId: item.stateId || item.StateId || '',
          stateName: item.stateName || item.StateName || '',
          countryId: item.countryId || item.CountryId || '',
          countryName: item.countryName || item.CountryName || '',
          status: item.status || item.Status || (item.active === 'Yes' ? 'A' : 'D'),
          activeStatus: (item.status === 'A' || item.Status === 'A' || item.active === 'Yes') ? 'Active' : 'Inactive'
        }));
        this.filteredDistricts = [...this.districts];
        this.cdr.detectChanges();
      },
      error: (err) => console.error('Error loading districts', err)
    });
  }


  onCountryChange() {
    const countryId = this.districtForm.get('countryId')?.value;
    this.availableStates = this.allStates.filter(s => s.countryId === countryId);
    this.districtForm.patchValue({ stateId: '' });
  }

  onSearch(event: any) {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredDistricts = this.districts.filter(d =>
      d.districtName.toLowerCase().includes(query) ||
      d.stateName.toLowerCase().includes(query) ||
      d.countryName.toLowerCase().includes(query)
    );
  }

  openAddView() {
    this.isEditing = false;
    this.selectedDistrict = null;
    this.districtForm.reset({ status: 'A', countryId: '', stateId: '', districtName: '', appYN: 'N', appCenter: '' });
    this.availableStates = [];
    this.showEditView = true;
  }

  openEditView(district: DistrictList) {
    this.isEditing = true;
    this.selectedDistrict = district;
    this.availableStates = this.allStates.filter(s => s.countryId === district.countryId);
    this.districtForm.patchValue({
      countryId: district.countryId,
      stateId: district.stateId,
      districtName: district.districtName,

      status: district.status
    });
    this.showEditView = true;
  }

  onCancel() {
    this.showEditView = false;
  }

  onSubmit() {
    if (this.districtForm.invalid) {
      this.districtForm.markAllAsTouched();
      return;
    }

    const v = this.districtForm.value;
    const payload = {
      DistrictId: this.isEditing ? this.selectedDistrict?.districtId : '0',
      CountryId: v.countryId,
      StateId: v.stateId,
      DistrictName: v.districtName,
      Status: v.status,
      CreatedBy: 'Admin'
    };

    console.log('Saving District Payload:', payload);
    this.districtService.save(payload).subscribe({
      next: () => {
        alert(`District ${this.isEditing ? 'updated' : 'saved'} successfully!`);
        this.loadDistricts();
        this.showEditView = false;
      },
      error: (err) => {
        console.error('District Save Error:', err);
        alert('Error: ' + (err.error?.message || err.message));
      }
    });
  }
}
