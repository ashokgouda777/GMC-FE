import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class NationalityMasterService {
    private api = inject(ApiService);

    getAll(): Observable<any> {
        return this.api.get('MasterData/nationalitymastersget');
    }

    save(nationality: any): Observable<any> {
        return this.api.post('MasterData/nationality-save', nationality);
    }
}
