import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  WalletDTO, ActiveWalletDTO, StashWalletDTO,
  CreateActiveWalletRequest, CreateStashWalletRequest,
  DebitRequest, CreditRequest, TransferRequest
} from '../models/wallet.model';
import { AccountHistoryDTO, LedgerEntryDTO } from '../models/ledger-entry.model';
import { Page } from '../models/client.model';

@Injectable({ providedIn: 'root' })
export class AccountService {
  private url = `${environment.apiUrl}/wallets`;

  constructor(private http: HttpClient) {}

  list(): Observable<WalletDTO[]> {
    return this.http.get<WalletDTO[]>(this.url);
  }

  search(keyword: string, page: number, size: number): Observable<Page<WalletDTO>> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page)
      .set('size', size);
    return this.http.get<Page<WalletDTO>>(`${this.url}/search`, { params });
  }

  get(id: string): Observable<WalletDTO> {
    return this.http.get<WalletDTO>(`${this.url}/${id}`);
  }

  createCurrent(request: CreateActiveWalletRequest): Observable<ActiveWalletDTO> {
    return this.http.post<ActiveWalletDTO>(`${this.url}/current`, request);
  }

  createSaving(request: CreateStashWalletRequest): Observable<StashWalletDTO> {
    return this.http.post<StashWalletDTO>(`${this.url}/saving`, request);
  }

  ledgerEntries(id: string): Observable<LedgerEntryDTO[]> {
    return this.http.get<LedgerEntryDTO[]>(`${this.url}/${id}/ledgerEntries`);
  }

  history(id: string, page: number, size: number): Observable<AccountHistoryDTO> {
    const params = new HttpParams().set('page', page).set('size', size);
    return this.http.get<AccountHistoryDTO>(`${this.url}/${id}/pageOperations`, { params });
  }

  debit(request: DebitRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/debit`, request);
  }

  credit(request: CreditRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/credit`, request);
  }

  transfer(request: TransferRequest): Observable<void> {
    return this.http.post<void>(`${this.url}/transfer`, request);
  }
}
