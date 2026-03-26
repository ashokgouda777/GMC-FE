import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class CountryMasterService {
    private api = inject(ApiService);

    getAll(): Observable<any> {
        return this.api.get('MasterData/countrymastersget');
    }

    save(country: any): Observable<any> {
        return this.api.post('MasterData/countrymaster-save', country);
    }
}
