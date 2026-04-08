import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { Subject, debounceTime, distinctUntilChanged } from 'rxjs';
import { AdminService } from '../../services/admin.service';
import { PractitionerSidebarComponent } from '../../components/practitioner-sidebar/practitioner-sidebar.component';

@Component({
    selector: 'app-users-management',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, RouterModule, PractitionerSidebarComponent],
    templateUrl: './users-management.component.html',
    styleUrl: './users-management.component.scss'
})
export class UsersManagementComponent implements OnInit {
    private fb = inject(FormBuilder);
    private adminService = inject(AdminService);
    private cdr = inject(ChangeDetectorRef);
    private route = inject(ActivatedRoute);
    private router = inject(Router);

    activeSection = 'Practitioner';
    showAddForm = false;
    
    // Approval Modal State
    showApprovalModal = false;
    selectedUserForApproval: any = null;
    
    // Pagination State
    totalRecords = 0;
    currentPage = 1;
    pageSize = 100;
    totalPages = 0;

    // Dropdown Data
    registrationForOptions: any[] = [];
    titleOptions: any[] = [];
    genderOptions: any[] = [];
    bloodGroupOptions: any[] = [];
    nationalityOptions: any[] = [];
    eligibilityOptions: any[] = [];

    private searchSubject = new Subject<string>();

    practitionerForm: FormGroup = this.fb.group({
        registrationFor: ['', Validators.required],
        isAlreadyRegistered: [false],
        oldRegNo: [''],
        oldRegDate: [''],
        title: ['', Validators.required],
        name: ['', Validators.required],
        gender: ['', Validators.required],
        bloodGroup: ['', Validators.required],
        changeOfName: [''],
        fatherName: ['', Validators.required],
        birthDate: ['', Validators.required],
        birthPlace: ['', Validators.required],
        nationality: ['', Validators.required],
        eligibility: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]]
    });

    constructor() {
        this.practitionerForm.get('isAlreadyRegistered')?.valueChanges.subscribe(checked => {
            const regNoControl = this.practitionerForm.get('oldRegNo');
            const regDateControl = this.practitionerForm.get('oldRegDate');
            if (checked) {
                regNoControl?.setValidators([Validators.required]);
                regDateControl?.setValidators([Validators.required]);
            } else {
                regNoControl?.clearValidators();
                regDateControl?.clearValidators();
                regNoControl?.setValue('');
                regDateControl?.setValue('');
            }
            regNoControl?.updateValueAndValidity();
            regDateControl?.updateValueAndValidity();
        });
    }

    users: any[] = [];
    filteredUsers: any[] = [];

    setActiveSection(section: string) {
        this.activeSection = section;
        this.showAddForm = false;
        this.currentPage = 1;
        this.loadPractitioners();
    }

    onSearch(event: any) {
        const query = event.target.value;
        this.searchSubject.next(query);
    }

    performSearch(query: string) {
        if (!query || query.trim() === '') {
            this.loadPractitioners();
            return;
        }

        this.adminService.searchPractitioners(query).subscribe({
            next: (response: any) => {
                console.log('Search API Response:', response);
                // The search API might return a direct array or a paginated response.
                // Based on common patterns, if it's a search, it might just return results.
                this.users = response.data || response || [];
                this.filteredUsers = [...this.users];
                this.totalRecords = this.users.length;
                this.totalPages = 1; // Search results often bypass pagination or return first page
                this.currentPage = 1;
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Search failed', err);
                this.users = [];
                this.filteredUsers = [];
                this.cdr.detectChanges();
            }
        });
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.practitionerForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    isEditing = false;
    currentPractitionerId: any = null;
    approvingId: any = null;

    ngOnInit() {
        this.route.queryParams.subscribe(params => {
            const section = params['section'];
            if (section) {
                this.setActiveSection(section);
            } else {
                this.setActiveSection('Practitioner');
            }
        });

        this.searchSubject.pipe(
            debounceTime(500),
            distinctUntilChanged()
        ).subscribe(query => {
            this.performSearch(query);
        });

        this.loadRegistrationTypes();
        this.loadTitles();
        this.loadGenders();
        this.loadBloodGroups();
        this.loadNationalities();
        this.loadEligibility();
    }

    loadPractitioners() {
        // Corrected Explicit Mapping: PRC=0, Practitioner (Permanent)=1, FMG=2
        let regFor: string | undefined = undefined;
        if (this.activeSection === 'Practitioner') regFor = '1';
        else if (this.activeSection === 'PRC') regFor = '0';
        else if (this.activeSection === 'FMG') regFor = '2';

        this.adminService.getPractitioners(regFor, this.currentPage, this.pageSize).subscribe({
            next: (response: any) => {
                console.log('Practitioner API Response:', response);
                this.users = response.data || [];
                this.totalRecords = response.totalRecords || 0;
                this.totalPages = response.totalPages || 0;
                this.filteredUsers = [...this.users];
                this.cdr.detectChanges();
            },
            error: (err) => console.error('Failed to load practitioners', err)
        });
    }

    onPageChange(page: number) {
        if (page >= 1 && page <= this.totalPages) {
            this.currentPage = page;
            this.loadPractitioners();
        }
    }

    mathMin(a: number, b: number): number {
        return Math.min(a, b);
    }

    getPages(): number[] {
        const pages = [];
        const start = Math.max(1, this.currentPage - 2);
        const end = Math.min(this.totalPages, start + 4);
        const actualStart = Math.max(1, end - 4);
        
        for (let i = actualStart; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    }

    loadNationalities() {
        this.adminService.getNationalities().subscribe({
            next: (data: any) => {
                this.nationalityOptions = Array.isArray(data) ? data : (data?.result || []);
                this.setDefaults();
            },
            error: (err) => console.error('Failed to load nationalities', err)
        });
    }

    loadEligibility() {
        this.adminService.getEligibility().subscribe((data: any) => {
            this.eligibilityOptions = Array.isArray(data) ? data : (data?.result || []);
            this.setDefaults();
        });
    }
    loadBloodGroups() {
        this.adminService.getBloodGroups().subscribe((data: any) => this.bloodGroupOptions = Array.isArray(data) ? data : (data?.result || []));
    }
    loadGenders() {
        this.adminService.getGenders().subscribe((data: any) => this.genderOptions = Array.isArray(data) ? data : (data?.result || []));
    }
    loadTitles() {
        this.adminService.getTitles().subscribe((data: any) => this.titleOptions = Array.isArray(data) ? data : (data?.result || []));
    }
    loadRegistrationTypes() {
        this.adminService.getRegistrationTypes().subscribe((data: any) => this.registrationForOptions = Array.isArray(data) ? data : (data?.result || []));
    }

    onEdit(user: any) {
        this.isEditing = true;
        this.currentPractitionerId = user.practitionerID || user.id || user.practitionerId;
        this.showAddForm = true;

        this.practitionerForm.patchValue({
            registrationFor: String(user.registrationType || ''),
            title: user.title || '',
            name: user.name,
            gender: user.gender,
            bloodGroup: user.bloodGroup,
            changeOfName: user.changeOfName || '',
            fatherName: user.spouseName || '', 
            birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
            birthPlace: user.birthPlace || '',
            nationality: user.nationality || '',
            eligibility: user.vote || '', 
            email: user.emailID || '',
            mobile: user.mobileNumber || '',
            isAlreadyRegistered: !!user.registrationNo && user.registrationNo !== '',
            oldRegNo: user.registrationNo || '',
            oldRegDate: user.registrationDate ? user.registrationDate.split('T')[0] : ''
        });
    }

    onApprove(user: any) {
        this.selectedUserForApproval = user;
        this.showApprovalModal = true;
    }

    cancelApproval() {
        this.showApprovalModal = false;
        this.selectedUserForApproval = null;
    }

    confirmApproval() {
        if (!this.selectedUserForApproval) return;
        const user = this.selectedUserForApproval;
        const id = user.practitionerID || user.id || user.practitionerId;
        this.approvingId = id;
        this.showApprovalModal = false;

        this.adminService.approvePractitioner(id).subscribe({
            next: () => {
                alert(`${user.name} is now permanent!`);
                this.approvingId = null;
                this.selectedUserForApproval = null;
                this.loadPractitioners();
            },
            error: (err) => {
                console.error('Operation failed:', err);
                let errorMessage = 'Failed to make permanent.';
                if (err.error) {
                    errorMessage = typeof err.error === 'string' ? err.error : (err.error.message || JSON.stringify(err.error));
                }
                alert(errorMessage);
                this.approvingId = null;
            }
        });
    }

    onSubmit() {
        if (this.practitionerForm.valid) {
            const formValue = this.practitionerForm.value;
            const payload = {
                practitionerID: this.isEditing ? String(this.currentPractitionerId) : "0",
                countryId: "1", stateId: "1", councilId: "1",
                registrationNo: formValue.isAlreadyRegistered ? formValue.oldRegNo : "",
                registrationType: String(formValue.registrationFor || ""),
                title: String(this.titleOptions.find(t => t.titleId == formValue.title)?.titleName || formValue.title || ""),
                name: formValue.name,
                changeOfName: formValue.changeOfName || "",
                spouseName: formValue.fatherName,
                birthDate: new Date(formValue.birthDate).toISOString(),
                birthPlace: formValue.birthPlace,
                gender: String(formValue.gender || ""),
                nationality: String(formValue.nationality || ""),
                vote: String(formValue.eligibility || ""),
                emailID: formValue.email,
                mobileNumber: formValue.mobile,
                bloodGroup: String(formValue.bloodGroup || ""),
                createdBy: "Admin",
                registrationDate: formValue.isAlreadyRegistered ? new Date(formValue.oldRegDate).toISOString() : null,
                registrationFor: String(formValue.registrationFor || ""),
                status: "1"
            };

            const request$ = this.isEditing
                ? this.adminService.updatePractitioner(String(this.currentPractitionerId), payload)
                : this.adminService.createPractitioner(payload);

            request$.subscribe({
                next: () => {
                    alert(`Practitioner ${this.isEditing ? 'Updated' : 'Registered'} Successfully!`);
                    this.toggleAddForm();
                    this.loadPractitioners();
                },
                error: (err) => {
                    console.error('Save failed:', err);
                    let errorMessage = 'Failed to save practitioner.';
                    if (err.error) {
                        errorMessage = typeof err.error === 'string' ? err.error : (err.error.message || JSON.stringify(err.error));
                    } else if (err.message) {
                        errorMessage = err.message;
                    }
                    alert(errorMessage);
                }
            });
        } else {
            this.practitionerForm.markAllAsTouched();
        }
    }

    toggleAddForm() {
        this.showAddForm = !this.showAddForm;
        if (!this.showAddForm) {
            this.isEditing = false;
            this.currentPractitionerId = null;
            this.practitionerForm.reset({
                title: '', registrationFor: '',
                bloodGroup: '', nationality: '', eligibility: '',
                isAlreadyRegistered: false
            });
            this.filteredUsers = [...this.users];
        } else {
            if (!this.isEditing) {
                this.setDefaults();
            }
        }
    }

    setDefaults() {
        if (this.isEditing) return;

        // Corrected Explicit Mapping: PRC=0, Practitioner (Permanent)=1, FMG=2
        if (this.activeSection === 'Practitioner') {
            this.practitionerForm.patchValue({ registrationFor: '1' });
        } else if (this.activeSection === 'PRC') {
            this.practitionerForm.patchValue({ registrationFor: '0' });
        } else if (this.activeSection === 'FMG') {
            this.practitionerForm.patchValue({ registrationFor: '2' });
        }

        const indian = this.nationalityOptions.find(n => n.nationality?.toLowerCase() === 'indian');
        if (indian) this.practitionerForm.patchValue({ nationality: indian.nationalityId });

        const eligible = this.eligibilityOptions.find(e => e.eligibilty?.toLowerCase().includes('eligible'));
        if (eligible) this.practitionerForm.patchValue({ eligibility: eligible.eligibiltyId });
    }
}
