import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UniversityListService {
  private api = inject(ApiService);

  getAll(): Observable<any> {
    return this.api.get('MasterData/universitymastersget');
  }

  create(payload: any): Observable<any> {
    return this.api.post('MasterData/universitypost', payload);
  }

  update(id: string, payload: any): Observable<any> {
    return this.api.post('MasterData/universitypost', payload);
  }

  delete(id: string): Observable<any> {
    return this.api.get(`MasterData/deleteuniversity?id=${id}`);
  }

}
