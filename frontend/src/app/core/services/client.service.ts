import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { ClientDTO, CreateClientRequest, UpdateClientRequest, Page } from '../models/client.model';
import { WalletDTO } from '../models/wallet.model';

@Injectable({ providedIn: 'root' })
export class ClientService {
  private url = `${environment.apiUrl}/clients`;

  constructor(private http: HttpClient) {}

  list(): Observable<ClientDTO[]> {
    return this.http.get<ClientDTO[]>(this.url);
  }

  search(keyword: string, page: number, size: number): Observable<Page<ClientDTO>> {
    const params = new HttpParams()
      .set('keyword', keyword)
      .set('page', page)
      .set('size', size);
    return this.http.get<Page<ClientDTO>>(`${this.url}/search`, { params });
  }

  get(id: number): Observable<ClientDTO> {
    return this.http.get<ClientDTO>(`${this.url}/${id}`);
  }

  create(request: CreateClientRequest): Observable<ClientDTO> {
    return this.http.post<ClientDTO>(this.url, request);
  }

  update(id: number, request: UpdateClientRequest): Observable<ClientDTO> {
    return this.http.put<ClientDTO>(`${this.url}/${id}`, request);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }

  getAccounts(id: number): Observable<WalletDTO[]> {
    return this.http.get<WalletDTO[]>(`${this.url}/${id}/wallets`);
  }
}
