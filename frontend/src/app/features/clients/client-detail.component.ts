import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ClientService } from '../../core/services/client.service';
import { ClientDTO } from '../../core/models/client.model';
import { WalletDTO } from '../../core/models/wallet.model';
import { fadeInUp, listStagger } from '../../shared/animations';

@Component({
  selector: 'app-client-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, MatCardModule, MatChipsModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  animations: [fadeInUp, listStagger],
  template: `
    <div class="page-container" [@fadeInUp]>
      <a mat-button routerLink="/clients" style="margin-bottom:16px;display:inline-flex;align-items:center">
        <mat-icon>arrow_back</mat-icon> Back to Clients
      </a>

      <div *ngIf="loading" class="text-center py-5"><mat-spinner style="margin:0 auto"></mat-spinner></div>

      <ng-container *ngIf="!loading && client">
        <mat-card class="mb-4">
          <mat-card-header>
            <mat-card-title>{{ client.name }}</mat-card-title>
            <mat-card-subtitle>{{ client.email }}</mat-card-subtitle>
          </mat-card-header>
          <mat-card-content style="padding-top:16px">
            <p><strong>ID:</strong> {{ client.id }}</p>
          </mat-card-content>
        </mat-card>

        <h2 style="margin-bottom:16px">Bank Accounts ({{ wallets.length }})</h2>

        <div *ngIf="wallets.length === 0" class="empty-state">
          <mat-icon>account_balance_wallet</mat-icon>
          <div class="empty-title">No wallets yet</div>
          <div class="empty-subtitle">This client hasn't been assigned any bank wallets.</div>
        </div>

        <div class="row g-3" [@listStagger]="wallets.length">
          <div class="col-md-6" *ngFor="let acc of wallets">
            <mat-card>
              <mat-card-content>
                <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
                  <div>
                    <div style="font-size:.8rem;color:#777;font-family:monospace">{{ acc.id }}</div>
                    <mat-chip-set>
                      <mat-chip [color]="acc.type === 'ActiveWallet' ? 'primary' : 'accent'" highlighted>
                        {{ acc.type === 'ActiveWallet' ? 'Current' : 'Saving' }}
                      </mat-chip>
                      <mat-chip [color]="acc.status === 'ACTIVATED' ? 'primary' : 'warn'" highlighted>
                        {{ acc.status }}
                      </mat-chip>
                    </mat-chip-set>
                  </div>
                  <div style="text-align:right">
                    <div style="font-size:1.4rem;font-weight:700">{{ acc.balance | currency:'MAD':'symbol':'1.2-2' }}</div>
                    <a mat-stroked-button color="primary" [routerLink]="['/wallets', acc.id]">View</a>
                  </div>
                </div>
              </mat-card-content>
            </mat-card>
          </div>
        </div>
      </ng-container>
    </div>
  `
})
export class ClientDetailComponent implements OnInit {
  loading = true;
  client: ClientDTO | null = null;
  wallets: WalletDTO[] = [];

  constructor(
    private route: ActivatedRoute,
    private clientService: ClientService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.clientService.get(id).subscribe({
      next: c => {
        this.client = c;
        this.clientService.getAccounts(id).subscribe({
          next: accs => { this.wallets = accs; this.loading = false; },
          error: () => { this.loading = false; }
        });
      },
      error: () => { this.loading = false; }
    });
  }
}
