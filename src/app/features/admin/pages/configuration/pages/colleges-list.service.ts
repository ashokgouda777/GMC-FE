import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CollegesListService {
    private api = inject(ApiService);

    getAll(): Observable<any> {
        return this.api.get('MasterData/collegesget');
    }

    create(college: any): Observable<any> {
        return this.api.post('MasterData/college-save', college);
    }

    update(id: string, college: any): Observable<any> {
        // For college-save, the ID is typically in the payload as CollegeId
        return this.api.post('MasterData/college-save', college);
    }

    delete(id: string): Observable<any> {
        // If there's no delete endpoint, we might just update status to 'D'
        // but the user didn't specify a delete endpoint for colleges yet.
        return this.api.get(`MasterData/deletecollege?collegeId=${id}`);
    }
}
