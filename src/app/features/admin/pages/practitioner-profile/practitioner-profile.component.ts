import { Component, inject, OnInit, OnDestroy, ChangeDetectorRef, ViewChild, ElementRef } from '@angular/core';
import { HttpHeaders } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AdminService } from '../../services/admin.service';
import { PractitionerSidebarComponent } from '../../components/practitioner-sidebar/practitioner-sidebar.component';
import { FingerprintService } from '../../../../core/services/fingerprint.service';
import { WacomService } from '../../../../core/services/wacom.service';
import { SignatureService } from '../../../../core/services/signature.service';
import { environment } from '../../../../../environments/environment';


@Component({
    selector: 'app-practitioner-profile',
    standalone: true,
    imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, PractitionerSidebarComponent],
    templateUrl: './practitioner-profile.component.html',
    styleUrl: './practitioner-profile.component.scss'
})
export class PractitionerProfileComponent implements OnInit, OnDestroy {
    @ViewChild('videoElement') videoElement!: ElementRef<HTMLVideoElement>;
    @ViewChild('canvasElement') canvasElement!: ElementRef<HTMLCanvasElement>;
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    private route = inject(ActivatedRoute);
    private adminService = inject(AdminService);

    private cdr = inject(ChangeDetectorRef);
    private fb = inject(FormBuilder);
    private fingerprintService = inject(FingerprintService);
    private wacomService = inject(WacomService);
    private signatureService = inject(SignatureService);
    private sanitizer = inject(DomSanitizer);

    practitionerId: string | null = null;
    practitioner: any = null;
    activeTab: string = 'Personal';

    // State Flags
    isEditing = false;
    isAddingEducation = false;
    isAddingPayment = false;
    isAddingDocument = false;
    isAddingAddress = false;
    isCapturingThumb = false;
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
        mobile: ['', [Validators.required, Validators.pattern('^[0-9]{10}$')]],

        // Residential Address
        resAddress1: [''],
        resAddress2: [''],
        resCity: [''],
        resRuralUrban: [''],
        resCountry: [''],
        resState: [''],
        resDistrict: [''],
        resPinCode: [''],
        resPhone1: [''],
        resPhone2: [''],

        // Professional Address
        isProSameAsRes: [false],
        profAddress1: [''],
        profAddress2: [''],
        profCity: [''],
        profRuralUrban: [''],
        profCountry: [''],
        profState: [''],
        profDistrict: [''],
        profPinCode: [''],
        profPhone1: [''],
        profPhone2: ['']
    });

    // Payment Form
    paymentForm = this.fb.group({
        financialYear: ['', Validators.required],
        group: ['', Validators.required],
        account: ['', Validators.required],
        paymentFor: ['', Validators.required],
        bank: [''],
        ddNo: [''],
        ddDate: [''],
        amount: ['', Validators.required]
    });

    documentForm = this.fb.group({
        certificateId: ['', Validators.required],
        file: [null, Validators.required]
    });

    // Mock Options for Payment Form
    financialYearOptions: any[] = [];
    groupOptions: any[] = [];
    accountOptions: any[] = [];
    paymentForOptions = ['Registration', 'Smart Card', 'Renewal', 'Good Standing Certificate'];
    ledgerOptions: any[] = [];
    registrationForOptions: any[] = [];
    certificatesData: any[] = [];
    titleOptions: any[] = [];
    genderOptions: any[] = [];
    bloodGroupOptions: any[] = [];
    nationalityOptions: any[] = [];
    eligibilityOptions: any[] = [];

    // Address Options (Cascading)
    countryOptions: any[] = [];

    resStateOptions: any[] = [];
    resDistrictOptions: any[] = [];

    profStateOptions: any[] = [];
    profDistrictOptions: any[] = [];

    ruralUrbanOptions: any[] = [];

    // Fingerprint
    readers: string[] = [];
    selectedReader: string = '';

    constructor() {
        // Validation logic for conditional fields
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

        // "Same as Residential" Logic
        this.practitionerForm.get('isProSameAsRes')?.valueChanges.subscribe(checked => {
            if (checked) {
                const val = this.practitionerForm.value;
                this.practitionerForm.patchValue({
                    profAddress1: val.resAddress1,
                    profAddress2: val.resAddress2,
                    profCity: val.resCity,
                    profRuralUrban: val.resRuralUrban,
                    profCountry: val.resCountry,
                    profState: val.resState,
                    profDistrict: val.resDistrict,
                    profPinCode: val.resPinCode,
                    profPhone1: val.resPhone1,
                    profPhone2: val.resPhone2
                });
                this.disableProfessionalFields(true);
            } else {
                this.disableProfessionalFields(false);
            }
        });

        // Initialize Years
        const currentYear = new Date().getFullYear();
        for (let i = currentYear; i >= 1950; i--) {
            this.years.push(i);
        }

        // Handle Dynamic Documents based on Certificate Selection
        this.documentForm.get('certificateId')?.valueChanges.subscribe(value => {
            if (value) {
                const selectedCert = this.certificatesData.find(c => c.id == value);
                const certificateType = selectedCert ? selectedCert.typeid : 'R'; // Fallback to 'R' if not found

                this.adminService.getDocumentsForServices(certificateType).subscribe({
                    next: (data: any) => {
                        this.dynamicDocuments = Array.isArray(data) ? data : [];
                        this.selectedDynamicFiles = {}; // Reset selections
                        this.cdr.detectChanges();
                    },
                    error: (err) => {
                        console.error('Failed to load dynamic documents', err);
                        this.dynamicDocuments = [];
                    }
                });
            } else {
                this.dynamicDocuments = [];
                this.selectedDynamicFiles = {};
            }
        });
    }

    setupAddressListeners() {
        // Residential Country -> State
        this.practitionerForm.get('resCountry')?.valueChanges.subscribe(countryId => {
            this.resStateOptions = [];
            this.resDistrictOptions = [];
            if (countryId) {
                this.isLoadingContactInfo = true;
                this.loadingCount++;
                this.adminService.getStates(countryId).subscribe({
                    next: (data: any) => {
                        this.resStateOptions = Array.isArray(data) ? data : (data?.result || []);
                        this.loadingCount--;
                        this.checkLoadingStatus();
                    },
                    error: () => {
                        this.loadingCount--;
                        this.checkLoadingStatus();
                    }
                });
            }
        });

        // Residential State -> District
        this.practitionerForm.get('resState')?.valueChanges.subscribe(stateId => {
            this.resDistrictOptions = [];
            if (stateId) {
                this.isLoadingContactInfo = true;
                this.loadingCount++;
                this.adminService.getDistricts(stateId).subscribe({
                    next: (data: any) => {
                        this.resDistrictOptions = Array.isArray(data) ? data : (data?.result || []);
                        this.loadingCount--;
                        this.checkLoadingStatus();
                    },
                    error: () => {
                        this.loadingCount--;
                        this.checkLoadingStatus();
                    }
                });
            }
        });

        // Professional Country -> State
        this.practitionerForm.get('profCountry')?.valueChanges.subscribe(countryId => {
            this.profStateOptions = [];
            this.profDistrictOptions = [];
            if (countryId) {
                this.isLoadingContactInfo = true;
                this.loadingCount++;
                this.adminService.getStates(countryId).subscribe({
                    next: (data: any) => {
                        this.profStateOptions = Array.isArray(data) ? data : (data?.result || []);
                        this.loadingCount--;
                        this.checkLoadingStatus();
                    },
                    error: () => {
                        this.loadingCount--;
                        this.checkLoadingStatus();
                    }
                });
            }
        });

        // Professional State -> District
        this.practitionerForm.get('profState')?.valueChanges.subscribe(stateId => {
            this.profDistrictOptions = [];
            if (stateId) {
                this.isLoadingContactInfo = true;
                this.loadingCount++;
                this.adminService.getDistricts(stateId).subscribe({
                    next: (data: any) => {
                        this.profDistrictOptions = Array.isArray(data) ? data : (data?.result || []);
                        this.loadingCount--;
                        this.checkLoadingStatus();
                    },
                    error: () => {
                        this.loadingCount--;
                        this.checkLoadingStatus();
                    }
                });
            }
        });
    }

    setActiveTab(tab: string) {
        this.activeTab = tab;
        this.isEditing = false;
        this.isAddingEducation = false;
        this.isAddingPayment = false;
        this.isAddingDocument = false;

        if (tab === 'Educational' && this.practitionerId) {
            this.loadEducation(this.practitionerId);
        } else if (tab === 'Payments' && this.practitionerId) {
            this.loadPayments(this.practitionerId);
            this.loadPaymentLedgers();
            this.loadFinancialYears();
            this.loadGroups();
            this.loadAccounts();
        } else if (tab === 'Documents' && this.practitionerId) {
            this.loadDocuments(this.practitionerId);
            this.loadCertificates();
        }
    }

    ngOnInit() {
        this.practitionerId = this.route.snapshot.paramMap.get('id');
        if (this.practitionerId) {
            this.loadPractitionerDetails(this.practitionerId);
            this.loadRegistrationTypes();
            this.loadTitles();
            this.loadGenders();
            this.loadBloodGroups();
            this.loadNationalities();
            this.loadEligibility();
            this.loadRuralUrbanTypes();
            this.loadCountries();

            // Populate years for education form
            const currentYear = new Date().getFullYear();
            for (let i = currentYear; i >= 1950; i--) {
                this.years.push(i);
            }

            // Initial setup for cascading dropdowns
            this.setupAddressListeners();

            // Fingerprint Initialization
            this.fingerprintService.getReaders().then(list => {
                this.readers = list;
                if (list.length > 0) {
                    this.selectedReader = list[0];
                }
            });

            this.subToFingerprint();
            this.subToWacom();
        }
    }

    private isWacomProcessing = false;

    subToWacom() {
        this.wacomService.signatureImage.subscribe(img => {
            if (img === 'ERROR:SERVICE_NOT_RUNNING') {
                console.warn('Wacom SigCaptX Service not found. Attempting STU (WASM) fallback...');
                this.onCaptureWacomSTU();
            } else if (img === 'ERROR:INVALID_LICENSE') {
                console.error('Wacom License validation failed.');
                alert('Wacom License Key rejected. Please check your configuration in environment.ts.');
                this.isWacomProcessing = false;
            } else if (img) {
                this.updatePractitionerImage('signature', img);
                this.isWacomProcessing = false;
                this.cdr.detectChanges();
            }
        });
    }

    onCaptureWacomSignature() {
        if (this.isWacomProcessing) {
            console.log('Wacom capture already in progress. Ignoring request.');
            return;
        }

        if (!environment.wacomLicenseKey) {
            alert('Capture blocked: No license key configured in environment.ts');
            return;
        }

        this.isWacomProcessing = true;
        console.log('Initiating Wacom capture flow (SigCaptX/ActiveX first)...');

        // Try the preferred SigCaptX/ActiveX method first (removes watermark)
        this.wacomService.captureSignature()
            .catch(error => {
                console.error('Wacom primary capture failed:', error);
                // If it fails immediately (e.g. throw in captureSignature), fallback manually
                this.onCaptureWacomSTU();
            });
    }

    onCaptureWacomSTU() {
        console.log('Starting Wacom STU (WASM) fallback capture...');
        this.signatureService.captureFromSTU(undefined, undefined)
            .then(base64 => {
                this.updatePractitionerImage('signature', base64);
                this.isWacomProcessing = false;
                this.cdr.detectChanges();
            })
            .catch(error => {
                console.error('Wacom STU fallback capture error:', error);
                this.isWacomProcessing = false;
                if (error !== "Cancelled") {
                    alert('Signature capture failed. Please ensure the Wacom device is connected.');
                }
            });
    }


    subToFingerprint() {
        this.fingerprintService.onSamplesAcquired.subscribe(s => {
            const samples = JSON.parse(s.samples);
            this.updatePractitionerImage('thumbImpression', "data:image/png;base64," + Fingerprint.b64UrlTo64(samples[0]));
            this.isCapturingThumb = false;
            this.cdr.detectChanges();
        });

        this.fingerprintService.onDeviceConnected.subscribe(e => {
            console.log('Reader connected', e);
            this.fingerprintService.getReaders().then(list => this.readers = list);
        });

        this.fingerprintService.onDeviceDisconnected.subscribe(e => {
            console.log('Reader disconnected', e);
            this.fingerprintService.getReaders().then(list => this.readers = list);
        });
    }

    onStartThumbCapture() {
        if (this.readers.length === 0) {
            alert('No fingerprint reader detected. Please connect a reader and try again.');
            this.fingerprintService.getReaders().then(list => this.readers = list);
            return;
        }

        if (!this.selectedReader) {
            alert('Please select a fingerprint reader first.');
            return;
        }

        // Robustness: Stop any existing acquisition before starting
        this.fingerprintService.stopCapture().catch(() => { }).finally(() => {
            this.isCapturingThumb = true;
            this.cdr.detectChanges();
            this.fingerprintService.startCapture(this.selectedReader).then(() => {
                console.log('Fingerprint capture started');
            }).catch(err => {
                console.error('Failed to start fingerprint capture', err);
                this.isCapturingThumb = false;
                this.cdr.detectChanges();
                alert('Failed to start capture: ' + err);
            });
        });
    }

    onStopThumbCapture() {
        this.fingerprintService.stopCapture().then(() => {
            this.isCapturingThumb = false;
            this.cdr.detectChanges();
            console.log('Fingerprint capture stopped');
        }).catch(err => {
            console.error('Failed to stop fingerprint capture', err);
            this.isCapturingThumb = false;
            this.cdr.detectChanges();
        });
    }

    ngOnDestroy() {
        this.fingerprintService.stopCapture().catch(() => { });
    }

    loadPractitionerDetails(id: string) {
        this.adminService.getPractitionerById(id).subscribe({
            next: (pData: any) => {
                if (pData) {
                    const clean = (val: any) => (val === null || val === undefined || val === '-' || val === 'null' || val === '1' || val === 1) ? '' : val;
                    
                    // Map 'sign' to 'signature' and 'thumb' to 'thumbImpression' for template consistency
                    if (pData.sign && !pData.signature) {
                        pData.signature = pData.sign;
                    }
                    if (pData.thumb && !pData.thumbImpression) {
                        pData.thumbImpression = this.sanitizer.bypassSecurityTrustUrl(pData.thumb);
                    }

                    // Sanitize potential placeholder IDs
                    pData.countryId = clean(pData.countryId);
                    pData.stateId = clean(pData.stateId);
                    pData.professionalCountryId = clean(pData.professionalCountryId);
                    pData.professionalStateId = clean(pData.professionalStateId);

                    this.practitioner = pData;
                    this.loadPractitionerAddress(id);
                    this.cdr.detectChanges();
                }
            },
            error: (err) => console.error('Failed to load practitioner details', err)
        });
    }

    loadPractitionerAddress(id: string) {
        // Fetch Residential
        this.adminService.getAddress(id, 'R').subscribe({
            next: (res: any) => {
                if (res) {
                    this.mapAddressToPractitioner(res, 'R');
                }
            },
            error: (err) => console.log('No Residential Address found or error', err)
        });

        // Fetch Professional
        this.adminService.getAddress(id, 'P').subscribe({
            next: (res: any) => {
                if (res) {
                    this.mapAddressToPractitioner(res, 'P');
                }
            },
            error: (err) => console.log('No Professional Address found or error', err)
        });
    }

    mapAddressToPractitioner(address: any, type: 'R' | 'P') {
        const isRes = type === 'R';
        const cleanStr = (val: any) => (val === null || val === undefined || val === '-' || val === 'null' || val === '1' || val === 1) ? '' : val;

        // Update Practitioner Object for View Mode
        if (this.practitioner) {
            if (isRes) {
                this.practitioner.residentialAddress1 = address.address1;
                this.practitioner.residentialAddress2 = address.address2;
                this.practitioner.residentialCity = address.city;
                this.practitioner.residentialRuralUrban = address.placeType;
                // Prefer Name if available for display, populateForm will resolve ID
                this.practitioner.countryId = cleanStr(address.countryName || address.country);
                this.practitioner.stateId = cleanStr(address.stateName || address.state);
                this.practitioner.districtId = cleanStr(address.districtName || address.district);
                this.practitioner.residentialZipCode = address.zip;
                this.practitioner.residentialMobile1 = address.phone1;
                this.practitioner.residentialMobile2 = address.phone2;
            } else {
                this.practitioner.professionalAddress1 = address.address1;
                this.practitioner.professionalAddress2 = address.address2;
                this.practitioner.professionalCity = address.city;
                this.practitioner.professionalRuralUrban = address.placeType;
                this.practitioner.professionalCountryId = cleanStr(address.countryName || address.country);
                this.practitioner.professionalStateId = cleanStr(address.stateName || address.state);
                this.practitioner.professionalDistrictId = cleanStr(address.districtName || address.district);
                this.practitioner.professionalZipCode = address.zip;
                this.practitioner.professionalMobile1 = address.phone1;
                this.practitioner.professionalMobile2 = address.phone2;
            }
        }

        // If editing, update form values
        // Note: populateForm handles the initial patch, but if address comes later, we patch here.
        // Or we rely on populateForm being called AFTER address load if user clicks edit later.
        // Ideally, we store these in a separate variable if 'practitioner' is overwritten? 
        // But here we are mutating 'this.practitioner', so populateForm should pick it up.
        this.cdr.detectChanges();
    }

    toggleEditMode() {
        this.isEditing = !this.isEditing;
        if (this.isEditing && this.practitioner) {
            this.populateForm(this.practitioner);
        }
    }

    isLoadingContactInfo = false;
    private loadingCount = 0;

    private checkLoadingStatus() {
        if (this.loadingCount <= 0) {
            this.loadingCount = 0;
            this.isLoadingContactInfo = false;
            this.cdr.detectChanges();
        }
    }

    populateForm(user: any) {
        this.isLoadingContactInfo = true;
        this.loadingCount = 0;

        // Helper to find ID by Name or ID
        const findId = (options: any[], key: string, valKey: string, userVal: any) => {
            if (!userVal || userVal === '-' || userVal === 'null' || userVal === '1' || userVal === 1) return '';
            const found = options.find(o => o[key] == userVal || o[valKey] == userVal); // Loose equality for string/number match
            return found ? found[key] : ''; // Fallback to empty if not found in options
        };

        const clean = (val: any) => (val === null || val === undefined || val === '-' || val === 'null' || val === '1' || val === 1) ? '' : val;

        // Reg Type
        let regTypeId = user.registrationType;
        if (!regTypeId && user.registrationFor) {
            const foundOption = this.registrationForOptions.find(opt => opt.registrationfor === user.registrationFor);
            if (foundOption) regTypeId = foundOption.regid;
        }

        // Map other text values to IDs
        const titleId = findId(this.titleOptions, 'titleId', 'titleName', user.title);
        const genderId = findId(this.genderOptions, 'genderId', 'genderName', user.gender);
        const bloodGroupId = findId(this.bloodGroupOptions, 'bloodGroupCode', 'bloodGroupDescription', user.bloodGroup);
        const nationalityId = findId(this.nationalityOptions, 'nationalityId', 'nationality', user.nationality);
        const eligibilityId = findId(this.eligibilityOptions, 'eligibiltyId', 'eligibilty', user.vote);

        this.practitionerForm.patchValue({
            registrationFor: regTypeId || '',
            title: titleId,
            name: clean(user.name),
            gender: genderId,
            bloodGroup: bloodGroupId,
            changeOfName: clean(user.changeOfName),
            fatherName: clean(user.spouseName),
            birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
            birthPlace: clean(user.birthPlace),
            nationality: nationalityId,
            eligibility: eligibilityId,
            email: clean(user.emailID),
            mobile: clean(user.mobileNumber),
            isAlreadyRegistered: !!user.registrationNo && user.registrationNo !== '',
            oldRegNo: clean(user.registrationNo),
            oldRegDate: user.registrationDate ? user.registrationDate.split('T')[0] : '',

            // Address Fields (Mapping)
            // Residential
            resAddress1: clean(user.residentialAddress1),
            resAddress2: clean(user.residentialAddress2),
            resCity: clean(user.residentialCity),
            resRuralUrban: clean(user.residentialRuralUrban),
            resCountry: findId(this.countryOptions, 'countryId', 'countryName', user.countryId),
            // State & District patched async below
            resPinCode: clean(user.residentialZipCode),
            resPhone1: clean(user.residentialMobile1),
            resPhone2: clean(user.residentialMobile2),

            // Professional
            isProSameAsRes: false,
            profAddress1: clean(user.professionalAddress1),
            profAddress2: clean(user.professionalAddress2),
            profCity: clean(user.professionalCity),
            profRuralUrban: clean(user.professionalRuralUrban),
            profCountry: findId(this.countryOptions, 'countryId', 'countryName', user.professionalCountryId || user.countryId),
            // State & District patched async below
            profPinCode: clean(user.professionalZipCode),
            profPhone1: clean(user.professionalMobile1),
            profPhone2: clean(user.professionalMobile2)
        });

        // Load Residential States if Country is present
        if (user.countryId) {
            const countryId = findId(this.countryOptions, 'countryId', 'countryName', user.countryId);
            if (countryId) {
                this.loadingCount++;
                this.adminService.getStates(countryId).subscribe({
                    next: (states: any) => {
                        this.resStateOptions = Array.isArray(states) ? states : (states?.result || []);
                        const stateVal = findId(this.resStateOptions, 'stateId', 'stateName', user.stateId);
                        this.practitionerForm.patchValue({ resState: stateVal });

                        if (stateVal) {
                            this.loadingCount++;
                            this.adminService.getDistricts(stateVal).subscribe({
                                next: (districts: any) => {
                                    this.resDistrictOptions = Array.isArray(districts) ? districts : (districts?.result || []);
                                    const distVal = findId(this.resDistrictOptions, 'districtId', 'districtName', user.districtId);
                                    this.practitionerForm.patchValue({ resDistrict: distVal });
                                    this.loadingCount--;
                                    this.checkLoadingStatus();
                                },
                                error: () => {
                                    this.loadingCount--;
                                    this.checkLoadingStatus();
                                }
                            });
                        }
                        this.loadingCount--;
                        this.checkLoadingStatus();
                    },
                    error: () => {
                        this.loadingCount--;
                        this.checkLoadingStatus();
                    }
                });
            }
        }

        // Load Professional States if Country is present
        const profCountryIdRaw = user.professionalCountryId || user.countryId;
        if (profCountryIdRaw) {
            const profCountryId = findId(this.countryOptions, 'countryId', 'countryName', profCountryIdRaw);

            if (profCountryId) {
                this.loadingCount++;
                this.adminService.getStates(profCountryId).subscribe({
                    next: (states: any) => {
                        this.profStateOptions = Array.isArray(states) ? states : (states?.result || []);
                        const stateVal = findId(this.profStateOptions, 'stateId', 'stateName', user.professionalStateId || user.stateId);
                        this.practitionerForm.patchValue({ profState: stateVal });

                        if (stateVal) {
                            this.loadingCount++;
                            this.adminService.getDistricts(stateVal).subscribe({
                                next: (districts: any) => {
                                    this.profDistrictOptions = Array.isArray(districts) ? districts : (districts?.result || []);
                                    const distVal = findId(this.profDistrictOptions, 'districtId', 'districtName', user.professionalDistrictId || user.districtId);
                                    this.practitionerForm.patchValue({ profDistrict: distVal });
                                    this.loadingCount--;
                                    this.checkLoadingStatus();
                                },
                                error: () => {
                                    this.loadingCount--;
                                    this.checkLoadingStatus();
                                }
                            });
                        }
                        this.loadingCount--;
                        this.checkLoadingStatus();
                    },
                    error: () => {
                        this.loadingCount--;
                        this.checkLoadingStatus();
                    }
                });
            }
        }

        // Initial check in case no async calls were needed
        this.checkLoadingStatus();
    }

    isFieldInvalid(fieldName: string): boolean {
        const field = this.practitionerForm.get(fieldName);
        return !!(field && field.invalid && (field.dirty || field.touched));
    }

    onSubmit() {
        if (!this.practitionerForm.valid || !this.practitionerId) {
            this.practitionerForm.markAllAsTouched();
            return;
        }

        const formValue = this.practitionerForm.getRawValue();

        if (this.activeTab === 'Contact') {
            const commonAddressData = {
                clientID: this.practitionerId, // assuming clientID maps to practitionerId
                createdBy: "Admin"
            };

            const residentialPayload = {
                ...commonAddressData,
                addressType: "R", // Residential
                address1: formValue.resAddress1,
                address2: formValue.resAddress2,
                city: formValue.resCity,
                district: String(formValue.resDistrict || ""),
                state: String(formValue.resState || ""),
                zip: formValue.resPinCode,
                country: String(formValue.resCountry || ""),
                phone1: formValue.resPhone1,
                phone2: formValue.resPhone2,
                placeType: formValue.resRuralUrban // User note: 'pass residential as R and profestional as P', 'placeType' usually maps to Rural/Urban here
            };

            const professionalPayload = {
                ...commonAddressData,
                addressType: "P", // Professional
                address1: formValue.profAddress1 || formValue.resAddress1, // Fallback if strictly empty and copied logic failed somehow
                address2: formValue.profAddress2 || formValue.resAddress2,
                city: formValue.profCity,
                district: String(formValue.profDistrict || ""),
                state: String(formValue.profState || ""),
                zip: formValue.profPinCode,
                country: String(formValue.profCountry || ""),
                phone1: formValue.profPhone1,
                phone2: formValue.profPhone2,
                placeType: formValue.profRuralUrban
            };

            // Execute both save calls
            // Using a simple forkJoin-like approach or sequential calls. Sequential for simplicity since we don't have RxJS forkJoin imported
            // But we can import it. Let's do sequential for now to avoid altering imports too much unless needed.

            this.adminService.saveAddress(residentialPayload).subscribe({
                next: () => {
                    this.adminService.saveAddress(professionalPayload).subscribe({
                        next: () => {
                            alert('Address Information Saved Successfully!');
                            this.isEditing = false;
                            this.loadPractitionerAddress(this.practitionerId!);
                        },
                        error: (err) => {
                            console.error('Failed to save Professional Address', err);
                            alert('Residential Address saved, but failed to save Professional Address.');
                        }
                    });
                },
                error: (err) => {
                    console.error('Failed to save Residential Address', err);
                    alert('Failed to save Address Information.');
                }
            });

        } else if (this.activeTab === 'Personal') {
            const payload = {
                councilId: "1",
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
                registrationFor: String(formValue.registrationFor || "0"),
                status: "1"
            };

            this.adminService.updatePractitioner(this.practitionerId, payload).subscribe({
                next: (res) => {
                    alert('Practitioner Updated Successfully!');
                    this.isEditing = false;
                    this.loadPractitionerDetails(this.practitionerId!);
                },
                error: (err) => {
                    console.error('Update Failed:', err);
                    alert('Failed to update practitioner.');
                }
            });
        }
    }

    // Dropdown Loaders

    loadAccounts() {
        this.adminService.getAccounts().subscribe({
            next: (data: any) => {
                this.accountOptions = Array.isArray(data) ? data : (data?.result || []);
                // Set default account if nothing is selected or if we want to force latest
                if (this.accountOptions.length > 0 && !this.paymentForm.get('account')?.value) {
                    this.paymentForm.patchValue({ account: this.accountOptions[this.accountOptions.length - 1].account });
                }
            },
            error: (err) => console.error('Failed to load accounts', err)
        });
    }

    loadGroups() {
        this.adminService.getGroups().subscribe({
            next: (data: any) => {
                this.groupOptions = Array.isArray(data) ? data : (data?.result || []);
                // Set default group if nothing is selected or if we want to force latest
                if (this.groupOptions.length > 0 && !this.paymentForm.get('group')?.value) {
                    this.paymentForm.patchValue({ group: this.groupOptions[this.groupOptions.length - 1].account });
                }
            },
            error: (err) => console.error('Failed to load groups', err)
        });
    }

    loadFinancialYears() {
        this.adminService.getFinancialYears().subscribe({
            next: (data: any) => {
                this.financialYearOptions = Array.isArray(data) ? data : (data?.result || []);
                // Set default year if nothing is selected or if we want to force latest
                if (this.financialYearOptions.length > 0 && !this.paymentForm.get('financialYear')?.value) {
                    this.paymentForm.patchValue({ financialYear: this.financialYearOptions[this.financialYearOptions.length - 1].years });
                }
            },
            error: (err) => console.error('Failed to load financial years', err)
        });
    }

    loadEligibility() { this.adminService.getEligibility().subscribe(data => this.eligibilityOptions = Array.isArray(data) ? data : []); }
    loadBloodGroups() { this.adminService.getBloodGroups().subscribe(data => this.bloodGroupOptions = Array.isArray(data) ? data : []); }
    loadGenders() { this.adminService.getGenders().subscribe(data => this.genderOptions = Array.isArray(data) ? data : []); }
    loadTitles() { this.adminService.getTitles().subscribe(data => this.titleOptions = Array.isArray(data) ? data : []); }
    loadRegistrationTypes() { this.adminService.getRegistrationTypes().subscribe(data => this.registrationForOptions = Array.isArray(data) ? data : []); }
    loadNationalities() { this.adminService.getNationalities().subscribe((data: any) => this.nationalityOptions = Array.isArray(data) ? data : (data?.result || [])); }

    loadCountries() { this.adminService.getCountries().subscribe((data: any) => this.countryOptions = Array.isArray(data) ? data : (data?.result || [])); }
    loadRuralUrbanTypes() { this.adminService.getRuralUrbanTypes().subscribe((data: any) => this.ruralUrbanOptions = Array.isArray(data) ? data : (data?.result || [])); }

    disableProfessionalFields(disable: boolean) {
        const fields = ['profAddress1', 'profAddress2', 'profCity', 'profRuralUrban', 'profCountry', 'profState', 'profDistrict', 'profPinCode', 'profPhone1', 'profPhone2'];
        fields.forEach(f => {
            const control = this.practitionerForm.get(f);
            disable ? control?.disable() : control?.enable();
        });
    }

    // Education Logic
    educationList: any[] = [];
    editingEducationId: string | null = null;

    educationForm = this.fb.group({
        degree: ['', Validators.required],
        courseName: [''],
        otherSubject: [''],
        passMonth: ['', Validators.required],
        passYear: ['', Validators.required],
        university: [''], // Name of the University
        college: ['', Validators.required], // Name of the College Studied
        certificateNo: [''],
        certificateDate: ['']
    });

    years: number[] = [];
    months = [
        { name: 'January', value: '01' }, { name: 'February', value: '02' }, { name: 'March', value: '03' },
        { name: 'April', value: '04' }, { name: 'May', value: '05' }, { name: 'June', value: '06' },
        { name: 'July', value: '07' }, { name: 'August', value: '08' }, { name: 'September', value: '09' },
        { name: 'October', value: '10' }, { name: 'November', value: '11' }, { name: 'December', value: '12' }
    ];

    courseOptions: any[] = [];
    universityOptions: any[] = [];
    collegeOptions: any[] = [];

    loadEducationMasterData() {
        this.adminService.getCourses().subscribe({
            next: (data: any) => {
                this.courseOptions = Array.isArray(data) ? data : (data?.result || []);
            },
            error: (err) => console.error('Failed to load courses', err)
        });

        this.adminService.getUniversities().subscribe({
            next: (data: any) => {
                this.universityOptions = Array.isArray(data) ? data : (data?.result || []);
            },
            error: (err) => console.error('Failed to load universities', err)
        });
    }

    onUniversityChange() {
        const universityId = this.educationForm.get('university')?.value;
        if (!universityId) {
            this.collegeOptions = [];
            return;
        }

        this.adminService.getColleges(universityId).subscribe({
            next: (data: any) => {
                this.collegeOptions = Array.isArray(data) ? data : (data?.result || []);
            },
            error: (err) => console.error('Failed to load colleges', err)
        });
    }

    toggleAddEducation() {
        this.isAddingEducation = !this.isAddingEducation;
        this.editingEducationId = null;
        this.educationForm.reset();
        this.collegeOptions = []; // Reset colleges
    }

    editEducation(edu: any) {
        this.isAddingEducation = true;
        this.editingEducationId = edu.educationID; // Use educationID from new API response

        this.educationForm.patchValue({
            degree: edu.subCode, // Maps to ID
            courseName: edu.subject, // Maps to subject
            otherSubject: edu.otherSubject,
            passMonth: edu.monthOfPassing,
            passYear: edu.yearOfPassing,
            university: edu.universityId, // Maps to ID
            // college: edu.collegeID, // Will be patched after loading options
            certificateNo: edu.certificateNo,
            certificateDate: edu.certificateDate ? new Date(edu.certificateDate).toISOString().split('T')[0] : ''
        });

        // Trigger college load and set value
        if (edu.universityId) {
            this.adminService.getColleges(edu.universityId).subscribe({
                next: (data: any) => {
                    this.collegeOptions = Array.isArray(data) ? data : (data?.result || []);
                    this.educationForm.patchValue({ college: edu.collegeID });
                },
                error: (err) => console.error('Failed to load colleges for edit', err)
            });
        }
    }

    deleteEducation(id: string) {
        if (confirm('Are you sure you want to delete this educational record?')) {
            this.adminService.deleteEducation(id).subscribe({
                next: () => {
                    alert('Record deleted successfully');
                    window.location.reload();
                },
                error: (err) => {
                    console.error('Delete failed', err);
                    alert('Failed to delete record');
                }
            });
        }
    }

    saveEducation() {
        if (this.educationForm.invalid) {
            this.educationForm.markAllAsTouched();
            return;
        }

        const formVal = this.educationForm.value;

        const selectedCourse = this.courseOptions.find(c => c.courseId === formVal.degree);
        const educationName = selectedCourse ? selectedCourse.courseDescription : '';

        const payload = {
            educationID: this.editingEducationId || "",
            practitionerID: this.practitionerId,
            educationName: educationName,
            yearOfPassing: formVal.passYear,
            collegeID: formVal.college,
            universityId: formVal.university,
            subject: formVal.courseName,
            monthOfPassing: formVal.passMonth,
            subCode: formVal.degree,
            createdBy: 'Admin',
            certificateNo: formVal.certificateNo,
            certificateDate: formVal.certificateDate
        };

        if (payload.certificateDate) {
            payload.certificateDate = new Date(payload.certificateDate).toISOString();
        }

        this.adminService.saveEducation(payload).subscribe({
            next: () => {
                alert(this.editingEducationId ? 'Education updated successfully' : 'Education added successfully');
                this.toggleAddEducation();
                this.loadEducation(this.practitionerId!);
            },
            error: (err) => {
                console.error('Save failed', err);
                alert('Failed to save education details');
            }
        });
    }

    loadEducation(practitionerId: string) {
        this.loadEducationMasterData(); // Ensure master data is loaded
        this.adminService.getEducation(practitionerId).subscribe({
            next: (data: any) => {
                // New Response is array of objects directly
                const apiData = Array.isArray(data) ? data : (data?.result || []);

                if (apiData.length > 0) {
                    this.educationList = apiData.map((item: any) => ({
                        ...item,
                        // Map fields for UI display if needed, though *ngFor uses item properties directly.
                        // Ensure logic uses `educationID` (capital ID) vs `educationId` (camelCase)
                        educationId: item.educationID,
                        degree: item.subCode, // Used for edit lookup, but display might need name?
                        // Ideally we want to display Names in the list.
                        // But if we only have IDs in subCode/universityId, we need to map them to names using Options arrays 
                        // OR the API response `educationName` / `universityName` / `colName`.
                        // The provided response HAS `educationName`, `universityName`, `colName`.
                        degreeName: item.educationName, // Display Name
                        universityName: item.universityName,
                        collegeName: item.colName,
                        courseName: item.subject,
                        certificateNo: item.certificateNo,
                        certificateDate: item.certificateDate,
                        convertedDate: (item.monthOfPassing || item.yearOfPassing) ? 
                            `${this.months.find(m => m.value === item.monthOfPassing)?.name || ''} ${item.yearOfPassing || ''}`.trim() : '-'
                    }));
                } else {
                    this.educationList = [];
                }
                this.cdr.detectChanges(); // Force UI update
            },
            error: (err) => {
                console.error('Failed to load education', err);
                this.educationList = [];
            }
        });
    }

    // Payment History
    paymentList: any[] = [];

    loadPayments(practitionerId: string) {
        this.adminService.getPaymentDetails(practitionerId).subscribe({
            next: (data: any) => {
                const apiData = Array.isArray(data) ? data : (data?.result || []);
                this.paymentList = apiData.map((item: any) => {
                    const rawName = item.ledgerDescription || item.feeItemname || item.type || '';
                    const displayName = rawName.toLowerCase().includes('certificate') ? rawName : rawName + ' Certificate';
                    return {
                        ...item,
                        displayName: displayName,
                        type: item.type, // "Online" / "Off line"
                        mode: item.mode,
                        ledgerDescription: item.ledgerDescription,
                        feeItemName: item.feeItemName,
                        receiptNo: item.receiptNo || item.receiptNumber,
                        receiptDate: item.receiptDate,
                        transactionNo: item.transactionNo,
                        transactionDate: item.transactionDate,
                        bank: item.bank,
                        amount: item.amount,
                        issueDate: item.certificateDate,
                        certificateNo: item.certificateNo,
                        certificateIssued: item.certificateIssued,
                        councilRegistrationDate: item.councilRegistrationDate
                    };
                });
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load payments', err);
                this.paymentList = [];
            }
        });
    }

    loadPaymentLedgers() {
        this.adminService.getPaymentLedgers().subscribe({
            next: (data: any) => {
                this.ledgerOptions = data || [];
            },
            error: (err) => {
                console.error('Failed to load payment ledgers', err);
            }
        });
    }

    onLedgerChange() {
        const ledgerId = this.paymentForm.get('paymentFor')?.value;
        const selectedLedger = this.ledgerOptions.find(l => l.ledgerID === ledgerId);
        if (selectedLedger) {
            this.paymentForm.patchValue({
                amount: selectedLedger.feeAmount
            });
        }
    }

    // Payment Actions
    toggleAddPayment() {
        this.isAddingPayment = !this.isAddingPayment;
        if (this.isAddingPayment) {
            // Keep existing values for financialYear, group, and account if already set by loaders
            this.paymentForm.patchValue({
                paymentFor: '',
                bank: '',
                ddNo: '',
                ddDate: '',
                amount: ''
            });

            // If options are empty (unlikely if loaders worked), trigger them again
            if (this.financialYearOptions.length === 0) this.loadFinancialYears();
            if (this.groupOptions.length === 0) this.loadGroups();
            if (this.accountOptions.length === 0) this.loadAccounts();
        }
    }

    savePayment() {
        if (this.paymentForm.invalid) {
            this.paymentForm.markAllAsTouched();
            return;
        }

        const formVal = this.paymentForm.value;
        const currentDateTime = new Date().toISOString();

        // Find fee item name if possible
        const selectedLedger = this.ledgerOptions.find(l => l.ledgerID === formVal.paymentFor);
        const feeItemName = selectedLedger ? (selectedLedger.ledgerName || selectedLedger.feeItemname || formVal.paymentFor) : formVal.paymentFor;

        const payload = {
            practitionerID: this.practitionerId,
            type: formVal.paymentFor,
            receiptNumber: "", // Backend generated or not provided
            groupID: String(this.groupOptions.find(g => g.account === formVal.group)?.groupID || "0"),
            accountNo: formVal.account, // Mapping account name/code as provided in form
            financial_Year: formVal.financialYear,
            receiptDate: currentDateTime,
            feeItemname: String(feeItemName),
            renewalDate: currentDateTime,
            validUpto: currentDateTime, // Logic for validUpto (e.g., +5 years) can be added here if needed
            amount: String(formVal.amount),
            paymentFor: formVal.paymentFor,
            bank: formVal.bank || "",
            dD_ChequeNO: formVal.ddNo || "",
            dD_ChequeDate: formVal.ddDate ? new Date(formVal.ddDate).toISOString() : currentDateTime,
            createdBy: "Admin"
        };

        console.log('Saving Renewal Payment:', payload);

        // Custom headers as per user request
        const headers = new HttpHeaders({
            'pId': String(this.practitionerId)
            // Add other headers here if needed
        });

        this.adminService.createRenewal(payload, headers).subscribe({
            next: (res) => {
                console.log('Payment Saved:', res);
                alert('Payment details saved successfully');
                this.toggleAddPayment();
                this.loadPayments(this.practitionerId!);
            },
            error: (err) => {
                console.error('Failed to save payment', err);
                alert('Failed to save payment details');
            }
        });
    }

    getRegistrationTypeName(id: any): string {
        if (!id) return '-';
        const type = this.registrationForOptions.find(opt => opt.regid == id);
        return type ? type.registrationfor : id;
    }

    // Photo & Signature Logic
    isCameraOpen = false;
    currentUploadType: 'photo' | 'signature' | 'thumb' = 'photo';
    stream: MediaStream | null = null;

    triggerFileUpload(type: 'photo' | 'signature' | 'thumb') {
        this.currentUploadType = type;
        this.fileInput.nativeElement.click();
    }

    onFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                this.updatePractitionerImage(this.currentUploadType, e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }

    async openCamera(type: 'photo' | 'signature' | 'thumb') {
        this.currentUploadType = type;
        this.isCameraOpen = true;

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({ video: true });
            // Wait for modal to render content
            setTimeout(() => {
                if (this.videoElement) {
                    this.videoElement.nativeElement.srcObject = this.stream;
                }
            }, 100);
        } catch (err) {
            console.error('Error accessing camera:', err);
            alert('Could not access camera. Please check permissions.');
            this.isCameraOpen = false;
        }
    }

    capturePhoto() {
        if (this.videoElement && this.canvasElement) {
            const video = this.videoElement.nativeElement;
            const canvas = this.canvasElement.nativeElement;

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;

            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const dataUrl = canvas.toDataURL('image/jpeg');
                this.updatePractitionerImage(this.currentUploadType, dataUrl);
                this.closeCamera();
            }
        }
    }

    closeCamera() {
        if (this.stream) {
            this.stream.getTracks().forEach(track => track.stop());
            this.stream = null;
        }
        this.isCameraOpen = false;
    }

    saveImage(type: 'photo' | 'signature' | 'thumb' | 'barcode' | 'thumbImpression') {
        if (!this.practitionerId) return;

        // Map UI type to API expected type
        let apiType: string = type;
        if (type === 'signature') apiType = 'sign';
        if (type === 'thumbImpression') apiType = 'thumb';

        let dataUrl = '';
        if (type === 'photo') dataUrl = this.practitioner?.photo;
        else if (type === 'signature') dataUrl = this.practitioner?.signature;
        else if (type === 'thumb' || type === 'thumbImpression') {
            dataUrl = this.practitioner?._thumbImpressionRaw || this.practitioner?.thumb;
            // If thumb came from API (pData.thumb), it might not be in _thumbImpressionRaw.
            // But we only save if it's a new capture usually. 
            // If it's a URL from API, it should not be "saved" again as a blob unless changed.
        }
        else if (type === 'barcode') {
            // Barcode might not be uploadable via this API or needs specific handling.
            // For now, if no API support for barcode upload via this endpoint, we skip or handle differently.
            // Assuming this API is only for photo, sign, thumb as per request.
            alert('Save functionality for Barcode is not yet supported via this upload API.');
            return;
        }

        if (!dataUrl || !dataUrl.startsWith('data:image')) {
            alert('No image data found to save or image is not in valid format.');
            return;
        }

        try {
            const imageBlob = this.dataURItoBlob(dataUrl);
            const imageFile = new File([imageBlob], `${type}_${this.practitionerId}.jpg`, { type: 'image/jpeg' });

            console.log(`Uploading ${type} as ${apiType}...`);

            this.adminService.uploadPractitionerImage(this.practitionerId, apiType, imageFile).subscribe({
                next: (res) => {
                    console.log(`${type} uploaded successfully`, res);
                    alert(`${type} saved successfully!`);
                },
                error: (err) => {
                    console.error(`Failed to upload ${type}`, err);
                    alert(`Failed to save ${type}. Please try again.`);
                }
            });
        } catch (e) {
            console.error('Error converting image data:', e);
            alert('Error processing image data.');
        }
    }

    dataURItoBlob(dataURI: string) {
        const byteString = atob(dataURI.split(',')[1]);
        const mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
            ia[i] = byteString.charCodeAt(i);
        }
        return new Blob([ab], { type: mimeString });
    }

    updatePractitionerImage(type: string, dataUrl: string) {
        if (!this.practitioner) this.practitioner = {};

        if (type === 'photo') {
            this.practitioner.photo = dataUrl;
        } else if (type === 'signature') {
            this.practitioner.signature = dataUrl;
        } else if (type === 'thumb' || type === 'thumbImpression') {
            this.practitioner.thumbImpression = this.sanitizer.bypassSecurityTrustUrl(dataUrl);
            // Also keep original dataUrl for saving
            this.practitioner._thumbImpressionRaw = dataUrl;
        }

        // Use a dummy save/update call if needed, or just update local state for preview
        this.cdr.detectChanges();
    }

    generateBarcode() {
        if (!this.practitionerId) return;

        this.adminService.generateBarcode(this.practitionerId).subscribe({
            next: (res: any) => {
                console.log('Barcode generated:', res);
                alert(res.message || 'Barcode generated successfully');
                // Reload all related details to ensure everything is synchronized
                this.loadPractitionerDetails(this.practitionerId!);
                this.loadEducation(this.practitionerId!);
                this.loadPayments(this.practitionerId!);
            },
            error: (err) => {
                console.error('Failed to generate barcode', err);
                alert('Failed to generate barcode.');
            }
        });
    }

    openBarcodeDetails() {
        if (!this.practitionerId) {
            alert('Practitioner ID is missing.');
            return;
        }
        const url = `https://localhost:44377/PractitionerView?pid=${this.practitionerId}`;
        window.open(url, '_blank');
    }

    generateReceipt(receiptNo: string) {
        if (!receiptNo) {
            alert('Receipt Number is missing.');
            return;
        }

        this.adminService.generateReceipt(receiptNo).subscribe({
            next: (blob: any) => {
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
            },
            error: (err) => {
                console.error('Failed to generate receipt', err);
                alert('Failed to generate receipt. Please try again.');
            }
        });
    }

    printCertificate(rid: string) {
        if (!rid || !this.practitionerId) {
            alert('Missing parameters for certificate printing.');
            return;
        }

        this.adminService.printCertificate(rid, this.practitionerId).subscribe({
            next: (blob: any) => {
                const url = window.URL.createObjectURL(blob);
                window.open(url, '_blank');
            },
            error: (err) => {
                console.error('Failed to print certificate', err);
                alert('Failed to generate certificate.');
            }
        });
    }

    captureThumb() {
        this.onStartThumbCapture();
    }

    // Document Management
    documentList: any[] = [];
    selectedDocFile: File | null = null;
    dynamicDocuments: any[] = [];
    selectedDynamicFiles: { [id: string]: File } = {};

    loadDocuments(pid: string) {
        this.adminService.getPractitionerDocuments(pid).subscribe({
            next: (data: any) => {
                this.documentList = data?.data || [];
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load documents', err);
                this.documentList = [];
            }
        });
    }

    loadCertificates() {
        this.adminService.getAllCertificates().subscribe({
            next: (data: any) => {
                this.certificatesData = Array.isArray(data) ? data : (data?.result || []);
                this.cdr.detectChanges();
            },
            error: (err) => {
                console.error('Failed to load certificates', err);
            }
        });
    }

    toggleAddDocument() {
        this.isAddingDocument = !this.isAddingDocument;
        if (!this.isAddingDocument) {
            this.documentForm.reset();
            this.selectedDocFile = null;
            this.dynamicDocuments = [];
            this.selectedDynamicFiles = {};
        }
    }

    onDocumentFileSelected(event: any) {
        const file = event.target.files[0];
        if (file) {
            this.selectedDocFile = file;
            this.documentForm.patchValue({ file: file });
        }
    }

    onDynamicFileSelected(event: any, docId: string) {
        const file = event.target.files[0];
        if (file) {
            this.selectedDynamicFiles[docId] = file;
            // If we have dynamic docs, the main 'file' control might not be needed for validation
            // but we can set it to any value to satisfy Validators.required if needed.
            if (Object.keys(this.selectedDynamicFiles).length > 0) {
                this.documentForm.get('file')?.setValue(file as any);
            }
        }
    }

    saveDocument() {
        if (this.documentForm.invalid || !this.practitionerId) {
            this.documentForm.markAllAsTouched();
            return;
        }

        const { certificateId } = this.documentForm.value;
        const selectedCert = this.certificatesData.find(c => c.id == certificateId);
        const docNameBase = selectedCert ? selectedCert.name : 'Unknown';

        // Check if we have dynamic documents to upload
        if (this.dynamicDocuments.length > 0) {
            const uploads = this.dynamicDocuments
                .filter(doc => this.selectedDynamicFiles[doc.id])
                .map(doc => {
                    const file = this.selectedDynamicFiles[doc.id];
                    const docType = doc.docdetailes;
                    const docName = docNameBase; // Pass selected certificate name as DocumentName
                    return this.adminService.uploadPractitionerDocument(this.practitionerId!, docType, file, docName);
                });

            if (uploads.length === 0) {
                alert('Please select at least one file to upload.');
                return;
            }

            forkJoin(uploads).subscribe({
                next: () => {
                    alert('All selected documents uploaded successfully');
                    this.toggleAddDocument();
                    this.loadDocuments(this.practitionerId!);
                },
                error: (err) => {
                    console.error('One or more uploads failed', err);
                    alert('Some documents failed to upload. Please check and try again.');
                }
            });
        } else {
            // Fallback to single file upload
            if (!this.selectedDocFile) {
                alert('Please select a file to upload.');
                return;
            }
            const docType = docNameBase;
            const docName = docNameBase;

            this.adminService.uploadPractitionerDocument(this.practitionerId, docType!, this.selectedDocFile, docName!).subscribe({
                next: () => {
                    alert('Document uploaded successfully');
                    this.toggleAddDocument();
                    this.loadDocuments(this.practitionerId!);
                },
                error: (err) => {
                    console.error('Upload failed', err);
                    alert('Failed to upload document');
                }
            });
        }
    }

    deleteDocument(docId: string) {
        if (confirm('Are you sure you want to delete this document?')) {
            this.adminService.deletePractitionerDocument(docId).subscribe({
                next: () => {
                    alert('Document deleted successfully');
                    this.loadDocuments(this.practitionerId!);
                },
                error: (err) => {
                    console.error('Delete failed', err);
                    alert('Failed to delete document');
                }
            });
        }
    }
}
