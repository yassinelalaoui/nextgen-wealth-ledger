import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatTooltipModule } from '@angular/material/tooltip';

import { AccountService } from '../../core/services/account.service';
import { ToastService } from '../../core/services/toast.service';
import { WalletDTO } from '../../core/models/wallet.model';
import { ActiveWalletDialogComponent } from './current-account-dialog.component';
import { StashWalletDialogComponent } from './saving-account-dialog.component';
import { fadeInUp, listStagger } from '../../shared/animations';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatTableModule, MatPaginatorModule, MatInputModule, MatFormFieldModule,
    MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule,
    MatSelectModule, MatChipsModule, MatMenuModule, MatTooltipModule
  ],
  animations: [fadeInUp, listStagger],
  template: `
    <div class="page-container" [@fadeInUp]>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px">
        <h1 class="page-title">
          <mat-icon>account_balance_wallet</mat-icon> Bank Accounts
        </h1>
        <button mat-flat-button color="primary" [matMenuTriggerFor]="newMenu">
          <mat-icon>add</mat-icon> New Account <mat-icon>arrow_drop_down</mat-icon>
        </button>
        <mat-menu #newMenu="matMenu">
          <button mat-menu-item (click)="openCurrentDialog()">
            <mat-icon>credit_card</mat-icon> Current Account
          </button>
          <button mat-menu-item (click)="openSavingDialog()">
            <mat-icon>savings</mat-icon> Saving Account
          </button>
        </mat-menu>
      </div>

      <mat-card>
        <mat-card-content>
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-bottom:16px">
            <mat-form-field appearance="outline" style="flex:1;min-width:200px">
              <mat-label>Search wallets</mat-label>
              <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)" placeholder="Search by ID, client...">
              <mat-icon matSuffix>search</mat-icon>
            </mat-form-field>
          </div>

          <div *ngIf="loading" class="text-center py-4"><mat-spinner style="margin:0 auto" diameter="40"></mat-spinner></div>

          <div *ngIf="!loading && wallets.length === 0" class="empty-state">
            <mat-icon>account_balance_wallet</mat-icon>
            <div class="empty-title">No wallets yet</div>
            <div class="empty-subtitle">{{ searchTerm ? 'No wallets match your search.' : 'Create a current or saving account to get started.' }}</div>
            <button *ngIf="!searchTerm" mat-flat-button color="primary" [matMenuTriggerFor]="emptyMenu">
              <mat-icon>add</mat-icon> New Account
            </button>
            <mat-menu #emptyMenu="matMenu">
              <button mat-menu-item (click)="openCurrentDialog()"><mat-icon>credit_card</mat-icon> Current Account</button>
              <button mat-menu-item (click)="openSavingDialog()"><mat-icon>savings</mat-icon> Saving Account</button>
            </mat-menu>
          </div>

          <table mat-table [dataSource]="wallets" *ngIf="!loading && wallets.length > 0" [@listStagger]="wallets.length">
            <ng-container matColumnDef="id">
              <th mat-header-cell *matHeaderCellDef>Account ID</th>
              <td mat-cell *matCellDef="let a" style="font-family:monospace;font-size:.8rem;max-width:180px;overflow:hidden;text-overflow:ellipsis">{{ a.id }}</td>
            </ng-container>
            <ng-container matColumnDef="type">
              <th mat-header-cell *matHeaderCellDef>Type</th>
              <td mat-cell *matCellDef="let a">
                <mat-chip [color]="a.type === 'ActiveWallet' ? 'primary' : 'accent'" highlighted>
                  {{ a.type === 'ActiveWallet' ? 'Current' : 'Saving' }}
                </mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="client">
              <th mat-header-cell *matHeaderCellDef>Client</th>
              <td mat-cell *matCellDef="let a">
                <a [routerLink]="['/clients', a.clientDTO?.id]">{{ a.clientDTO?.name }}</a>
              </td>
            </ng-container>
            <ng-container matColumnDef="balance">
              <th mat-header-cell *matHeaderCellDef style="text-align:right">Balance</th>
              <td mat-cell *matCellDef="let a" style="text-align:right;font-weight:600">
                {{ a.balance | currency:'MAD':'symbol':'1.2-2' }}
              </td>
            </ng-container>
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let a">
                <mat-chip [color]="a.status === 'ACTIVATED' ? 'primary' : 'warn'" highlighted>{{ a.status }}</mat-chip>
              </td>
            </ng-container>
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef style="text-align:right">Actions</th>
              <td mat-cell *matCellDef="let a" style="text-align:right">
                <a mat-icon-button color="primary" [routerLink]="['/wallets', a.id]" matTooltip="View detail">
                  <mat-icon>visibility</mat-icon>
                </a>
              </td>
            </ng-container>
            <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
          </table>

          <mat-paginator
            [length]="totalElements"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25]"
            (page)="onPageChange($event)"
            [hidden]="!loading && wallets.length === 0"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class AccountsComponent implements OnInit {
  displayedColumns = ['id', 'type', 'client', 'balance', 'status', 'actions'];
  wallets: WalletDTO[] = [];
  loading = false;
  searchTerm = '';
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;

  private searchSubject = new Subject<string>();

  constructor(
    private accountService: AccountService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 0;
      this.loadAccounts();
    });
    this.loadAccounts();
  }

  loadAccounts() {
    this.loading = true;
    this.accountService.search(this.searchTerm, this.currentPage, this.pageSize).subscribe({
      next: page => {
        this.wallets = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(term: string) { this.searchSubject.next(term); }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAccounts();
  }

  openCurrentDialog() {
    const ref = this.dialog.open(ActiveWalletDialogComponent, { width: '440px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.accountService.createCurrent(result).subscribe({
          next: () => { this.toastService.success('Current account created'); this.loadAccounts(); },
          error: () => {}
        });
      }
    });
  }

  openSavingDialog() {
    const ref = this.dialog.open(StashWalletDialogComponent, { width: '440px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.accountService.createSaving(result).subscribe({
          next: () => { this.toastService.success('Saving account created'); this.loadAccounts(); },
          error: () => {}
        });
      }
    });
  }
}
