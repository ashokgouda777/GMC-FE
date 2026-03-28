import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../../core/services/api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class CollegesListService {
    private api = inject(ApiService);

    getAll(): Observable<any> {
        return this.api.get('MasterData/collegesget');
    }

    create(college: any): Observable<any> {
        return this.save(college);
    }

    update(id: string, college: any): Observable<any> {
        return this.save(college);
    }

    private save(college: any): Observable<any> {
        const payload = {
            colId: college.CollegeId || '0',
            colName: college.CollegeName || '',
            colAddress: college.CollegeAddress || '',
            district: college.District || '',
            type: college.Type || '',
            principalName: college.PrincipalName || '',
            telNumber: college.TelNumber || '',
            universityName: college.UniversityId || '',
            email: college.Email || '',
            status: college.Status || 'A',
            userId: college.Email || '',
            password: college.Password || '123456',
            firsttimeLogin: 'Y',
            photo: '',
            usercount: 0,
            country: college.Country || '',
            state: college.State || '',
            collegeCode: college.CollegeCode || ''
        };

        return this.api.post('MasterData/college-save', payload);
    }

    delete(id: string): Observable<any> {
        // If there's no delete endpoint, we might just update status to 'D'
        // but the user didn't specify a delete endpoint for colleges yet.
        return this.api.get(`MasterData/deletecollege?collegeId=${id}`);
    }
}
