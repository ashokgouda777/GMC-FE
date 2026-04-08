import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CouncilMasterService {
  private api = inject(ApiService);

  getAll(): Observable<any> {
    return this.api.get('MasterData/get-all-councils');
  }

  save(data: any): Observable<any> {
    return this.api.post('MasterData/save-council', data);
  }
}
