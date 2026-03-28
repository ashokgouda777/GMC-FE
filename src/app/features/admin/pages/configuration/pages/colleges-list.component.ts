import { Component, OnInit, inject, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CollegesListService } from './colleges-list.service';
import { UniversityListService } from './university-list.service';
import { StateListService } from './state-list.service';
import { DistrictListService } from './district-list.service';
import { AdminService } from '../../../services/admin.service';
import { CollegeList } from './colleges-list.model';
import { UniversityList } from './university-list.model';

@Component({
    selector: 'app-colleges-list',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule],
    template: `
<div class="page-container">
    <!-- List View -->
    <div *ngIf="!showEditView">
        <div class="header-actions">
            <h2>Colleges List</h2>
            <div class="actions">
                <input type="text" placeholder="Search Colleges..." (input)="onSearch($event)" class="search-box">
                <button class="btn-primary" (click)="openAddView()">+ Add New College</button>
            </div>
        </div>

        <div class="table-container">
            <table class="data-table">
                <thead>
                    <tr>
                        <th>College Name</th>
                        <th>University</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    <tr *ngFor="let college of filteredColleges">
                        <td>{{ college.collegeName }}</td>
                        <td>{{ college.universityName }}</td>
                        <td>
                            <span class="status-badge" [class.active]="college.activeStatus === 'Active'">
                                {{ college.activeStatus }}
                            </span>
                        </td>
                        <td>
                            <div class="table-actions">
                                <button class="btn-primary" (click)="openEditView(college)" title="Edit">
                                    Edit
                                </button>
                            </div>
                        </td>
                    </tr>
                    <tr *ngIf="filteredColleges.length === 0">
                        <td colspan="4" class="no-data">No colleges found.</td>
                    </tr>
                </tbody>


            </table>
        </div>
    </div>

    <!-- Add/Edit View -->
    <div class="edit-page-view" *ngIf="showEditView">
        <div class="header-actions">
            <h2>{{ isEditing ? 'Edit College' : 'Add New College' }}</h2>
            <button class="btn-secondary" (click)="onCancel()">Back to List</button>
        </div>

        <div class="form-container card">
            <form [formGroup]="collegeForm" (ngSubmit)="onSubmit()">
                <div class="form-body">
                    <div class="form-grid">
                        <div class="form-group">
                            <label>College Name <span class="required">*</span></label>
                            <input type="text" formControlName="collegeName" placeholder="Enter College Name">
                        </div>
                        <div class="form-group">
                            <label>College Code <span class="required">*</span></label>
                            <input type="text" formControlName="collegeCode" placeholder="Enter College Code">
                        </div>

                        <div class="form-group">
                            <label>University Name <span class="required">*</span></label>
                            <select formControlName="universityId">
                                <option value="">Select University</option>
                                <option *ngFor="let uni of universities" [value]="uni.universityId">{{ uni.universityName }} ({{ uni.universityId }})</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Type <span class="required">*</span></label>
                            <select formControlName="type">
                                <option value="">Select Type</option>
                                <option value="Government">Government</option>
                                <option value="Private">Private</option>
                                <option value="Aided">Aided</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Principal Name <span class="required">*</span></label>
                            <input type="text" formControlName="principalName" placeholder="Enter Principal Name">
                        </div>
                        <div class="form-group">
                            <label>Telephone Number <span class="required">*</span></label>
                            <input type="text" formControlName="telNumber" placeholder="Enter Telephone Number">
                        </div>

                        <div class="form-group">
                            <label>Email Address <span class="required">*</span></label>
                            <input type="email" formControlName="email" placeholder="Enter Email Address" autocomplete="new-password">
                            <div class="hint" *ngIf="collegeForm.get('email')?.invalid && collegeForm.get('email')?.touched">Valid Email is required.</div>
                        </div>
                        <div class="form-group">
                            <label>Password</label>
                            <input type="password" formControlName="password" placeholder="••••••••" autocomplete="new-password">
                        </div>

                        <div class="form-group">
                            <label>Country <span class="required">*</span></label>
                            <select formControlName="country" (change)="onCountryChange()">
                                <option value="">Select Country</option>
                                <option *ngFor="let c of countries" [value]="c.countryId">{{ c.countryName }} ({{ c.countryId }})</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>State <span class="required">*</span></label>
                            <select formControlName="state" (change)="onStateChange()">
                                <option value="">Select State</option>
                                <option *ngFor="let s of states" [value]="s.stateId">{{ s.stateName }} ({{ s.stateId }})</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>District <span class="required">*</span></label>
                            <select formControlName="district">
                                <option value="">Select District</option>
                                <option *ngFor="let d of districts" [value]="d.districtId">{{ d.districtName }} ({{ d.districtId }})</option>
                            </select>
                        </div>
                        <div class="form-group">
                            <label>Status <span class="required">*</span></label>
                            <select formControlName="activeStatus">
                                <option value="A">Active</option>
                                <option value="D">Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div class="form-group mt-4">
                        <label>College Address <span class="required">*</span></label>
                        <textarea formControlName="collegeAddress" placeholder="Enter College Address" rows="3"></textarea>
                    </div>

                </div>

                <div class="form-footer">
                    <div class="validation-msg" *ngIf="collegeForm.invalid && (collegeForm.dirty || collegeForm.touched)">
                        <span class="required">* Please fill all mandatory fields correctly.</span>
                    </div>
                    <div class="action-buttons">
                        <button type="submit" class="btn-primary" [disabled]="collegeForm.invalid">
                            {{ isEditing ? 'Update College' : 'Save College' }}
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

.card { background: var(--card-bg); border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 32px; }
.form-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 24px; }
.form-group { display: flex; flex-direction: column; gap: 8px; }
.form-group label { font-weight: 600; font-size: 0.9rem; color: var(--text-color); }
.form-group input, .form-group select, .form-group textarea { padding: 12px 14px; border: 1px solid rgba(0,0,0,0.1); border-radius: 8px; font-size: 0.95rem; background: var(--card-bg); color: var(--table-body-text); width: 100%; box-sizing: border-box; }
.form-group input:focus, .form-group select:focus, .form-group textarea:focus { border-color: var(--primary-color); outline: none; box-shadow: 0 0 0 3px rgba(var(--primary-color), 0.1); }
.mt-4 { margin-top: 24px; }
.required { color: #ef4444; }
.hint { font-size: 0.75rem; color: #ef4444; margin-top: 4px; }

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
export class CollegesListComponent implements OnInit {
    private fb = inject(FormBuilder);
    private collegeService = inject(CollegesListService);
    private universityService = inject(UniversityListService);
    private stateService = inject(StateListService);
    private districtService = inject(DistrictListService);
    private adminService = inject(AdminService);
    private cdr = inject(ChangeDetectorRef);

    colleges: CollegeList[] = [];
    filteredColleges: CollegeList[] = [];
    universities: UniversityList[] = [];
    countries: any[] = [];
    allStates: any[] = [];
    states: any[] = [];
    allDistricts: any[] = [];
    districts: any[] = [];

    showEditView = false;
    isEditing = false;
    selectedCollege: CollegeList | null = null;

    collegeForm = this.fb.group({
        collegeName: ['', Validators.required],
        universityId: ['', Validators.required],
        collegeCode: ['', Validators.required],
        type: ['', Validators.required],
        principalName: ['', Validators.required],
        telNumber: ['', [Validators.required, Validators.pattern(/^[0-9]{10}$/)]],
        email: ['', [Validators.required, Validators.email]],
        country: ['', Validators.required],
        state: ['', Validators.required],
        district: ['', Validators.required],
        password: [''],
        collegeAddress: ['', Validators.required],
        activeStatus: ['A', Validators.required]
    });

    ngOnInit() {
        this.loadUniversities();
        this.loadColleges();
        this.loadCountries();
        this.loadAllStates();
        this.loadAllDistricts();
    }

    loadColleges() {
        this.collegeService.getAll().subscribe({
            next: (response: any) => {
                const data = response.data || [];
                this.colleges = (Array.isArray(data) ? data : []).map((item: any) => ({
                    collegeId: String(item.colId || ''),
                    collegeName: item.colName || '',
                    collegeCode: item.collegeCode || '',
                    universityId: String(item.universityName || ''),
                    universityName: item.universityName || '',
                    type: item.type || '',
                    principalName: item.principalName || '',
                    telNumber: item.telNumber || '',
                    email: item.email || '',
                    country: String(item.country || ''),
                    state: String(item.state || ''),
                    district: String(item.district || ''),
                    collegeAddress: item.colAddress || '',
                    activeStatus: item.status === 'Y' ? 'Active' : 'Inactive'
                }));
                this.enrichUniversityNames();
                this.filteredColleges = [...this.colleges];
                this.cdr.detectChanges();
            }
        });
    }

    loadUniversities() {
        this.universityService.getAll().subscribe({
            next: (response: any) => {
                const data = Array.isArray(response) ? response : (response.data || []);
                this.universities = data.map((item: any) => ({
                    universityId: String(item.university_id || item.universityId || item.UniversityId || item.id || item.Id || ''),
                    universityName: item.university_name || item.universityName || item.UniversityName || item.name || item.Name || '',
                    universityCode: item.university_code || item.universityCode || item.UniversityCode || '',
                    activeStatus: 'Active'
                }));

                this.enrichUniversityNames();
                this.cdr.detectChanges();
            }
        });
    }

    enrichUniversityNames() {
        this.colleges.forEach(college => {
            const uni = this.universities.find(u => u.universityId == college.universityId);
            college.universityName = uni ? uni.universityName : (college.universityId || 'N/A');
        });
    }

    loadAllStates() {
        this.stateService.getAll().subscribe({
            next: (response: any) => {
                const data = Array.isArray(response) ? response : (response.data || []);
                this.allStates = data.map((item: any) => ({
                    stateId: String(item.stateId || item.StateId || item.state_id || item.id || item.Id || ''),
                    stateName: item.stateName || item.StateName || item.state_name || item.name || item.Name || '',
                    countryId: String(item.countryId || item.CountryId || item.country_id || '')
                }));
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error loading all states', err)
        });
    }

    loadAllDistricts() {
        this.districtService.getAll().subscribe({
            next: (response: any) => {
                const data = Array.isArray(response) ? response : (response.data || []);
                this.allDistricts = data.map((item: any) => ({
                    districtId: String(item.districtId || item.DistrictId || item.district_id || ''),
                    districtName: item.districtName || item.DistrictName || '',
                    stateId: String(item.stateId || item.StateId || item.state_id || '')
                }));
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error loading all districts', err)
        });
    }

    loadCountries() {
        this.adminService.getCountries().subscribe({
            next: (response: any) => {
                const data = Array.isArray(response) ? response : (response.data || []);
                this.countries = data.map((item: any) => ({
                    countryId: item.countryId || item.CountryId || item.country_id || item.id || item.Id || '',
                    countryName: item.countryName || item.CountryName || item.country_name || item.name || item.Name || ''
                }));
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Error loading countries', err)
        });
    }

    onCountryChange() {
        const countryId = this.collegeForm.get('country')?.value;
        this.states = this.allStates.filter(s => s.countryId == countryId);
        this.districts = [];
        this.collegeForm.patchValue({ state: '', district: '' });
        this.cdr.detectChanges();
    }

    onStateChange() {
        const stateId = this.collegeForm.get('state')?.value;
        this.districts = this.allDistricts.filter(d => d.stateId == stateId);
        this.collegeForm.patchValue({ district: '' });
        this.cdr.detectChanges();
    }

    onSearch(event: any) {
        const query = (event.target as HTMLInputElement).value.toLowerCase();
        this.filteredColleges = this.colleges.filter(c =>
            c.collegeName.toLowerCase().includes(query) || 
            c.collegeCode.toLowerCase().includes(query)
        );
    }


    openAddView() {
        this.isEditing = false;
        this.selectedCollege = null;
        this.collegeForm.reset({
            collegeName: '',
            universityId: '',
            collegeCode: '',
            type: '',
            principalName: '',
            telNumber: '',
            email: '',
            country: '',
            state: '',
            district: '',
            password: '',
            collegeAddress: '',
            activeStatus: 'A'
        });
        this.states = [];
        this.districts = [];
        this.showEditView = true;
    }

    openEditView(college: CollegeList) {
        this.isEditing = true;
        this.selectedCollege = college;
        
        // Populate states and districts based on what we have
        if (college.country) {
            this.states = this.allStates.filter(s => s.countryId == college.country);
        } else {
            this.states = [...this.allStates];
        }

        if (college.state) {
            this.districts = this.allDistricts.filter(d => d.stateId == college.state);
        } else if (college.district) {
            // Find parent state if only district is present
            const distObj = this.allDistricts.find(d => d.districtId == college.district);
            if (distObj && distObj.stateId) {
                college.state = distObj.stateId;
                this.districts = this.allDistricts.filter(d => d.stateId == college.state);
                
                // If we found the state, maybe we can find the country too
                const stateObj = this.allStates.find(s => s.stateId == college.state);
                if (stateObj && stateObj.countryId) {
                    college.country = stateObj.countryId;
                    this.states = this.allStates.filter(s => s.countryId == college.country);
                }
            } else {
                this.districts = [...this.allDistricts];
            }
        }

        this.collegeForm.patchValue({
            collegeName: college.collegeName,
            universityId: college.universityId,
            collegeCode: college.collegeCode,
            type: college.type,
            principalName: college.principalName,
            telNumber: college.telNumber,
            email: college.email,
            country: college.country,
            state: college.state,
            district: college.district,
            collegeAddress: college.collegeAddress,
            activeStatus: college.activeStatus === 'Active' ? 'A' : 'D'
        });

        this.showEditView = true;
        this.cdr.detectChanges();
    }

    onCancel() {
        this.showEditView = false;
    }

    onSubmit() {
        if (this.collegeForm.invalid) {
            this.collegeForm.markAllAsTouched();
            return;
        }

        const v = this.collegeForm.value;
        const payload = {
            CollegeId: this.isEditing ? this.selectedCollege?.collegeId : '0',
            CollegeName: v.collegeName,
            UniversityId: v.universityId,
            CollegeCode: v.collegeCode,
            Type: v.type,
            PrincipalName: v.principalName,
            TelNumber: v.telNumber,
            Email: v.email,
            Country: v.country,
            State: v.state,
            District: v.district,
            Password: v.password,
            CollegeAddress: v.collegeAddress,
            Status: v.activeStatus,
            CreatedBy: 'Admin'
        };

        const action = this.isEditing ?
            this.collegeService.update(payload.CollegeId || '', payload) :
            this.collegeService.create(payload);

        action.subscribe({
            next: () => {
                alert(`College ${this.isEditing ? 'updated' : 'saved'} successfully!`);
                this.loadColleges();
                this.showEditView = false;
            },
            error: (err) => alert('Error: ' + (err.error?.message || err.message))
        });
    }
}
