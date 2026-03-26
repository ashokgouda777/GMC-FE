import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CourseListService {
    private api = inject(ApiService);

    getAll(): Observable<any> {
        return this.api.get('MasterData/coursemastersget');
    }

    save(course: any): Observable<any> {
        return this.api.post('MasterData/coursemaster-save', course);
    }
}
