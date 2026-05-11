import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';

import { ClientService } from '../../core/services/client.service';
import { ToastService } from '../../core/services/toast.service';
import { ClientDTO } from '../../core/models/client.model';
import { ClientFormDialogComponent } from './client-form-dialog.component';
import { ConfirmDialogComponent } from '../../shared/dialogs/confirm-dialog.component';
import { fadeInUp, listStagger } from '../../shared/animations';

@Component({
  selector: 'app-clients',
  standalone: true,
  imports: [
    CommonModule, FormsModule, RouterLink,
    MatTableModule, MatPaginatorModule, MatInputModule, MatFormFieldModule,
    MatButtonModule, MatIconModule, MatCardModule, MatProgressSpinnerModule, MatTooltipModule
  ],
  animations: [fadeInUp, listStagger],
  template: `
    <div class="page-container" [@fadeInUp]>
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:24px;flex-wrap:wrap;gap:12px">
        <h1 class="page-title">
          <mat-icon>people</mat-icon> Clients
        </h1>
        <button mat-flat-button color="primary" (click)="openCreateDialog()">
          <mat-icon>add</mat-icon> New Client
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <mat-form-field appearance="outline" style="width:100%;margin-bottom:16px">
            <mat-label>Search clients</mat-label>
            <input matInput [(ngModel)]="searchTerm" (ngModelChange)="onSearch($event)" placeholder="Search by name or email...">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          <div *ngIf="loading" class="text-center py-4"><mat-spinner style="margin:0 auto" diameter="40"></mat-spinner></div>

          <ng-container *ngIf="!loading">
            <div *ngIf="clients.length === 0" class="empty-state">
              <mat-icon>people_outline</mat-icon>
              <div class="empty-title">No clients yet</div>
              <div class="empty-subtitle">{{ searchTerm ? 'No clients match your search.' : 'Get started by adding your first client.' }}</div>
              <button *ngIf="!searchTerm" mat-flat-button color="primary" (click)="openCreateDialog()">
                <mat-icon>add</mat-icon> Add Client
              </button>
            </div>

            <table mat-table [dataSource]="clients" *ngIf="clients.length > 0" [@listStagger]="clients.length">
              <ng-container matColumnDef="id">
                <th mat-header-cell *matHeaderCellDef>ID</th>
                <td mat-cell *matCellDef="let c">{{ c.id }}</td>
              </ng-container>
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Name</th>
                <td mat-cell *matCellDef="let c"><strong>{{ c.name }}</strong></td>
              </ng-container>
              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let c">{{ c.email }}</td>
              </ng-container>
              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef style="text-align:right">Actions</th>
                <td mat-cell *matCellDef="let c" style="text-align:right">
                  <a mat-icon-button color="primary" [routerLink]="['/clients', c.id]" matTooltip="View detail">
                    <mat-icon>visibility</mat-icon>
                  </a>
                  <button mat-icon-button color="accent" (click)="openEditDialog(c)" matTooltip="Edit">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="deleteClient(c)" matTooltip="Delete">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>
              <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
            </table>
          </ng-container>

          <mat-paginator
            [length]="totalElements"
            [pageSize]="pageSize"
            [pageSizeOptions]="[5, 10, 25]"
            (page)="onPageChange($event)"
            [hidden]="!loading && clients.length === 0"
            showFirstLastButtons>
          </mat-paginator>
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class ClientsComponent implements OnInit {
  displayedColumns = ['id', 'name', 'email', 'actions'];
  clients: ClientDTO[] = [];
  loading = false;
  searchTerm = '';
  totalElements = 0;
  pageSize = 10;
  currentPage = 0;

  private searchSubject = new Subject<string>();

  constructor(
    private clientService: ClientService,
    private toastService: ToastService,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe(() => {
      this.currentPage = 0;
      this.loadClients();
    });
    this.loadClients();
  }

  loadClients() {
    this.loading = true;
    this.clientService.search(this.searchTerm, this.currentPage, this.pageSize).subscribe({
      next: page => {
        this.clients = page.content;
        this.totalElements = page.totalElements;
        this.loading = false;
      },
      error: () => { this.loading = false; }
    });
  }

  onSearch(term: string) {
    this.searchSubject.next(term);
  }

  onPageChange(event: PageEvent) {
    this.currentPage = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadClients();
  }

  openCreateDialog() {
    const ref = this.dialog.open(ClientFormDialogComponent, { data: null, width: '400px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.clientService.create(result).subscribe({
          next: () => { this.toastService.success('Client created successfully'); this.loadClients(); },
          error: () => {}
        });
      }
    });
  }

  openEditDialog(client: ClientDTO) {
    const ref = this.dialog.open(ClientFormDialogComponent, { data: client, width: '400px' });
    ref.afterClosed().subscribe(result => {
      if (result) {
        this.clientService.update(client.id, result).subscribe({
          next: () => { this.toastService.success('Client updated successfully'); this.loadClients(); },
          error: () => {}
        });
      }
    });
  }

  deleteClient(client: ClientDTO) {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: { title: 'Delete Client', message: `Delete "${client.name}"? This will also remove their wallets.` }
    });
    ref.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.clientService.delete(client.id).subscribe({
          next: () => { this.toastService.success('Client deleted'); this.loadClients(); },
          error: () => {}
        });
      }
    });
  }
}
