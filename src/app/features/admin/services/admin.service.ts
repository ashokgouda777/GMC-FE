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

    createOrder(amount: number, pid: string, paymentfor: string) {
        return this.api.post(`Payment/CreateOrder?amount=${amount}&pid=${pid}&paymentfor=${paymentfor}`, {});
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

    getPractitioners(registrationFor?: string) {
        const url = registrationFor !== undefined ? `Practitioners/list?registartionfor=${registrationFor}` : 'Practitioners/list';
        return this.api.get(url);
    }

    getPractitionerById(id: string) {
        return this.api.get(`Practitioners/practitioner/${id}`);
    }
    getEducation(practitionerId: string) {
        return this.api.get(`Education/get/${practitionerId}`);
    }

    saveEducation(data: any) {
        return this.api.post('Education/save', data);
    }

    deleteEducation(id: string) {
        return this.api.delete(`Education/delete/${id}`);
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
}
