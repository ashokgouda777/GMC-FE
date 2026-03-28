import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../../core/services/api.service';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';

@Injectable({
    providedIn: 'root'
})
export class DistrictListService {
    private api = inject(ApiService);

    getAll(): Observable<any> {
        return this.api.get('MasterData/districtmastersget');
    }

    save(countryid: string, stateid: string, districname: string, districtId?: string, active?: string): Observable<any> {
        let params = new HttpParams()
            .set('countryid', countryid)
            .set('stateid', stateid)
            .set('districname', districname);

        if (districtId && districtId !== '0' && districtId !== 'undefined') {
            params = params.set('DistrictId', districtId);
        }
        if (active) {
            params = params.set('active', active);
        }

        return this.api.post('MasterData/districtmastersave', {}, undefined, params);
    }
}
