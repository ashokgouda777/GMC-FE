import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CouncilMasterService } from './council-master.service';
import { CouncilMaster } from './council-master.model';

@Component({
  selector: 'app-council-master',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
<div class="page-container">
    <!-- List View -->
    <div *ngIf="!showEditView">
        <div class="header-actions">
            <h2>Council Master</h2>
            <div class="actions">
                <input type="text" placeholder="Search Councils..." (input)="onSearch($event)" class="search-box">
                <button class="btn-primary" (click)="openAddView()">+ Add New Council</button>
            </div>
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>Council Name</th>
                        <th>City</th>
                        <th>Short Code</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let council of filteredCouncils">
                        <td>{{ council.councilName }}</td>
                        <td>{{ council.city }}</td>
                        <td>{{ council.shortCode }}</td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-primary btn-sm" (click)="openEditView(council)" title="Edit">
                                    <i class="fas fa-edit"></i> Edit
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr *ngIf="filteredCouncils.length === 0">
                        <td colspan="4" class="no-data">No councils found.</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>

    <!-- Add/Edit View -->
    <div class="edit-page-view" *ngIf="showEditView">
        <div class="header-actions">
            <h2>{{ isEditing ? 'Edit Council' : 'Add New Council' }}</h2>
            <button class="btn-secondary" (click)="onCancel()">Back to List</button>
        </div>

        <div class="form-container card">
            <form [formGroup]="councilForm" (ngSubmit)="onSubmit()">
                <div class="form-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>Council Name <span class="required">*</span></label>
                            <input type="text" formControlName="councilName" placeholder="Enter Council Name">
                        </div>

                        <div class="form-group">
                            <label>Short Code <span class="required">*</span></label>
                            <input type="text" formControlName="shortCode" placeholder="Enter Short Code">
                        </div>

                        <div class="form-group">
                            <label>Country <span class="required">*</span></label>
                            <select formControlName="countryId" (change)="onCountryChange()">
                                <option value="">Select Country</option>
                                <option *ngFor="let c of countries" [value]="c.countryId">{{ c.countryName }}</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>State <span class="required">*</span></label>
                            <select formControlName="stateId">
                                <option value="">Select State</option>
                                <option *ngFor="let s of states" [value]="s.stateId">{{ s.stateName }}</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>City</label>
                            <input type="text" formControlName="city" placeholder="Enter City">
                        </div>

                        <div class="form-group">
                            <label>Zip Code</label>
                            <input type="text" formControlName="zipCode" placeholder="Enter Zip Code">
                        </div>

                        <div class="form-group">
                            <label>Email ID</label>
                            <input type="email" formControlName="emailId" placeholder="Enter Email ID">
                        </div>

                        <div class="form-group">
                            <label>Phone No</label>
                            <input type="text" formControlName="phoneno" placeholder="Enter Phone No">
                        </div>

                        <div class="form-group">
                            <label>Website</label>
                            <input type="text" formControlName="website" placeholder="Enter Website URL">
                        </div>

                        <div class="form-group">
                            <label>Address 1</label>
                            <input type="text" formControlName="address" placeholder="Enter Address 1">
                        </div>

                        <div class="form-group">
                            <label>Address 2</label>
                            <input type="text" formControlName="address2" placeholder="Enter Address 2">
                        </div>
                    </div>
                </div>

                <div class="form-footer">
                    <div class="action-buttons">
                        <button type="submit" class="btn-primary" [disabled]="councilForm.invalid">
                            {{ isEditing ? 'Update Council' : 'Save Council' }}
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
    .page-container { padding: 1.5rem; background: var(--bg-color); min-height: 100%; font-family: var(--font-family, 'Poppins', sans-serif); }
    .header-actions { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; }
    .header-actions h2 { margin: 0; font-size: 1.5rem; font-weight: 700; color: var(--text-color); }
    .actions { display: flex; gap: 0.75rem; }
    .search-box { padding: 0.625rem 1rem; border: 1px solid rgba(0,0,0,0.1); background: var(--card-bg); color: var(--text-color); border-radius: 0.5rem; width: 17.5rem; font-size: 0.9rem; transition: all 0.2s; }
    .search-box:focus { border-color: var(--primary-color); outline: none; box-shadow: 0 0 0 0.1875rem rgba(var(--primary-color), 0.1); }

    .table-container { background: var(--card-bg); border-radius: 0.75rem; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); overflow: hidden; }
    .data-table { width: 100%; border-collapse: collapse; }
    .data-table th { background: var(--table-header-bg); padding: 1rem; text-align: left; font-size: 0.85rem; font-weight: 600; color: var(--table-header-text); text-transform: uppercase; letter-spacing: 0.025em; }
    .data-table td { padding: 1rem; border-top: 1px solid rgba(0,0,0,0.05); color: var(--table-body-text); font-size: 0.95rem; }

    .status-badge { display: inline-flex; padding: 4px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; background: #fee2e2; color: #991b1b; }
    .status-badge.active { background: #dcfce7; color: #166534; }

    .btn-primary { background: var(--button-color); color: #ffffff; border: none; padding: 0.625rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-primary:hover:not(:disabled) { filter: brightness(0.9); }
    .btn-primary.btn-sm { padding: 0.4rem 0.8rem; font-size: 0.875rem; display: flex; align-items: center; gap: 0.5rem; border-radius: 0.5rem; }
    .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }

    .btn-secondary { background: var(--bg-color); color: var(--text-color); border: 1px solid rgba(0,0,0,0.1); padding: 0.625rem 1.5rem; border-radius: 0.5rem; font-weight: 600; cursor: pointer; transition: all 0.2s; }
    .btn-secondary:hover { background: rgba(0,0,0,0.05); }

    .edit-page-view { animation: slideUp 0.3s ease-out; }
    @keyframes slideUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

    .card { background: var(--card-bg); border-radius: 0.75rem; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 2rem; }
    .form-container { max-width: 50rem; margin: 0 auto; }
    .form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 1.5rem; }
    .form-group { display: flex; flex-direction: column; gap: 0.5rem; }
    .form-group label { font-weight: 600; font-size: 0.875rem; color: var(--text-color); }
    .form-group input, .form-group select { padding: 0.625rem 0.875rem; border: 1px solid rgba(0,0,0,0.1); background: var(--card-bg); color: var(--table-body-text); border-radius: 0.5rem; font-size: 0.95rem; transition: all 0.2s; }
    .form-group input:focus, .form-group select:focus { border-color: var(--primary-color); outline: none; box-shadow: 0 0 0 0.1875rem rgba(var(--primary-color), 0.1); }
    .required { color: #ef4444; }

    .form-footer { display: flex; justify-content: flex-end; gap: 0.75rem; margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid rgba(0,0,0,0.05); }
    .action-buttons { display: flex; gap: 0.75rem; }
    .no-data { text-align: center; padding: 3rem !important; color: var(--text-color); opacity: 0.6; font-style: italic; }
  `]
})
export class CouncilMasterComponent implements OnInit {
  private fb = inject(FormBuilder);
  private councilService = inject(CouncilMasterService);
  private cdr = inject(ChangeDetectorRef);

  councils: CouncilMaster[] = [];
  filteredCouncils: CouncilMaster[] = [];
  countries: any[] = [];
  states: any[] = [];

  showEditView = false;
  isEditing = false;
  selectedCouncil: CouncilMaster | null = null;

  councilForm = this.fb.group({
    councilName: ['', Validators.required],
    shortCode: ['', Validators.required],
    countryId: ['', Validators.required],
    stateId: ['', Validators.required],
    city: [''],
    zipCode: [''],
    emailId: ['', Validators.email],
    phoneno: [''],
    website: [''],
    address: [''],
    address2: ['']
  });

  ngOnInit() {
    this.loadCouncils();
    this.loadCountries();
  }

  loadCountries() {
    // We'll use the service to get countries. 
    // Assuming SubjectMasterService has it or another common service.
    // For now, I'll use the API directly or inject AdminService if available.
    // I'll check if SubjectMasterService already has getCountries.
    (this.councilService as any).api.get('MasterData/countrymaster').subscribe({
      next: (res: any) => this.countries = res,
      error: (err: any) => console.error('Error loading countries', err)
    });
  }

  onCountryChange() {
    const countryId = this.councilForm.get('countryId')?.value;
    if (countryId) {
      (this.councilService as any).api.get(`MasterData/statemaster?countryId=${countryId}`).subscribe({
        next: (res: any) => this.states = res,
        error: (err: any) => console.error('Error loading states', err)
      });
    } else {
      this.states = [];
    }
    this.councilForm.get('stateId')?.setValue('');
  }

  loadCouncils() {
    this.councilService.getAll().subscribe({
      next: (response: any) => {
        const data = Array.isArray(response) ? response : (response.data || []);
        this.councils = data.map((item: any) => ({
          councilId: item.councilId || '',
          councilName: item.councilName || '',
          countryId: item.countryId || '',
          stateId: item.stateId || '',
          city: item.city || '',
          emailId: item.emailId || '',
          phoneno: item.phoneno || '',
          website: item.website || '',
          address: item.address || '',
          address2: item.address2 || '',
          zipCode: item.zipCode || '',
          shortCode: item.shortCode || ''
        }));
        this.filteredCouncils = [...this.councils];
        this.cdr.detectChanges();
      },
      error: (err: any) => console.error('Error loading councils', err)
    });
  }

  onSearch(event: any) {
    const query = (event.target as HTMLInputElement).value.toLowerCase();
    this.filteredCouncils = this.councils.filter(c => 
      c.councilName.toLowerCase().includes(query) || 
      c.shortCode.toLowerCase().includes(query) ||
      (c.city && c.city.toLowerCase().includes(query))
    );
  }

  openAddView() {
    this.isEditing = false;
    this.selectedCouncil = null;
    this.councilForm.reset({
      councilName: '',
      shortCode: '',
      countryId: '',
      stateId: '',
      city: '',
      zipCode: '',
      emailId: '',
      phoneno: '',
      website: '',
      address: '',
      address2: ''
    });
    this.states = [];
    this.showEditView = true;
  }

  openEditView(council: CouncilMaster) {
    this.isEditing = true;
    this.selectedCouncil = council;
    
    // Load states for the selected country before patching
    if (council.countryId) {
      (this.councilService as any).api.get(`MasterData/statemaster?countryId=${council.countryId}`).subscribe({
        next: (res: any) => {
          this.states = res;
          this.councilForm.patchValue({
            councilName: council.councilName,
            shortCode: council.shortCode,
            countryId: council.countryId,
            stateId: council.stateId,
            city: council.city,
            zipCode: council.zipCode,
            emailId: council.emailId,
            phoneno: council.phoneno,
            website: council.website,
            address: council.address,
            address2: council.address2
          });
        }
      });
    } else {
      this.councilForm.patchValue({
        councilName: council.councilName,
        shortCode: council.shortCode
      });
    }
    this.showEditView = true;
  }

  onCancel() {
    this.showEditView = false;
  }

  onSubmit() {
    if (this.councilForm.invalid) {
      this.councilForm.markAllAsTouched();
      return;
    }

    const val = this.councilForm.value;
    const payload = {
      councilId: this.isEditing ? this.selectedCouncil?.councilId : '0',
      councilName: val.councilName,
      countryId: val.countryId,
      stateId: val.stateId,
      city: val.city,
      emailId: val.emailId,
      phoneno: val.phoneno,
      website: val.website,
      address: val.address,
      address2: val.address2,
      zipCode: val.zipCode,
      shortCode: val.shortCode,
      createdOn: new Date().toISOString(),
      updatedOn: new Date().toISOString()
    };

    this.councilService.save(payload).subscribe({
      next: () => {
        alert(`Council ${this.isEditing ? 'updated' : 'saved'} successfully!`);
        this.loadCouncils();
        this.showEditView = false;
      },
      error: (err: any) => alert('Error: ' + (err.error?.message || err.message))
    });
  }
}
