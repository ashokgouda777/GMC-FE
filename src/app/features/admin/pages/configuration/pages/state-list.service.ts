import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class StateListService {
    private api = inject(ApiService);

    getAll(): Observable<any> {
        return this.api.get('MasterData/statemastersget');
    }

    save(state: any): Observable<any> {
        return this.api.post('MasterData/statemaster-save', state);
    }
}
