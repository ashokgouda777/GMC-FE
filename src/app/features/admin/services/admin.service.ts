import { Injectable, inject } from '@angular/core';
import { of, Observable } from 'rxjs';
import { delay } from 'rxjs/operators';
import { ApiService } from '../../../core/services/api.service';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class AdminService {
    private api = inject(ApiService);

    getDashboardStats() {
        // Simulate API call
        return of({
            totalPractitioners: 2458
        }).pipe(delay(500));
    }

    createCaseWorker(data: any) {
        return this.api.post('CaseWorkers/create', data);
    }

    getCaseWorkers() {
        return this.api.get('CaseWorkers/list');
    }

    // User Management
    getUsers() {
        return this.api.get('CaseWorkers/list');
    }

    createUser(data: any) {
        return this.api.post('CaseWorkers/create', data);
    }

    getRoles() {
        return this.api.get('RoleMasters/roles');
    }

    getRegistrationTypes() {
        return this.api.get('MasterData/registrationfor');
    }

    getTitles() {
        return this.api.get('MasterData/titlesmaster');
    }

    getGenders() {
        return this.api.get('MasterData/gendermaster');
    }

    getBloodGroups() {
        return this.api.get('MasterData/blodgroupmaster');
    }

    getNationalities() {
        return this.api.get('MasterData/nationalitymaster');
    }

    getEligibility() {
        return this.api.get('MasterData/eligiblity');
    }

    getCountries() {
        return this.api.get('MasterData/countrymaster');
    }

    getStates(countryId?: string) {
        const url = countryId ? `MasterData/statemaster?countryId=${countryId}` : 'MasterData/statemaster';
        return this.api.get(url);
    }

    getDistricts(stateId?: string) {
        const url = stateId ? `MasterData/districtmaster?stateId=${stateId}` : 'MasterData/districtmaster';
        return this.api.get(url);
    }

    getCourses() {
        return this.api.get('MasterData/coursemaster');
    }

    getUniversities() {
        return this.api.get('MasterData/uiniversitys');
    }

    getColleges(universityId: string) {
        return this.api.get(`MasterData/colleges?universityId=${universityId}`);
    }

    getRuralUrbanTypes() {
        // Assuming a master data endpoint exists, or we can hardcode if not.
        return this.api.get('MasterData/ruralurbanmaster');
    }

    getPaymentLedgers() {
        return this.api.get('MasterData/GetLedger');
    }

    createOrder(amount: number, pid: string, paymentfor: string, councilId?: string | null) {
        const url = `Payment/CreateOrder?amount=${amount}&pid=${pid}&paymentfor=${paymentfor}${councilId ? `&councilid=${councilId}` : ''}`;
        return this.api.post(url, {});
    }

    getFinancialYears() {
        return this.api.get('MasterData/financialyear');
    }

    getGroups() {
        return this.api.get('MasterData/cbgroups');
    }

    getAccounts() {
        return this.api.get('MasterData/accounts');
    }

    getReportTypes() {
        return this.api.get('Reports/types');
    }

    getReportGroups() {
        return this.api.get('Reports/groups');
    }

    getGroupLedgerMaster() {
        return this.api.get('MasterData/GetLedgerList');
    }

    getPractitionerMaster(): Observable<any> {
        return this.api.get('MasterData/PractitionerMaster');
    }

    getSiteSettings(userId: string) {
        return this.api.get(`WebsiteConfig/${userId}`);
    }

    updateSiteSettings(data: any) {
        return this.api.post('WebsiteConfig', data);
    }

    createPractitioner(data: any) {
        return this.api.post('Practitioners/create', data);
    }

    updatePractitioner(id: string, data: any) {
        return this.api.put(`Practitioners/update/${id}`, data);
    }

    approvePractitioner(id: string) {
        return this.api.post(`Practitioners/makeperment?practitionerId=${id}`, {});
    }

    uploadPractitionerImage(practitionerId: string, type: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);
        // type: 'photo' | 'sign' | 'thumb'
        return this.api.post(`Practitioners/upload?pid=${practitionerId}&type=${type}`, formData);
    }

    saveAddress(data: any) {
        return this.api.post('Address/save', data);
    }

    generateBarcode(practitionerId: string) {
        return this.api.get(`Practitioners/generatebarcode?pid=${practitionerId}`);
    }

    getAddress(clientId: string, addressType: string) {
        return this.api.get(`Address/getaddress?clientId=${clientId}&addressType=${addressType}`);
    }

    getPractitioners(registrationFor?: string, pageNumber: number = 1, pageSize: number = 10) {
        let url = `Practitioners/list?pageNumber=${pageNumber}&pageSize=${pageSize}`;
        if (registrationFor !== undefined && registrationFor !== null) {
            url += `&registartionfor=${registrationFor}`;
        }
        return this.api.get(url);
    }

    getPractitionerById(id: string) {
        return this.api.get(`Practitioners/practitioner/${id}`);
    }

    searchPractitioners(searchText: string) {
        return this.api.get(`Practitioners/search?searchText=${searchText}`);
    }

    getEducation(practitionerId: string) {
        return this.api.get(`Education/get/${practitionerId}`);
    }

    saveEducation(data: any) {
        return this.api.post('Education/save', data);
    }

    deleteEducation(id: string) {
        return this.api.post(`Education/deleteeducation?educationid=${id}&UpdatedBy=Admin`, {});
    }

    createRenewal(data: any, headers?: HttpHeaders) {
        return this.api.post('Payment/CreateRenewal', data, headers);
    }

    hitPaymentWebhook(data: any) {
        return this.api.post('Payment/Webhook', data);
    }

    getPaymentDetails(practitionerId: string) {
        return this.api.get(`Payment/paymentdetails?pid=${practitionerId}`);
    }

    generateReceipt(receiptNo: string) {
        return this.api.get(`Certificates/GenerateReceipt/${receiptNo}`, undefined, undefined, 'blob');
    }

    printCertificate(rid: string, pid: string) {
        return this.api.get(`Certificates/printcertificate?rid=${rid}&pid=${pid}`, undefined, undefined, 'blob');
    }
    

    getLedgerReport(filters: any) {
        const queryParams = {
            financialYearId: filters.financialYear,
            ledgerId: filters.ledgerName,
            fromDate: filters.fromDate,
            toDate: filters.toDate
        };
        const params = Object.entries(queryParams)
            .filter(([_, value]) => value !== null && value !== undefined && value !== '')
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        
        const url = `Reports/ledger-report${params ? '?' + params : ''}`;
        console.log('Fetching Ledger Report from URL:', url);
        return this.api.get(url);
    }

    generateLedgerReport(filters: any) {
        const queryParams = {
            financialYearId: filters.financialYear,
            ledgerId: filters.ledgerName,
            fromDate: filters.fromDate,
            toDate: filters.toDate
        };
        const params = Object.entries(queryParams)
            .filter(([_, value]) => value !== null && value !== undefined && value !== '')
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        
        const url = `Certificates/GenerateLedgerReport${params ? '?' + params : ''}`;
        console.log('Generating Ledger PDF from URL:', url);
        return this.api.get(url, undefined, undefined, 'blob');
    }

    generateDaybookReport(filters: any) {
        const queryParams = {
            financialYearId: filters.financialYear,
            ledgerId: filters.ledgerName,
            fromDate: filters.fromDate,
            toDate: filters.toDate
        };
        const params = Object.entries(queryParams)
            .filter(([_, value]) => value !== null && value !== undefined && value !== '')
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        
        const url = `Certificates/GenerateDaybookReport${params ? '?' + params : ''}`;
        console.log('Generating Daybook PDF from URL:', url);
        return this.api.get(url, undefined, undefined, 'blob');
    }

    getDaybookReport(filters: any) {
        const queryParams = {
            financialYearId: filters.financialYear,
            ledgerId: filters.ledgerName,
            fromDate: filters.fromDate,
            toDate: filters.toDate
        };
        const params = Object.entries(queryParams)
            .filter(([_, value]) => value !== null && value !== undefined && value !== '')
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        
        const url = `Reports/Daybook-report${params ? '?' + params : ''}`;
        console.log('Fetching Daybook Report from URL:', url);
        return this.api.get(url);
    }

    getRenewalReport(filters: any) {
        const queryParams = {
            financialYearId: filters.financialYear,
            ledgerId: filters.ledgerName,
            fromDate: filters.fromDate,
            toDate: filters.toDate
        };
        const params = Object.entries(queryParams)
            .filter(([_, value]) => value !== null && value !== undefined && value !== '')
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        
        const url = `Reports/renewal-report${params ? '?' + params : ''}`;
        console.log('Fetching Renewal Report from URL:', url);
        return this.api.get(url);
    }

    generateRenewalReport(filters: any) {
        const queryParams = {
            financialYearId: filters.financialYear,
            ledgerId: filters.ledgerName,
            fromDate: filters.fromDate,
            toDate: filters.toDate
        };
        const params = Object.entries(queryParams)
            .filter(([_, value]) => value !== null && value !== undefined && value !== '')
            .map(([key, value]) => `${key}=${value}`)
            .join('&');
        
        const url = `Certificates/GeneraterenewalReport${params ? '?' + params : ''}`;
        console.log('Generating Renewal PDF from URL:', url);
        return this.api.get(url, undefined, undefined, 'blob');
    }

    // Mock Payment Data
    getPayments(practitionerId: string) {
        // Simulating API response based on the image provided
        const mockPayments = [
            {
                paymentId: 'PAY001',
                type: 'Smart Card',
                mode: 'Online',
                receiptNo: '202534508',
                receiptDate: '2026-02-16T00:00:00',
                transactionNo: 'pay_SGn3zsZZneb0sH',
                transactionDate: '2026-02-16T00:00:00',
                bank: '-',
                amount: 236.00,
                certificateIssued: 'No',
                certificateNotIssuedReason: '-',
                certificateNo: '-',
                councilRegistrationDate: '-'
            },
            {
                paymentId: 'PAY002',
                type: 'Registration',
                mode: 'Online',
                receiptNo: '202534506',
                receiptDate: '2026-02-16T00:00:00',
                transactionNo: 'pay_SGmywpznIDTmtZ',
                transactionDate: '2026-02-16T00:00:00',
                bank: '-',
                amount: 500.00,
                certificateIssued: 'Yes',
                certificateNotIssuedReason: '-',
                certificateNo: 'CERT123456',
                councilRegistrationDate: '2026-02-16T00:00:00'
            }
        ];
        return of(mockPayments).pipe(delay(300));
    }

    getPractitionerDocuments(pid: string) {
        return this.api.get(`Practitioners/getdocuments?pid=${pid}`);
    }

    uploadPractitionerDocument(pid: string, type: string, file: File, docName?: string) {
        const formData = new FormData();
        formData.append('file', file);
        
        const url = `Practitioners/uploaddocument?pid=${pid}&DocumentType=${type}${docName ? `&DocumentName=${encodeURIComponent(docName)}` : ''}`;
        return this.api.post(url, formData);
    }

    deletePractitionerDocument(docId: string) {
        return this.api.delete(`Practitioners/deletedocument?docId=${docId}`);
    }

    getAllCertificates() {
        return this.api.get('MasterData/GetAllCertificates');
    }

    getDocumentsForServices(certificateType: string) {
        return this.api.get(`MasterData/Getdocumentsforservices?certificatetype=${certificateType}`);
    }
}
