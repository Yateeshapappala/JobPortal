import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class JobsService {
  private apiUrl = 'https://remotive.com/api/remote-jobs';

  constructor(private http: HttpClient) {}

  getJobs() {
    return this.http.get(this.apiUrl);
  }
}

