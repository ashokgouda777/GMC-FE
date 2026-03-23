import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../../../core/services/api.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UniversityListService {
  private api = inject(ApiService);

  getAll(): Observable<any> {
    return this.api.get('MasterData/uiniversitys');
  }

  create(payload: any): Observable<any> {
    return this.api.post('MasterData/saveuniversity', payload);
  }

  update(id: string, payload: any): Observable<any> {
    // Assuming the update endpoint takes the ID in the URL or payload
    // Based on create, let's assume saveuniversity handles both or there's an update endpoint
    return this.api.post('MasterData/saveuniversity', payload);
  }

  delete(id: string): Observable<any> {
    // Assuming a delete or deactivate endpoint
    return this.api.get(`MasterData/deleteuniversity?id=${id}`);
  }
}
