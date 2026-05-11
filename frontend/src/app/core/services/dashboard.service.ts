import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  DashboardStatsDTO,
  MonthlyOperationStatsDTO,
  AccountTypeStatsDTO,
  AccountStatusStatsDTO
} from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private url = `${environment.apiUrl}/dashboard`;

  constructor(private http: HttpClient) {}

  stats(): Observable<DashboardStatsDTO> {
    return this.http.get<DashboardStatsDTO>(`${this.url}/stats`);
  }

  monthlyOperations(): Observable<MonthlyOperationStatsDTO[]> {
    return this.http.get<MonthlyOperationStatsDTO[]>(`${this.url}/monthly-ledgerEntries`);
  }

  accountTypeStats(): Observable<AccountTypeStatsDTO[]> {
    return this.http.get<AccountTypeStatsDTO[]>(`${this.url}/account-types`);
  }

  accountStatusStats(): Observable<AccountStatusStatsDTO[]> {
    return this.http.get<AccountStatusStatsDTO[]>(`${this.url}/account-statuses`);
  }
}
