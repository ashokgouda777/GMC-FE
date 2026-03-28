import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private http = inject(HttpClient);
    private apiUrl = environment.apiUrl;

    get<T>(path: string, params?: HttpParams, headers?: HttpHeaders, responseType: any = 'json'): Observable<T> {
        return this.http.get<T>(`${this.apiUrl}/${path}`, { params, headers, responseType });
    }

    post<T>(path: string, body: any, headers?: HttpHeaders, params?: HttpParams, responseType: any = 'json'): Observable<T> {
        return this.http.post<T>(`${this.apiUrl}/${path}`, body, { headers, params, responseType });
    }

    put<T>(path: string, body: any, headers?: HttpHeaders): Observable<T> {
        return this.http.put<T>(`${this.apiUrl}/${path}`, body, { headers });
    }

    delete<T>(path: string, headers?: HttpHeaders): Observable<T> {
        return this.http.delete<T>(`${this.apiUrl}/${path}`, { headers });
    }
}
