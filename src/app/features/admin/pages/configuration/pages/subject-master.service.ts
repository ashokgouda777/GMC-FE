import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class SubjectMasterService {
    private api = inject(ApiService);

    getAll(): Observable<any> {
        return this.api.get('MasterData/mdssubjectmastersget');
    }

    getCourses(): Observable<any> {
        return this.api.get('MasterData/coursemastersget');
    }

    save(subject: any): Observable<any> {
        return this.api.post('MasterData/mdssubjectmaster-save', subject);
    }
}
