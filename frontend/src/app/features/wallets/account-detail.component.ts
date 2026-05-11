import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialog } from '@angular/material/dialog';

import { AccountService } from '../../core/services/account.service';
import { ToastService } from '../../core/services/toast.service';
import { WalletDTO, ActiveWalletDTO, StashWalletDTO } from '../../core/models/wallet.model';
import { AccountHistoryDTO, LedgerEntryDTO } from '../../core/models/ledger-entry.model';
import { DebitDialogComponent } from './debit-dialog.component';
import { CreditDialogComponent } from './credit-dialog.component';
import { TransferDialogComponent } from './transfer-dialog.component';
import { fadeInUp, listStagger } from '../../shared/animations';

@Component({
  selector: 'app-account-detail',
  standalone: true,
  imports: [
    CommonModule, RouterLink,
    MatCardModule, MatTabsModule, MatTableModule, MatPaginatorModule,
    MatButtonModule, MatIconModule, MatChipsModule, MatProgressSpinnerModule
  ],
  animations: [fadeInUp, listStagger],
  template: `
    <div class="page-container" [@fadeInUp]>
      <a mat-button routerLink="/wallets" style="margin-bottom:16px;display:inline-flex;align-items:center">
        <mat-icon>arrow_back</mat-icon> Back to Accounts
      </a>

      <div *ngIf="loading" class="text-center py-5"><mat-spinner style="margin:0 auto"></mat-spinner></div>

      <ng-container *ngIf="!loading && account">
        <!-- Header -->
        <mat-card class="mb-4">
          <mat-card-header>
            <mat-card-title style="font-family:monospace;font-size:1rem">{{ account.id }}</mat-card-title>
            <mat-card-subtitle>
              <mat-chip-set>
                <mat-chip [color]="account.type === 'ActiveWallet' ? 'primary' : 'accent'" highlighted>
                  {{ account.type === 'ActiveWallet' ? 'Current Account' : 'Saving Account' }}
                </mat-chip>
                <mat-chip [color]="account.status === 'ACTIVATED' ? 'primary' : 'warn'" highlighted>
                  {{ account.status }}
                </mat-chip>
              </mat-chip-set>
            </mat-card-subtitle>
          </mat-card-header>
          <mat-card-content style="padding-top:16px">
            <div class="row">
              <div class="col-md-4">
                <div style="font-size:.85rem;color:#777">Balance</div>
                <div style="font-size:2rem;font-weight:700;color:#3f51b5">{{ account.balance | currency:'MAD':'symbol':'1.2-2' }}</div>
              </div>
              <div class="col-md-4">
                <div style="font-size:.85rem;color:#777">Client</div>
                <div style="font-size:1.1rem">
                  <a [routerLink]="['/clients', account.clientDTO.id]">{{ account.clientDTO.name }}</a>
                </div>
              </div>
              <div class="col-md-4">
                <div style="font-size:.85rem;color:#777">{{ account.type === 'ActiveWallet' ? 'Overdraft Limit' : 'Interest Rate' }}</div>
                <div style="font-size:1.1rem">
                  <span *ngIf="isActiveWallet">{{ asCurrent(account).overDraft | currency:'MAD':'symbol':'1.2-2' }}</span>
                  <span *ngIf="!isActiveWallet">{{ asSaving(account).interestRate }}%</span>
                </div>
              </div>
            </div>
          </mat-card-content>
          <mat-card-actions>
            <button mat-flat-button color="warn" (click)="openDebit()"><mat-icon>remove_circle</mat-icon> Debit</button>
            <button mat-flat-button color="primary" (click)="openCredit()"><mat-icon>add_circle</mat-icon> Credit</button>
            <button mat-flat-button color="accent" (click)="openTransfer()"><mat-icon>swap_horiz</mat-icon> Transfer</button>
          </mat-card-actions>
        </mat-card>

        <!-- Operations History -->
        <mat-card>
          <mat-card-header>
            <mat-card-title>Operation History</mat-card-title>
          </mat-card-header>
          <mat-card-content>
            <div *ngIf="historyLoading" class="text-center py-4"><mat-spinner diameter="36" style="margin:0 auto"></mat-spinner></div>

            <div *ngIf="!historyLoading && ledgerEntries.length === 0" class="empty-state">
              <mat-icon>receipt_long</mat-icon>
              <div class="empty-title">No ledgerEntries yet</div>
              <div class="empty-subtitle">Run a debit, credit or transfer to populate the history.</div>
            </div>

            <table mat-table [dataSource]="ledgerEntries" *ngIf="!historyLoading && ledgerEntries.length > 0" style="width:100%" [@listStagger]="ledgerEntries.length">
              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Date</th>
                <td mat-cell *matCellDef="let op">{{ op.operationDate | date:'dd/MM/yyyy HH:mm' }}</td>
              </ng-container>
              <ng-container matColumnDef="type">
                <th mat-header-cell *matHeaderCellDef>Type</th>
                <td mat-cell *matCellDef="let op">
                  <mat-chip [color]="op.type === 'CREDIT' ? 'primary' : 'warn'" highlighted>{{ op.type }}</mat-chip>
                </td>
              </ng-container>
              <ng-container matColumnDef="amount">
                <th mat-header-cell *matHeaderCellDef style="text-align:right">Amount</th>
                <td mat-cell *matCellDef="let op" style="text-align:right">
                  <span [class]="op.type === 'CREDIT' ? 'amount-credit' : 'amount-debit'">
                    {{ op.type === 'CREDIT' ? '+' : '-' }}{{ op.amount | currency:'MAD':'symbol':'1.2-2' }}
                  </span>
                </td>
              </ng-container>
              <ng-container matColumnDef="description">
                <th mat-header-cell *matHeaderCellDef>Description</th>
                <td mat-cell *matCellDef="let op">{{ op.description }}</td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="opColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: opColumns;"></tr>
            </table>

            <mat-paginator
              [length]="totalOps"
              [pageSize]="opPageSize"
              [pageSizeOptions]="[5, 10, 20]"
              (page)="onOpPage($event)"
              [hidden]="!historyLoading && ledgerEntries.length === 0"
              showFirstLastButtons>
            </mat-paginator>
          </mat-card-content>
        </mat-card>
      </ng-container>
    </div>
  `
})
export class AccountDetailComponent implements OnInit {
  loading = true;
  historyLoading = false;
  account: WalletDTO | null = null;
  ledgerEntries: LedgerEntryDTO[] = [];
  opColumns = ['date', 'type', 'amount', 'description'];
  totalOps = 0;
  opPageSize = 5;
  opPage = 0;
  get isActiveWallet() { return this.account?.type === 'ActiveWallet'; }
  asCurrent(a: WalletDTO) { return a as ActiveWalletDTO; }
  asSaving(a: WalletDTO) { return a as StashWalletDTO; }

  constructor(
    private route: ActivatedRoute,
    private accountService: AccountService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.accountService.get(id).subscribe({
      next: acc => { this.account = acc; this.loading = false; this.loadHistory(); },
      error: () => { this.loading = false; }
    });
  }

  loadHistory() {
    this.historyLoading = true;
    const id = this.account!.id;
    this.accountService.history(id, this.opPage, this.opPageSize).subscribe({
      next: h => {
        this.ledgerEntries = h.ledgerEntryDTOS;
        this.totalOps = h.totalPages * this.opPageSize;
        this.historyLoading = false;
      },
      error: () => { this.historyLoading = false; }
    });
  }

  onOpPage(event: PageEvent) {
    this.opPage = event.pageIndex;
    this.opPageSize = event.pageSize;
    this.loadHistory();
  }

  openDebit() {
    const ref = this.dialog.open(DebitDialogComponent, { data: this.account!.id, width: '380px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.accountService.debit(result).subscribe({
          next: () => { this.toastService.success('Debit successful'); this.refreshAccount(); },
          error: () => {}
        });
      }
    });
  }

  openCredit() {
    const ref = this.dialog.open(CreditDialogComponent, { data: this.account!.id, width: '380px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.accountService.credit(result).subscribe({
          next: () => { this.toastService.success('Credit successful'); this.refreshAccount(); },
          error: () => {}
        });
      }
    });
  }

  openTransfer() {
    const ref = this.dialog.open(TransferDialogComponent, { data: this.account!.id, width: '420px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.accountService.transfer(result).subscribe({
          next: () => { this.toastService.success('Transfer successful'); this.refreshAccount(); },
          error: () => {}
        });
      }
    });
  }

  private refreshAccount() {
    this.accountService.get(this.account!.id).subscribe(acc => { this.account = acc; this.loadHistory(); });
  }
}
