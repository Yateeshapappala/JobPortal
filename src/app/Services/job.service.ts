import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class JobsService {
  
  // ✅ NEW BASE URL: The local Angular proxy endpoint
  private apiUrl = '/api/remote-jobs'; 

  constructor(private http: HttpClient) {}

  getJobs(): Observable<any> {
    // Hits: http://localhost:4200/api/remote-jobs?limit=20
    // Proxy forwards to: https://remotive.io/api/remote-jobs?limit=20 with correct headers
    const url = `${this.apiUrl}?limit=20`; 
    console.log("Fetching jobs via local proxy:", url);
    
    return this.http.get<any>(url);
  }

  getJobById(id: string): Observable<any> {
    // Fetch the full job list first, searching within the observable stream
    const url = `${this.apiUrl}?limit=50`; 
    
    return this.http.get<any>(url).pipe(
      map((res: any) => res.jobs.find((job: any) => job.id.toString() === id.toString()))
    );
  }
}